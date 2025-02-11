"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Check, ChevronsUpDown, X } from "lucide-react";
import Link from "next/link";
import Select from "react-select/async";
// import { debounce } from "lodash";
import debounce from "debounce-promise";
import axios from "axios";
import { API } from "@/lib/axios";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import errorHandler from "@/lib/error-handler";

export default function CreateAccount() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    accountname: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    mailingzip: "",
    owner_name: "",
    accountholdername: "",
    bankaccountnumber: "",
    ifsccode: "",
    bankname: "",
    accounttype: "Dealers",
    accountid: "",
  });
  const router = useRouter();
  const params = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const mobile_number = localStorage.getItem("mobile_number");
      if (!mobile_number) {
        showErrorToast("Mobile number not found");
        router.push("/sign-in");
        localStorage.removeItem("access_token");
        localStorage.removeItem("registered");
        return;
      }
      formData.append("owner_name", accountInfo.owner_name);
      formData.append("accountname", accountInfo.accountname);
      formData.append("address", accountInfo.address);
      formData.append("city", accountInfo.city);
      formData.append("mailingzip", accountInfo.mailingzip);
      formData.append("mobile", mobile_number);
      formData.append("accounttype", accountInfo.accounttype);
      formData.append("accountid", accountInfo.accountid);

      await API.post("/createDealer", formData);
      showSuccessToast("Account created successfully");
      localStorage.setItem("registered", "true");
      router.push("/");
    } catch (error: any) {
      setLoading(false);
      errorHandler(error);
    }
    setLoading(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getOptions = debounce(async (value) => {
    if (!value) {
      return Promise.resolve({ options: [] });
    }
    try {
      const res = await API.get(`/searchAccount?query=${value}`);
      const values = res.data.data.map((item: any) => ({
        value: item.accountid,
        label: item.accountname,
      }));
      return values;
    } catch (error: any) {
      console.error("Error fetching options:", error);
      showErrorToast(
        error.response.data.data.message || "Failed to search accounts."
      );

      return [];
    }
  }, 1000);

  const handleAccountChange = (selectedOption: any) => {
    if (selectedOption) {
      setAccountInfo((prev) => ({
        ...prev,
        accountid: selectedOption.value,
      }));
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full w-full glassmorphic-card shadow-2xl overflow-y-hidden">
      <div className="relative h-full mx-auto  pb-10 p-4">
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="owner_name"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Owner Name
                </label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Ayanabha"
                  value={accountInfo.owner_name}
                  onChange={handleChange}
                  onInput={(e) => {
                    const regex = /^[a-zA-Z ]*$/;
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^\p{L}\s]/gu,
                      ""
                    );
                  }}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.validity.patternMismatch) {
                      target.setCustomValidity(
                        "First name should only contain alphabets."
                      );
                    } else {
                      target.setCustomValidity("");
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-black mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="4545 Main Street"
                value={accountInfo.address}
                onChange={handleChange}
              />
            </div>

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
                placeholder="Mumbai"
                value={accountInfo.city}
                onChange={handleChange}
                pattern="[A-Za-z ]*"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^A-Za-z ]/g, "");
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.patternMismatch) {
                    target.setCustomValidity(
                      "City name should only contain letters and spaces."
                    );
                  } else {
                    target.setCustomValidity("");
                  }
                }}
              />
            </div>

            <div>
              <label
                htmlFor="mailingzip"
                className="block text-sm font-medium text-black mb-1"
              >
                Pin Code
              </label>
              <input
                type="text"
                id="mailingzip"
                name="mailingzip"
                required
                minLength={6}
                maxLength={6}
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="732846"
                value={accountInfo.mailingzip}
                onChange={handleChange}
                pattern="[0-9]{6}"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^0-9]/g, "");
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.patternMismatch) {
                    target.setCustomValidity(
                      "Pincode should be a 6-digit number."
                    );
                  } else {
                    target.setCustomValidity("");
                  }
                }}
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">
              Account Information
            </h2>

            <div>
              <label
                htmlFor="accounttype"
                className="block text-sm font-medium text-black mb-1"
              >
                Type
              </label>
              <select
                id="accounttype"
                name="accounttype"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                value={accountInfo.accounttype}
                onChange={(e) =>
                  setAccountInfo((prev) => ({
                    ...prev,
                    accounttype: e.target.value,
                  }))
                }
              >
                <option value="Dealers">Dealer</option>
                <option value="Business Partner">Business Partner</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="accountid"
                className="block text-sm font-medium text-black mb-1"
              >
                Select Dealer
              </label>
              <Select
                cacheOptions
                loadOptions={getOptions}
                onChange={handleAccountChange}
                placeholder="Search Dealer"
                className="rounded-lg"
              />
            </div>

            <div>
              <label
                htmlFor="accountname"
                className="block text-sm font-medium text-black mb-1"
              >
                Account Name
              </label>
              <input
                type="text"
                id="accountname"
                name="accountname"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Super steel"
                value={accountInfo.accountname}
                onChange={handleChange}
                pattern="[a-zA-Z ]*"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^\p{L}\s]/gu, "");
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.patternMismatch) {
                    target.setCustomValidity(
                      "Account name should only contain alphabets."
                    );
                  } else {
                    target.setCustomValidity("");
                  }
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={cn(
              "w-full py-3 px-4  text-white rounded-lg font-semibold  bg-purple-600 hover:bg-purple-700 shadow-lg",
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
