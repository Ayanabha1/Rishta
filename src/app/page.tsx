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
import {
  IndianRupee,
  StarIcon,
  Users,
  QrCode,
  Phone,
  FilePlus,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid4 } from "uuid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import IEstimate from "@/interfaces/IEstimate";

export default function Page() {
  const [userData, setUserData] = useState<IUser>();
  const [pendingForApproval, setPendingForApproval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<IEstimate[]>([]);
  const [estimatesLoading, setEstimatesLoading] = useState(false);
  const router = useRouter();
  const user = useUserStore();
  const isEngineer = userData?.module === "Engineers";

  const getUserDetails = async () => {
    try {
      setLoading(true);
      const data = await API.get("/getAccount");
      setUserData(data.data.data.data);
      useUserStore.setState(data.data.data.data);
      const status = data.data.data.data.status;
      setPendingForApproval(
        status === "Pending for Approval" || !status
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      errorHandler(error);
    }
  };

  const getEstimates = async () => {
    try {
      setEstimatesLoading(true);
      const data = await API.get("/getSiteEstimates");
      setEstimates(data.data.data.data || []);
    } catch (error) {
      errorHandler(error);
    } finally {
      setEstimatesLoading(false);
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
      const response = await API.post("/scanQR", formData);

      // Update Firebase to notify QR display
      const qrRef = ref(database, `qr_scans/${qrNumber}`);
      await set(qrRef, {
        scanned: true,
        timestamp: Date.now(),
        scannedBy:
          userData?.firstname || userData?.owner_name || userData?.first_name,
        mobileNumber: userData?.mobile,
        qrCode: qrNumber,
      }).then(() => {
        console.log("Sent to Firebase");
      });

      getUserDetails();
      showSuccessToast(response?.data?.message || "QR scanned successfully");
      closeScanner();
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    if (isEngineer && !pendingForApproval) {
      getEstimates();
    }
  }, [isEngineer, pendingForApproval]);

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
        QRVisible={true}
        MenuVisible={
          userData?.accounttype === "Dealers" ||
          userData?.accounttype === "Business Partner"
        }
        processQRScan={processQRScan}
      />

      <div className="py-8 space-y-8 overflow-y-scroll h-full">
        <div className="-space-y-1">
          <h1 className="text-2xl font-semibold text-purple-950">Welcome</h1>
          <p className="text-4xl font-bold text-purple-950">
            {userData?.firstname || userData?.owner_name || userData?.first_name}
          </p>
        </div>

        <section className="flex flex-col h-[85%] min-h-0">
          {pendingForApproval ? (
            <div className="space-y-4 h-full flex flex-col">
              <PendingApproval />
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              {isEngineer ? (
                <>
                  <Link
                    href="/create-estimate"
                    className="w-full py-3 px-4 flex items-center justify-center gap-2 text-white rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg transition-colors flex-shrink-0"
                  >
                    <FilePlus className="h-5 w-5" />
                    Create Estimate
                  </Link>
                  <div className="flex-1 min-h-0 glassmorphic-card rounded-2xl bg-white/10 backdrop-blur-md shadow-md p-4 overflow-y-auto">
                    <h2 className="text-lg font-semibold text-purple-950 mb-3">
                      Your Estimates
                    </h2>
                    {estimatesLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : estimates.length === 0 ? (
                      <p className="text-purple-800/70 text-center py-8">
                        No estimates found
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {estimates.map((estimate) => (
                          <Link
                            key={estimate.siteestimateid}
                            href={`/estimate/${estimate.siteestimateid}`}
                            className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors flex items-start gap-3"
                          >
                            <FileText className="h-5 w-5 text-purple-700 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-purple-950">
                                {estimate.customer_name}
                              </p>
                              <p className="text-sm text-purple-800/70">
                                {estimate.siteestimate_no} &middot;{" "}
                                {estimate.pincode}
                              </p>
                            </div>
                            {estimate.lead_status && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                                  estimate.lead_status === "New"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {estimate.lead_status}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <StatsCard
                    title={
                      userData?.accounttype === "Dealers" ||
                      userData?.accounttype === "Business Partner"
                        ? "Reward Points"
                        : "Your Yearly Earnings"
                    }
                    value={userData?.["12monthearing"] || "0"}
                    icon={
                      userData?.accounttype === "Dealers" ||
                      userData?.accounttype === "Business Partner" ? (
                        <StarIcon className="h-6 w-6 text-purple-950" />
                      ) : (
                        <IndianRupee className="h-6 w-6 text-purple-950" />
                      )
                    }
                  />
                  <div className="flex-1 min-h-0">
                    <RecentTransactions
                      transactions={
                        userData?.latest10paymenthistory ||
                        userData?.latest10pointhistory ||
                        []
                      }
                    />
                  </div>
                </>
              )}
              {/* Helpline Section */}
              <div className="relative glassmorphic-card overflow-hidden shadow-md rounded-2xl bg-white/10 backdrop-blur-md p-4 border-2 border-green-500 flex-shrink-0">
                <div className="space-y-3">
                  <a
                    href="tel:7604027770"
                    className="flex items-center gap-3 text-purple-950 hover:text-purple-700 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-purple-950" />
                    <div>
                      <p className="text-sm font-medium text-purple-700">HELPLINE NO</p>
                      <p className="text-lg font-semibold text-purple-950">7604027770</p>
                    </div>
                  </a>
                  <div className="pt-3 border-t border-purple-200/50">
                    <p className="text-sm font-medium text-purple-700">OFFICE HOURS</p>
                    <p className="text-base font-semibold text-purple-950">
                      11AM TO 6.30PM (MON TO SAT)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
