"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/lib/axios";
import { showSuccessToast } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [mobileNumber, setmobileNumber] = useState("");
  const [otp, setOTP] = useState("");
  const [otpId, setOtpId] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const deviceId = localStorage.getItem("device_id");
      const formData = new FormData();
      formData.append("mobileNumber", mobileNumber);
      formData.append("deviceId", deviceId as string);
      const data = await API.post("/sendOtp", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(data);
      setOtpId(data.data.data.otpId);
      setStep("otp");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const deviceId = localStorage.getItem("device_id");
      const formData = new FormData();
      formData.append("mobileNumber", mobileNumber);
      formData.append("otp", otp);
      formData.append("otpId", otpId);
      formData.append("deviceId", deviceId as string);

      const data = await API.post("/validateOtp", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(data);
      if (data.data.success) {
        // Handle successful login (e.g., redirect to dashboard)
        localStorage.setItem("access_token", data.data.data.accessToken);
        showSuccessToast("Login successful");
        router.push("/");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl w-full my-auto bg-white/10 backdrop-blur-md p-6 shadow-xl h-fit">
      <h2 className="text-2xl font-bold text-purple-950 mb-2">
        {step === "phone" ? "Login" : "Verify OTP"}
      </h2>
      <p className="text-sm text-purple-800 mb-6">
        {step === "phone"
          ? "Enter your phone number to receive an OTP"
          : "Enter the OTP sent to your phone"}
      </p>
      {step === "phone" ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-purple-900 mb-1"
            >
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="89********"
              value={mobileNumber}
              onChange={(e) => setmobileNumber(e.target.value)}
              required
              className="w-full bg-white/30 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-purple-900 mb-1"
            >
              OTP
            </label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              required
              className="w-full bg-white/30 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Verify OTP
          </Button>
        </form>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
