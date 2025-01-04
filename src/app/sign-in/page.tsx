"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API } from "@/lib/axios";
import { cn, showSuccessToast } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import errorHandler from "@/lib/error-handler";
import { useUserStore } from "@/hooks/use-user";

export default function LoginForm() {
  const [mobileNumber, setmobileNumber] = useState("");
  const [otp, setOTP] = useState("");
  const [otpId, setOtpId] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' or 'otp'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useUserStore();
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
    } catch (err: any) {
      setLoading(false);
      errorHandler(err);
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
      if (data.data.success) {
        // Handle successful login (e.g., redirect to dashboard)
        localStorage.setItem("access_token", data.data.data.accessToken);
        localStorage.setItem("registered", data.data.data.registered);
        showSuccessToast("Login successful");
        router.push("/");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setLoading(false);
      errorHandler(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      router.push("/");
    }
  }, []);

  return (
    <>
      <Link
        href="/"
        className="absolute top-4 left-4 flex gap-2 items-center rounded-full p-2 px-4 bg-white/40 backdrop-blur-md hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 " /> Home
      </Link>
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
                pattern="[0-9]{10}"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setmobileNumber(e.target.value)}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^0-9]/g, "");
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.patternMismatch) {
                    target.setCustomValidity(
                      "Phone number must be between 10 digits."
                    );
                  } else {
                    target.setCustomValidity("");
                  }
                }}
                required
                className="w-full bg-white/30 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg  border border-purple-600",
                {
                  "cursor-not-allowed opacity-50": loading,
                }
              )}
              disabled={loading}
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
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^0-9]/g, "");
                }}
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.patternMismatch) {
                    target.setCustomValidity("OTP must be between 6 digits.");
                  } else {
                    target.setCustomValidity("");
                  }
                }}
                required
                className="w-full bg-white/30 border-purple-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Button
              type="submit"
              className={cn(
                "w-full bg-purple-600 hover:bg-purple-700 shadow-lg text-white",
                {
                  "cursor-not-allowed opacity-50": loading,
                }
              )}
            >
              Verify OTP
            </Button>
          </form>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </>
  );
}
