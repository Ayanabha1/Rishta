"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Phone, MapPin, Wrench } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import { IEstimateDetail } from "@/interfaces/IEstimate";

export default function EstimateDetailPage() {
  const params = useParams();
  const [estimate, setEstimate] = useState<IEstimateDetail>();
  const [loading, setLoading] = useState(true);

  const getEstimate = async () => {
    try {
      setLoading(true);
      const data = await API.get(
        `/getSiteEstimate?siteestimateid=${params.id}`
      );
      setEstimate(data.data.data.data);
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) getEstimate();
  }, [params.id]);

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
                    {estimate.product_interest?.split("|##|").join(", ") ||
                      "-"}
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
          </div>
        )}
      </div>
    </div>
  );
}
