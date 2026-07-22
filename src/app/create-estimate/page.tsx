"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { API } from "@/lib/axios";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import errorHandler from "@/lib/error-handler";

export default function CreateEstimate() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimateInfo, setEstimateInfo] = useState({
    customer_name: "",
    mobile_number: "",
    customer_type: "Individual",
    site_address: "",
    pincode: "",
    city: "",
    state: "",
    project_type: "",
    construction_stage: "",
    approx_steel_qty: "",
    purchase_timeline: "",
    product_interest: "",
    competitor_brand: "",
  });
  const [productInterest, setProductInterest] = useState<string[]>([]);
  const router = useRouter();

  const PRODUCT_INTEREST_OPTIONS = [
    "TMT Bar",
    "Structural Steel",
    "Wire Rod",
    "Other",
  ];
  const PURCHASE_TIMELINE_OPTIONS = [
    "Immediate",
    "7 Days",
    "15 Days",
    "30 Days",
    "Future",
  ];

  const toggleProductInterest = (option: string) => {
    setProductInterest((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productInterest.length === 0) {
      showErrorToast("Select at least one product interest.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(estimateInfo).forEach(([key, value]) => {
        if (key === "product_interest") return;
        if (value) formData.append(key, value);
      });
      formData.append("product_interest", productInterest.join(","));

      await API.post("/createSiteEstimate", formData);
      showSuccessToast("Estimate created successfully");
      router.push("/");
    } catch (error: any) {
      errorHandler(error);
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEstimateInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
            <span className="text-black font-medium">Create Estimate</span>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-scroll h-[99%] w-full pb-24"
        >
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">
              Customer Information
            </h2>

            <div>
              <label
                htmlFor="customer_name"
                className="block text-sm font-medium text-black mb-1"
              >
                Customer Name
              </label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Amit Kumar"
                value={estimateInfo.customer_name}
                onChange={handleChange}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^\p{L}\s]/gu,
                    ""
                  );
                }}
              />
            </div>

            <div>
              <label
                htmlFor="mobile_number"
                className="block text-sm font-medium text-black mb-1"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile_number"
                name="mobile_number"
                required
                minLength={10}
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="8391976820"
                value={estimateInfo.mobile_number}
                onChange={handleChange}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^0-9]/g,
                    ""
                  );
                }}
              />
            </div>

            <div>
              <label
                htmlFor="customer_type"
                className="block text-sm font-medium text-black mb-1"
              >
                Customer Type
              </label>
              <select
                id="customer_type"
                name="customer_type"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                value={estimateInfo.customer_type}
                onChange={handleChange}
              >
                <option value="Individual">Individual</option>
                <option value="Contractor">Contractor</option>
                <option value="Builder">Builder</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="site_address"
                className="block text-sm font-medium text-black mb-1"
              >
                Site Address
              </label>
              <input
                type="text"
                id="site_address"
                name="site_address"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="123 Main Street, Sector 45"
                value={estimateInfo.site_address}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-black mb-1"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Bangalore"
                  value={estimateInfo.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Pin Code
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  required
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="560001"
                  value={estimateInfo.pincode}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^0-9]/g,
                      ""
                    );
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-black mb-1"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Karnataka"
                value={estimateInfo.state}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">Project Details</h2>

            <div>
              <label
                htmlFor="project_type"
                className="block text-sm font-medium text-black mb-1"
              >
                Project Type
              </label>
              <input
                type="text"
                id="project_type"
                name="project_type"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Residential"
                value={estimateInfo.project_type}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="construction_stage"
                className="block text-sm font-medium text-black mb-1"
              >
                Construction Stage
              </label>
              <input
                type="text"
                id="construction_stage"
                name="construction_stage"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Foundation"
                value={estimateInfo.construction_stage}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="approx_steel_qty"
                className="block text-sm font-medium text-black mb-1"
              >
                Approx. Steel Quantity
              </label>
              <input
                type="text"
                id="approx_steel_qty"
                name="approx_steel_qty"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="500 kg"
                value={estimateInfo.approx_steel_qty}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="purchase_timeline"
                className="block text-sm font-medium text-black mb-1"
              >
                Purchase Timeline
              </label>
              <select
                id="purchase_timeline"
                name="purchase_timeline"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                value={estimateInfo.purchase_timeline}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select timeline
                </option>
                {PURCHASE_TIMELINE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Product Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_INTEREST_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => toggleProductInterest(option)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm transition-colors",
                      productInterest.includes(option)
                        ? "bg-purple-600 text-white"
                        : "bg-white/50 backdrop-blur-sm text-black hover:bg-white/60"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="competitor_brand"
                className="block text-sm font-medium text-black mb-1"
              >
                Competitor Brand
              </label>
              <input
                type="text"
                id="competitor_brand"
                name="competitor_brand"
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="TATA Steel"
                value={estimateInfo.competitor_brand}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={cn(
              "w-full py-3 px-4 text-white rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg",
              {
                "opacity-50 cursor-not-allowed": loading,
              }
            )}
            disabled={loading}
          >
            Create Estimate
          </button>
        </form>
      </div>
    </div>
  );
}
