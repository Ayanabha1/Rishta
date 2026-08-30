"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Wrench,
  HardHat,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Select from "react-select/async";
import debounce from "debounce-promise";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { useUserStore } from "@/hooks/use-user";
import { IEstimateDetail, IFileInfo } from "@/interfaces/IEstimate";
import {
  LOST,
  LOST_REASONS,
  OPPORTUNITY_TEMPERATURES,
  QUOTATION_STAGES,
  QUOTATION_STATUSES,
  STAGE_ORDER,
  TEMPERATURE_PILL_CLASS,
  formatDate,
  formatFollowup,
  getNextStatuses,
  istNowTime,
  istToday,
  needsFollowup,
  requiredFieldsFor,
  stageIndex,
  statusPillClass,
} from "@/lib/lead-stages";

interface ISalesUpdateForm {
  opportunity_temperature: string;
  conversion_probability: string;
  actual_steel_qty: string;
  visit_notes: string;
  followup_date: string;
  followup_time: string;
  lost_reason: string;
  lost_reason_notes: string;
  quotation_status: string;
  dealer_id: string;
  lead_status: string;
}

const emptySalesForm: ISalesUpdateForm = {
  opportunity_temperature: "",
  conversion_probability: "",
  actual_steel_qty: "",
  visit_notes: "",
  followup_date: "",
  followup_time: "",
  lost_reason: "",
  lost_reason_notes: "",
  quotation_status: "",
  dealer_id: "",
  lead_status: "",
};

const FIELD_LABELS: Record<string, string> = {
  opportunity_temperature: "Opportunity Temperature",
  conversion_probability: "Conversion %",
  actual_steel_qty: "Actual Steel Qty",
  visit_notes: "Visit Notes",
  followup_date: "Follow-up Date",
  followup_time: "Follow-up Time",
  lost_reason: "Lost Reason",
  lost_reason_notes: "Lost Reason Notes",
  dealer_id: "Dealer",
  invoice_uploaded: "Invoice",
};

interface FilePreview {
  id: string;
  title: string;
  url: string;
  loading: boolean;
}

interface DealerOption {
  value: string;
  label: string;
}

export default function EstimateDetailPage() {
  const params = useParams();
  const user = useUserStore();
  const isSalesperson = user?.module === "Salespersons";
  const [estimate, setEstimate] = useState<IEstimateDetail>();
  const [loading, setLoading] = useState(true);
  const [newFiles, setNewFiles] = useState<Array<{ name: string; data: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [salesForm, setSalesForm] = useState<ISalesUpdateForm>(emptySalesForm);
  const [savingSalesForm, setSavingSalesForm] = useState(false);
  const [dealerOption, setDealerOption] = useState<DealerOption | null>(null);
  const [invoiceUploaded, setInvoiceUploaded] = useState(false);
  const [invoiceUploading, setInvoiceUploading] = useState(false);
  const [invoiceName, setInvoiceName] = useState("");
  const [notesExpanded, setNotesExpanded] = useState(false);

  const currentStatus = estimate?.lead_status || "";
  const nextStatuses = getNextStatuses(currentStatus);
  const targetStatus = salesForm.lead_status;
  const currentStageIndex = stageIndex(currentStatus);
  const nextStage = STAGE_ORDER[currentStageIndex + 1];

  const progressChips = [
    estimate?.opportunity_temperature && {
      label: estimate.opportunity_temperature,
      className:
        TEMPERATURE_PILL_CLASS[estimate.opportunity_temperature] ||
        "bg-gray-100 text-gray-800",
    },
    estimate?.conversion_probability != null && {
      label: `${estimate.conversion_probability}% likely`,
      className: "bg-purple-100 text-purple-800",
    },
    estimate?.quotation_status && {
      label: `Quotation: ${estimate.quotation_status}`,
      className: "bg-blue-100 text-blue-800",
    },
  ].filter(Boolean) as Array<{ label: string; className: string }>;

  const progressFacts = [
    estimate?.actual_steel_qty && {
      label: "Actual Steel Qty",
      value: estimate.actual_steel_qty,
    },
    estimate?.visit_date && {
      label: "Last Visit",
      value: formatDate(estimate.visit_date),
    },
    estimate?.followup_date && {
      label: "Next Follow-up",
      value: formatFollowup(estimate.followup_date, estimate.followup_time),
    },
    estimate?.dealer_name && {
      label: "Dealer",
      value: estimate.dealer_name,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const fetchFileAsBlob = async (fileInfo: IFileInfo) => {
    try {
      const token = localStorage.getItem("access_token");
      const deviceId = localStorage.getItem("device_id");
      const authHeader: Record<string, string> = {};
      if (token) authHeader.accessToken = token;
      if (deviceId) authHeader.deviceId = deviceId;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getSiteEstimateFile?id=${fileInfo.id}`,
        {
          headers: {
            Authorization: JSON.stringify(authHeader),
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch file");
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Failed to load file", fileInfo.id, err);
      return "";
    }
  };

  const getEstimate = useCallback(async () => {
    try {
      setLoading(true);
      const data = await API.get(
        `/getSiteEstimate?siteestimateid=${params.id}`
      );
      const est = data.data.data.data as IEstimateDetail;
      setEstimate(est);
      // A stored follow-up in the past can no longer be resent, so only
      // carry it over when it is still valid.
      const storedFollowup = est.followup_date || "";
      setSalesForm({
        ...emptySalesForm,
        opportunity_temperature: est.opportunity_temperature || "",
        conversion_probability:
          est.conversion_probability != null
            ? String(est.conversion_probability)
            : "",
        actual_steel_qty: est.actual_steel_qty || "",
        visit_notes: est.visit_notes || "",
        followup_date: storedFollowup >= istToday() ? storedFollowup : "",
        quotation_status: est.quotation_status || "",
        // lead_status is the target of this update, not the current one.
        lead_status: "",
      });
      setDealerOption(null);
      setInvoiceUploaded(false);
      setInvoiceName("");

      // Load file thumbnails
      if (est?.list_of_files && est.list_of_files.length > 0) {
        const previews: FilePreview[] = est.list_of_files.map((f) => ({
          id: f.id,
          title: f.title,
          url: "",
          loading: true,
        }));
        setFilePreviews(previews);

        // Fetch each file as blob in parallel
        const results = await Promise.allSettled(
          est.list_of_files.map((f) => fetchFileAsBlob(f))
        );
        setFilePreviews(
          results.map((r, i) => ({
            id: est.list_of_files![i].id,
            title: est.list_of_files![i].title,
            url: r.status === "fulfilled" ? r.value : "",
            loading: false,
          }))
        );
      }
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const handleSalesFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSalesForm((prev) => ({ ...prev, [name]: value }));
  };

  const searchDealers = debounce(async (query: string) => {
    if (!query) return [];
    try {
      const res = await API.get(`/searchAccount?query=${query}`);
      return (res.data.data || []).map(
        (item: { accountid: string; accountname: string }) => ({
          value: String(item.accountid),
          label: item.accountname,
        })
      );
    } catch (error) {
      console.error("Error searching dealers:", error);
      return [];
    }
  }, 1000);

  const handleInvoiceUpload = async (file: File) => {
    if (!params.id) return;
    setInvoiceUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
      const fd = new FormData();
      fd.append("image", dataUrl);
      fd.append("filename", file.name);
      fd.append("siteestimateid", String(params.id));
      fd.append("documentType", "invoice");
      await API.post("/uploadFile", fd);
      setInvoiceUploaded(true);
      setInvoiceName(file.name);
      showSuccessToast("Invoice uploaded");
    } catch (error) {
      setInvoiceUploaded(false);
      setInvoiceName("");
      errorHandler(error);
    } finally {
      setInvoiceUploading(false);
    }
  };

  // Mirrors the backend rules: only the fields the target status needs are
  // sent, and the follow-up must not be in the past (IST).
  const validateSalesForm = (): string | null => {
    const missing = requiredFieldsFor(targetStatus).filter((field) =>
      field === "invoice_uploaded"
        ? !invoiceUploaded
        : !salesForm[field as keyof ISalesUpdateForm]
    );
    if (missing.length) {
      return `${missing.map((f) => FIELD_LABELS[f] || f).join(", ")} required`;
    }

    if (needsFollowup(targetStatus)) {
      const today = istToday();
      if (salesForm.followup_date < today) {
        return "Follow-up date cannot be in the past";
      }
      if (
        salesForm.followup_date === today &&
        salesForm.followup_time.slice(0, 5) <= istNowTime()
      ) {
        return "Follow-up time must be later than the current time";
      }
    }

    if (targetStatus === "Visited") {
      const pct = Number(salesForm.conversion_probability);
      if (!Number.isInteger(pct) || pct < 0 || pct > 100) {
        return "Conversion % must be a whole number between 0 and 100";
      }
    }

    return null;
  };

  const handleSalesFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.id || !targetStatus) return;

    const validationError = validateSalesForm();
    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    setSavingSalesForm(true);
    try {
      const formData = new FormData();
      formData.append("id", String(params.id));
      formData.append("lead_status", targetStatus);
      requiredFieldsFor(targetStatus).forEach((field) => {
        if (field === "invoice_uploaded") {
          formData.append("invoice_uploaded", "on");
          return;
        }
        formData.append(field, salesForm[field as keyof ISalesUpdateForm]);
      });
      // Only sent from the stages where the field is offered.
      if (
        QUOTATION_STAGES.includes(targetStatus) &&
        salesForm.quotation_status
      ) {
        formData.append("quotation_status", salesForm.quotation_status);
      }
      await API.post("/updateSiteEstimate", formData);
      showSuccessToast("Estimate updated successfully");
      getEstimate();
    } catch (error) {
      errorHandler(error);
    } finally {
      setSavingSalesForm(false);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach((fp) => {
        if (fp.url) URL.revokeObjectURL(fp.url);
      });
    };
  }, []);

  useEffect(() => {
    if (params.id) getEstimate();
  }, [params.id, getEstimate]);

  return (
    <div className="h-full w-full glassmorphic-card shadow-2xl overflow-y-hidden">
      <div className="relative h-full mx-auto pb-10 p-4">
        {/* Header — stays visible so the current stage is always on screen */}
        <div className="mb-6 my-4 sticky top-0 z-10 space-y-2">
          <div className="flex justify-between items-center gap-2">
            <Link
              href="/"
              className="rounded-full p-2 hover:bg-black/5 transition-colors bg-white/40 backdrop-blur-md flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-black" />
            </Link>
            <div className="px-4 py-2 rounded-full bg-white/50 backdrop-blur-md flex items-center gap-2 min-w-0">
              <span className="text-black font-medium flex-shrink-0">
                {estimate?.siteestimate_no || "Estimate"}
              </span>
              {currentStatus && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium truncate ${statusPillClass(
                    currentStatus
                  )}`}
                >
                  {currentStatus}
                </span>
              )}
            </div>
          </div>

          {currentStageIndex >= 0 && (
            <div className="rounded-full bg-white/50 backdrop-blur-md px-3 py-2 space-y-1.5">
              <div className="flex gap-1">
                {STAGE_ORDER.map((stage, i) => (
                  <span
                    key={stage}
                    title={stage}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < currentStageIndex
                        ? "bg-purple-400"
                        : i === currentStageIndex
                        ? "bg-purple-700"
                        : "bg-black/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-black/60 leading-none truncate">
                Stage {currentStageIndex + 1} of {STAGE_ORDER.length}
                {nextStage ? ` · Next: ${nextStage}` : " · Final stage"}
              </p>
            </div>
          )}

          {currentStatus === LOST && (
            <div className="rounded-full bg-red-100 px-3 py-1.5">
              <p className="text-[11px] text-red-800 leading-none">
                Lead marked Lost
                {estimate?.lost_reason ? ` · ${estimate.lost_reason}` : ""}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : !estimate ? (
          <p className="text-black/70 text-center py-16">
            Estimate not found
          </p>
        ) : (
          <div className="space-y-6 overflow-y-scroll h-[99%] w-full pb-24">
            {/* Header card — status lives in the sticky bar above */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-black">
                {estimate.customer_name}
              </h1>
              <p className="text-black/60">{estimate.customer_type}</p>
            </div>

            {/* Customer Information */}
            <div className="space-y-4 bg-white/20 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-black">
                Customer Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-pink-500" />
                  <span className="text-black/80">
                    {estimate.mobile_number}
                    {estimate.alternate_number
                      ? ` / ${estimate.alternate_number}`
                      : ""}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-pink-500" />
                  <span className="text-black/80">
                    {estimate.site_address}, {estimate.city} -{" "}
                    {estimate.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4 bg-white/20 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-black">
                Project Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-black/50">Project Type</p>
                  <p className="text-black font-medium">
                    {estimate.project_type || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black/50">Construction Stage</p>
                  <p className="text-black font-medium">
                    {estimate.construction_stage || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black/50">Approx. Steel Qty</p>
                  <p className="text-black font-medium">
                    {estimate.approx_steel_qty || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-black/50">Purchase Timeline</p>
                  <p className="text-black font-medium">
                    {estimate.purchase_timeline || "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-black/50">Product Interest</p>
                  <p className="text-black font-medium">
                    {estimate.product_interest
                      ? estimate.product_interest.includes("|##|")
                        ? estimate.product_interest.split("|##|").join(", ")
                        : estimate.product_interest
                            .split(",")
                            .map((s) => s.trim())
                            .join(", ")
                      : "-"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-black/50">Competitor Brand</p>
                  <p className="text-black font-medium">
                    {estimate.competitor_brand || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-4 bg-white/20 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-black">Assignment</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-pink-500" />
                  <span className="text-black/80">
                    Salesperson:{" "}
                    {estimate.salesperson_name || "Not assigned yet"}
                  </span>
                </div>
                {estimate.engineer_name && (
                  <div className="flex items-center gap-3">
                    <HardHat className="w-5 h-5 text-pink-500" />
                    <span className="text-black/80">
                      Engineer: {estimate.engineer_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {estimate.engineer_notes && (
              <div className="space-y-2 bg-white/20 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-black">
                  Engineer Notes
                </h2>
                <p className="text-black/80 text-sm">
                  {estimate.engineer_notes}
                </p>
              </div>
            )}

            {/* Sales Progress — what each completed stage recorded.
                Empty fields are skipped so a fresh lead stays uncluttered. */}
            {(progressChips.length > 0 ||
              progressFacts.length > 0 ||
              estimate.visit_notes ||
              currentStatus === LOST) && (
              <div className="space-y-3 bg-white/20 rounded-2xl p-4">
                <h2 className="text-lg font-bold text-black">Sales Progress</h2>

                {progressChips.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {progressChips.map((chip) => (
                      <span
                        key={chip.label}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${chip.className}`}
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}

                {progressFacts.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {progressFacts.map((fact) => (
                      <div key={fact.label}>
                        <p className="text-black/50">{fact.label}</p>
                        <p className="text-black font-medium">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {estimate.visit_notes && (
                  <div className="text-sm">
                    <p className="text-black/50">Visit Notes</p>
                    <p
                      className={`text-black/80 ${
                        notesExpanded ? "" : "line-clamp-2"
                      }`}
                    >
                      {estimate.visit_notes}
                    </p>
                    {estimate.visit_notes.length > 90 && (
                      <button
                        type="button"
                        onClick={() => setNotesExpanded((prev) => !prev)}
                        className="text-xs text-purple-700 font-medium mt-0.5"
                      >
                        {notesExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}

                {currentStatus === LOST && estimate.lost_reason && (
                  <div className="text-sm bg-red-50 rounded-xl p-3">
                    <p className="text-red-800 font-medium">
                      Lost · {estimate.lost_reason}
                    </p>
                    {estimate.lost_reason_notes && (
                      <p className="text-red-800/80 mt-0.5">
                        {estimate.lost_reason_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {isSalesperson && (
              <form
                onSubmit={handleSalesFormSubmit}
                className="space-y-4 bg-white/20 rounded-2xl p-4"
              >
                <h2 className="text-lg font-bold text-black">
                  Update Estimate
                </h2>

                {nextStatuses.length === 0 ? (
                  <p className="text-black/70 text-sm">
                    This lead is at{" "}
                    <span className="font-medium">{estimate.lead_status}</span>.
                    No further updates are possible here.
                  </p>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Move Lead To
                      </label>
                      <select
                        name="lead_status"
                        value={salesForm.lead_status}
                        onChange={handleSalesFormChange}
                        className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black focus:outline-none focus:bg-white/60 transition-colors"
                      >
                        <option value="">Select next status</option>
                        {nextStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-black/50 mt-1">
                        Current status: {estimate.lead_status}
                      </p>
                    </div>

                    {needsFollowup(targetStatus) && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Follow-up Date
                            </label>
                            <input
                              type="date"
                              name="followup_date"
                              min={istToday()}
                              value={salesForm.followup_date}
                              onChange={handleSalesFormChange}
                              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black focus:outline-none focus:bg-white/60 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Follow-up Time
                            </label>
                            <input
                              type="time"
                              name="followup_time"
                              min={
                                salesForm.followup_date === istToday()
                                  ? istNowTime()
                                  : undefined
                              }
                              value={salesForm.followup_time}
                              onChange={handleSalesFormChange}
                              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black focus:outline-none focus:bg-white/60 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Visit Notes
                          </label>
                          <textarea
                            name="visit_notes"
                            rows={3}
                            value={salesForm.visit_notes}
                            onChange={handleSalesFormChange}
                            className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                            placeholder="Customer wants a revised quote for TMT bars."
                          />
                        </div>
                      </>
                    )}

                    {targetStatus === "Visited" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Opportunity Temperature
                            </label>
                            <select
                              name="opportunity_temperature"
                              value={salesForm.opportunity_temperature}
                              onChange={handleSalesFormChange}
                              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black focus:outline-none focus:bg-white/60 transition-colors"
                            >
                              <option value="">Select</option>
                              {OPPORTUNITY_TEMPERATURES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-1">
                              Conversion %
                            </label>
                            <input
                              type="number"
                              name="conversion_probability"
                              min={0}
                              max={100}
                              step={1}
                              value={salesForm.conversion_probability}
                              onChange={handleSalesFormChange}
                              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                              placeholder="80"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Actual Steel Qty
                          </label>
                          <input
                            type="text"
                            name="actual_steel_qty"
                            value={salesForm.actual_steel_qty}
                            onChange={handleSalesFormChange}
                            className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                            placeholder="2.5 MT"
                          />
                        </div>
                      </>
                    )}

                    {targetStatus === "Dealer Mapped" && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Dealer
                        </label>
                        <Select
                          instanceId="dealer-select"
                          cacheOptions
                          defaultOptions={false}
                          value={dealerOption}
                          loadOptions={searchDealers}
                          onChange={(option) => {
                            const selected = option as DealerOption | null;
                            setDealerOption(selected);
                            setSalesForm((prev) => ({
                              ...prev,
                              dealer_id: selected?.value || "",
                            }));
                          }}
                          placeholder="Search dealer by name"
                          noOptionsMessage={() => "Type to search dealers"}
                        />
                        <p className="text-xs text-black/50 mt-1">
                          Must be an active dealer.
                        </p>
                      </div>
                    )}

                    {targetStatus === "Sale Confirmed" && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-black">
                          Invoice
                        </label>
                        <input
                          id="invoice-input"
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.currentTarget.value = "";
                            if (file) handleInvoiceUpload(file);
                          }}
                        />
                        <label
                          htmlFor="invoice-input"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-white ${
                            invoiceUploading
                              ? "bg-purple-400 pointer-events-none"
                              : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                          }`}
                        >
                          {invoiceUploading
                            ? "Uploading..."
                            : invoiceUploaded
                            ? "Replace Invoice"
                            : "Upload Invoice"}
                        </label>
                        {invoiceUploaded && (
                          <p className="text-sm text-green-700">
                            Invoice uploaded ✓ {invoiceName}
                          </p>
                        )}
                        {!invoiceUploaded && (
                          <p className="text-xs text-black/50">
                            A PDF or image invoice is required before the sale
                            can be confirmed.
                          </p>
                        )}
                      </div>
                    )}

                    {targetStatus === LOST && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Lost Reason
                          </label>
                          <select
                            name="lost_reason"
                            value={salesForm.lost_reason}
                            onChange={handleSalesFormChange}
                            className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black focus:outline-none focus:bg-white/60 transition-colors"
                          >
                            <option value="">Select</option>
                            {LOST_REASONS.map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Lost Reason Notes
                          </label>
                          <textarea
                            name="lost_reason_notes"
                            rows={2}
                            value={salesForm.lost_reason_notes}
                            onChange={handleSalesFormChange}
                            className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                          />
                        </div>
                      </>
                    )}

                    {QUOTATION_STAGES.includes(targetStatus) && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Quotation Status
                        </label>
                        <select
                          name="quotation_status"
                          value={salesForm.quotation_status}
                          onChange={handleSalesFormChange}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black focus:outline-none focus:bg-white/60 transition-colors"
                        >
                          <option value="">Select</option>
                          {QUOTATION_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={
                        savingSalesForm || !targetStatus || invoiceUploading
                      }
                      className="w-full py-3 px-4 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingSalesForm ? "Saving..." : "Save Update"}
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="space-y-2 bg-white/20 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-black">Files</h2>

              {/* Display existing files as thumbnails */}
              {filePreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
                  {filePreviews.map((fp) => (
                    <div
                      key={fp.id}
                      className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white/40 cursor-pointer"
                      onClick={() => {
                        if (fp.url) {
                          setFullScreenImage(fp.url);
                        }
                      }}
                    >
                      {fp.loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                      ) : fp.url ? (
                        <img
                          src={fp.url}
                          alt={fp.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-black/40">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setUploadModalOpen(true)}
                className="mt-2 w-full py-3 px-4 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
              >
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* Full screen image overlay */}
        {fullScreenImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setFullScreenImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl z-10 hover:opacity-70"
              onClick={() => setFullScreenImage(null)}
            >
              ✕
            </button>
            <img
              src={fullScreenImage}
              alt="Full screen"
              className="max-w-full max-h-full object-contain p-4"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Upload file modal */}
        {uploadModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={() => {
              if (!uploading) {
                setUploadModalOpen(false);
                setNewFiles([]);
                setUploadMsg("");
              }
            }}
          >
            <div
              className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto p-6 pb-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black">Upload Files</h3>
                <button
                  disabled={uploading}
                  onClick={() => {
                    setUploadModalOpen(false);
                    setNewFiles([]);
                    setUploadMsg("");
                  }}
                  className="text-black/60 text-2xl hover:opacity-70 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>

              <input
                id="upload-modal-input"
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  const chosen = e.target.files;
                  if (!chosen) return;
                  const arr = Array.from(chosen);
                  const conv: Array<{ name: string; data: string }> = [];
                  for (const f of arr) {
                    const reader = new FileReader();
                    // eslint-disable-next-line no-await-in-loop
                    conv.push(await new Promise((res) => {
                      reader.onload = () => res({ name: f.name, data: String(reader.result) });
                      reader.readAsDataURL(f);
                    }));
                  }
                  setNewFiles((prev) => [...prev, ...conv]);
                  e.currentTarget.value = "";
                }}
                className="hidden"
              />
              <label
                htmlFor="upload-modal-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg shadow-md cursor-pointer"
              >
                Choose files
              </label>
              <span className="text-sm text-black/70 ml-2">
                {newFiles.length === 0 ? "No files chosen" : `${newFiles.length} file(s) selected`}
              </span>

              {newFiles.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {newFiles.map((f) => (
                    <div key={f.name} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={f.data}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => setNewFiles((p) => p.filter(x => x.name !== f.name))}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadMsg && (
                <div className="mt-3 px-3 py-2 bg-purple-50 rounded-lg text-sm text-purple-800">
                  {uploadMsg}
                </div>
              )}

              <button
                disabled={uploading || newFiles.length === 0}
                onClick={async () => {
                  if (!params.id) return;
                  setUploading(true);
                  setUploadMsg("Uploading files...");
                  for (let i = 0; i < newFiles.length; i++) {
                    const f = newFiles[i];
                    const fd = new FormData();
                    fd.append("image", f.data);
                    fd.append("filename", f.name);
                    fd.append("siteestimateid", String(params.id));
                    try {
                      setUploadMsg(`Uploading ${f.name} (${i + 1}/${newFiles.length})`);
                      // eslint-disable-next-line no-await-in-loop
                      await API.post("/uploadFile", fd);
                    } catch (err) {
                      console.error(err);
                    }
                  }
                  setUploading(false);
                  setUploadMsg("");
                  setNewFiles([]);
                  setUploadModalOpen(false);
                  // refresh estimate to show uploaded files
                  getEstimate();
                }}
                className="mt-4 w-full py-3 px-4 rounded-lg bg-purple-700 text-white font-semibold hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? uploadMsg || "Uploading..." : "Upload Files"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}