"use client";

import { Header } from "@/components/header";
import PendingApproval from "@/components/pending-approval";
import { RecentTransactions } from "@/components/recent-transactions";
import { StatsCard } from "@/components/stats-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/hooks/use-user";
import IUser from "@/interfaces/IUser";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import { showErrorToast, showSuccessToast } from "@/lib/utils";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid4 } from "uuid";
export default function Page() {
  const [userData, setUserData] = useState<IUser>();
  const [pendingForApproval, setPendingForApproval] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = useUserStore();

  const getUserDetails = async () => {
    try {
      setLoading(true);
      const data = await API.get("/getAccount");
      setUserData(data.data.data.data);
      useUserStore.setState(data.data.data.data);
      setPendingForApproval(
        data.data.data.data.status === "Pending for Approval"
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      errorHandler(error);
    }
  };

  const generateDeviceId = () => {
    if (localStorage.getItem("device_id"))
      return localStorage.getItem("device_id");
    const deviceId = uuid4();
    localStorage.setItem("device_id", deviceId);
  };

  const processQRScan = async (
    data: IDetectedBarcode[],
    closeScanner: () => void
  ) => {
    const qrNumber = data[0].rawValue;
    try {
      const formData = new FormData();
      formData.append("qrnumber", qrNumber);
      const data = await API.post("/scanQR", formData);
      showSuccessToast(data.data.data.message || "QR scanned successfully");
      closeScanner();
      getUserDetails();
    } catch (error) {
      closeScanner();
      errorHandler(error);
    }
  };

  useEffect(() => {
    if (
      !localStorage.getItem("device_id") ||
      localStorage.getItem("device_id") === ""
    ) {
      generateDeviceId();
    }
    const registered = localStorage.getItem("registered");

    if (registered === "false") {
      router.push("/select-account-type");
    } else {
      getUserDetails();
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-purple-600 font-semibold mt-4 text-center">
            Loading page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 w-full h-full flex flex-col">
      <Header
        pendingForApproval={pendingForApproval}
        processQRScan={processQRScan}
      />

      <div className="py-8 space-y-8 overflow-y-scroll h-full">
        <div className="-space-y-1">
          <h1 className="text-2xl font-semibold text-purple-950">Welcome</h1>
          <p className="text-5xl font-bold text-purple-950">
            {userData?.firstname}
          </p>
        </div>

        <section className="overflow-hidden  flex flex-col h-[85%]">
          {pendingForApproval ? (
            <div className="space-y-4 h-full flex flex-col">
              <PendingApproval />
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              <StatsCard
                title="Your Yearly Earnings"
                value={userData?.["12monthearing"] || "0"}
              />
              <RecentTransactions
                transactions={userData?.latest10paymenthistory || []}
              />
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
