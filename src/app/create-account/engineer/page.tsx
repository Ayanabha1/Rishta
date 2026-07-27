"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { API } from "@/lib/axios";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import errorHandler from "@/lib/error-handler";

export default function CreateEngineerAccount() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    address_line_1: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    zip_code: "",
    date_of_birth: "",
    nominee_name: "",
    relation_with_nominee: "",
    nominee_contact_no: "",
    anniversary_date: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mobile_number = localStorage.getItem("mobile_number");
    if (!mobile_number) {
      showErrorToast("Mobile number not found");
      router.push("/sign-in");
      localStorage.removeItem("access_token");
      localStorage.removeItem("registered");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(accountInfo).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      formData.append("phone_number", mobile_number);

      await API.post("/createEngineer", formData);
      showSuccessToast("Account created successfully");
      localStorage.setItem("registered", "true");
      router.push("/");
    } catch (error: any) {
      errorHandler(error);
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setAccountInfo((prev) => ({
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
            <span className="text-black font-medium">Create Account</span>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-scroll h-[99%] w-full pb-24"
        >
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-black mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Manoj"
                  value={accountInfo.first_name}
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
                  htmlFor="last_name"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Sarkar"
                  value={accountInfo.last_name}
                  onChange={handleChange}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^\p{L}\s]/gu,
                      ""
                    );
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email_address"
                className="block text-sm font-medium text-black mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email_address"
                name="email_address"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="engineer@example.com"
                value={accountInfo.email_address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="date_of_birth"
                className="block text-sm font-medium text-black mb-1"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                value={accountInfo.date_of_birth}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">Address</h2>

            <div>
              <label
                htmlFor="address_line_1"
                className="block text-sm font-medium text-black mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address_line_1"
                name="address_line_1"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="12 MG Road, Near Bus Stand"
                value={accountInfo.address_line_1}
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
                  placeholder="Delhi"
                  value={accountInfo.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-black mb-1"
                >
                  District
                </label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Delhi"
                  value={accountInfo.district}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="West Bengal"
                  value={accountInfo.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="zip_code"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Pin Code
                </label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  required
                  minLength={6}
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="700001"
                  value={accountInfo.zip_code}
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
                htmlFor="country"
                className="block text-sm font-medium text-black mb-1"
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                name="country"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                value={accountInfo.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Nominee Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">Nominee Details</h2>

            <div>
              <label
                htmlFor="nominee_name"
                className="block text-sm font-medium text-black mb-1"
              >
                Nominee Name
              </label>
              <input
                type="text"
                id="nominee_name"
                name="nominee_name"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Mark"
                value={accountInfo.nominee_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="relation_with_nominee"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Relation with Nominee
                </label>
                <input
                  type="text"
                  id="relation_with_nominee"
                  name="relation_with_nominee"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Friend"
                  value={accountInfo.relation_with_nominee}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="nominee_contact_no"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Nominee Contact No.
                </label>
                <input
                  type="tel"
                  id="nominee_contact_no"
                  name="nominee_contact_no"
                  required
                  minLength={10}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="9831254567"
                  value={accountInfo.nominee_contact_no}
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
                htmlFor="anniversary_date"
                className="block text-sm font-medium text-black mb-1"
              >
                Anniversary Date (optional)
              </label>
              <input
                type="date"
                id="anniversary_date"
                name="anniversary_date"
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                value={accountInfo.anniversary_date}
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
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
