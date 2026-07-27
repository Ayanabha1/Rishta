"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Phone, MapPin, Wrench, ImageIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import { IEstimateDetail, IFileInfo } from "@/interfaces/IEstimate";

interface FilePreview {
  id: string;
  title: string;
  url: string;
  loading: boolean;
}

export default function EstimateDetailPage() {
  const params = useParams();
  const [estimate, setEstimate] = useState<IEstimateDetail>();
  const [loading, setLoading] = useState(true);
  const [newFiles, setNewFiles] = useState<Array<{ name: string; data: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8 my-4 sticky top-0 z-10">
          <Link
            href="/"
            className="rounded-full p-2 hover:bg-black/5 transition-colors bg-white/40 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Link>
          <div className="px-4 py-2 rounded-full bg-white/50 backdrop-blur-md">
            <span className="text-black font-medium">
              {estimate?.siteestimate_no || "Estimate"}
            </span>
          </div>
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
            {/* Header card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-black">
                  {estimate.customer_name}
                </h1>
                {estimate.lead_status && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      estimate.lead_status === "New"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    } text-black`}
                  >
                    {estimate.lead_status}
                  </span>
                )}
              </div>
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
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-pink-500" />
                <span className="text-black/80">
                  Salesperson: {estimate.salesperson_name || "Not assigned yet"}
                </span>
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