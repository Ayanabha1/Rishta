"use client";

import { useState } from "react";
import { ArrowLeft, Building, HardHat } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SelectAccountTypePage() {
  const [selectedType, setSelectedType] = useState<"dealer" | "mason" | null>(
    null
  );
  const router = useRouter();

  const handleSelection = (type: "dealer" | "mason") => {
    setSelectedType(type);
    router.push(`/create-account/${type}`);
  };

  const useDifferentAccount = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("registered");
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Button
        className="absolute top-4 left-4 text-black flex gap-2 items-center rounded-full p-2 px-4 bg-white/40 backdrop-blur-md hover:bg-white/20 transition-colors"
        onClick={useDifferentAccount}
      >
        <ArrowLeft className="h-5 w-5 " /> Use Different Account
      </Button>
      <div className="w-full max-w-md">
        <div className="w-full rounded-xl bg-white/10 shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-purple-900">
              Create Account
            </h1>
          </div>

          <p className="text-purple-800 mb-6">
            Select the type of account you want to create:
          </p>

          {/* Account Type Options */}
          <div className="space-y-4">
            <button
              onClick={() => handleSelection("dealer")}
              className={`w-full p-4 rounded-lg flex items-center justify-center space-x-3 transition-colors ${
                selectedType === "dealer"
                  ? "bg-purple-600 text-white"
                  : "bg-white/50 backdrop-blur-sm hover:bg-white/60 text-purple-900"
              }`}
            >
              <Building className="h-6 w-6" />
              <span className="text-lg font-medium">Dealer</span>
            </button>

            <button
              onClick={() => handleSelection("mason")}
              className={`w-full p-4 rounded-lg flex items-center justify-center space-x-3 transition-colors ${
                selectedType === "mason"
                  ? "bg-purple-600 text-white"
                  : "bg-white/50 backdrop-blur-sm hover:bg-white/60 text-purple-900"
              }`}
            >
              <HardHat className="h-6 w-6" />
              <span className="text-lg font-medium">Mason</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
