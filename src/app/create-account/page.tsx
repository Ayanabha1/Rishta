"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Check, ChevronsUpDown, X } from "lucide-react";
import Link from "next/link";
import Select from "react-select/async";
// import { debounce } from "lodash";
import debounce from "debounce-promise";
import axios from "axios";
import { API } from "@/lib/axios";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CreateAccount() {
  const [mounted, setMounted] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    firstname: "",
    lastname: "",
    email: "",
    address: "",
    mailingzip: "",
    salesofficername: "",
    accountholdername: "",
    accountid: [],
    bankaccountnumber: "",
    ifsccode: "",
    bankname: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstname", accountInfo.firstname);
      formData.append("lastname", accountInfo.lastname);
      formData.append("email", accountInfo.email);
      formData.append("address", accountInfo.address);
      formData.append("mailingzip", accountInfo.mailingzip);
      formData.append("salesofficername", accountInfo.salesofficername);
      formData.append("accountholdername", accountInfo.accountholdername);
      formData.append("accountid", accountInfo.accountid.join(","));
      formData.append("bankaccountnumber", accountInfo.bankaccountnumber);
      formData.append("ifsccode", accountInfo.ifsccode);
      formData.append("bankname", accountInfo.bankname);
      const res = await API.post("/createAccount", formData);
      showSuccessToast("Account created successfully");
      localStorage.setItem("registered", "true");
      router.push("/");
    } catch (error: any) {
      console.log(error.response.data.data.message);
      showErrorToast(
        error?.response?.data?.data?.message || "Failed to create account"
      );
    }
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
      console.log(selectedOption);
      setAccountInfo((prev) => ({
        ...prev,
        accountid: selectedOption.map((item: any) => item.value),
      }));
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-full glassmorphic-card shadow-2xl overflow-hidden">
      <div className="relative max-w-[390px] h-full mx-auto p-4 ">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 z-10 ">
          <Link
            href="/"
            className="rounded-full p-2 hover:bg-black/5 transition-colors"
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
          className="space-y-6 overflow-y-scroll h-[99%] pb-24"
        >
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium text-black mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Ayanabha"
                  value={accountInfo.firstname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="lastname"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  required
                  className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                  placeholder="Misra"
                  value={accountInfo.lastname}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="ayanabha2002@gmail.com"
                value={accountInfo.email}
                onChange={handleChange}
              />
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
                htmlFor="mailingzip"
                className="block text-sm font-medium text-black mb-1"
              >
                Mailing ZIP
              </label>
              <input
                type="text"
                id="mailingzip"
                name="mailingzip"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="78995555"
                value={accountInfo.mailingzip}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">
              Account Information
            </h2>

            {/* Multi-select Account Search */}

            <Select
              cacheOptions
              loadOptions={getOptions}
              onChange={handleAccountChange}
              isMulti
              placeholder="Search accounts..."
              className="rounded-lg"
            />

            <div>
              <label
                htmlFor="salesofficername"
                className="block text-sm font-medium text-black mb-1"
              >
                Sales Officer Name
              </label>
              <input
                type="text"
                id="salesofficername"
                name="salesofficername"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Rajib Singa"
                value={accountInfo.salesofficername}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-black">Bank Details</h2>
            <div>
              <label
                htmlFor="accountholdername"
                className="block text-sm font-medium text-black mb-1"
              >
                Account Holder Name
              </label>
              <input
                type="text"
                id="accountholdername"
                name="accountholdername"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="Sunia Chouhan"
                value={accountInfo.accountholdername}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="bankaccountnumber"
                className="block text-sm font-medium text-black mb-1"
              >
                Bank Account Number
              </label>
              <input
                type="text"
                id="bankaccountnumber"
                name="bankaccountnumber"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="145456564646434"
                value={accountInfo.bankaccountnumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="ifsccode"
                className="block text-sm font-medium text-black mb-1"
              >
                IFSC Code
              </label>
              <input
                type="text"
                id="ifsccode"
                name="ifsccode"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="SBIN0000789"
                value={accountInfo.ifsccode}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="bankname"
                className="block text-sm font-medium text-black mb-1"
              >
                Bank Name
              </label>
              <input
                type="text"
                id="bankname"
                name="bankname"
                required
                className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm rounded-lg text-black placeholder-black/40 focus:outline-none focus:bg-white/60 transition-colors"
                placeholder="United Bank Of India"
                value={accountInfo.bankname}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4  text-white rounded-lg font-semibold  bg-purple-600 hover:bg-purple-700"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
