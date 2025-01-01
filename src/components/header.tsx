"use client";

import { Menu, User, QrCode, FileUpIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRScanner from "./QRScanner";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useUserStore } from "@/hooks/use-user";
import { cn, showErrorToast } from "@/lib/utils";

export function Header() {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [pendingForApproval, setPendingForApproval] = useState(false);
  const user = useUserStore();
  const closeScanner = () => {
    setIsQRScannerOpen(false);
  };

  const processQRScan = async (data: IDetectedBarcode[]) => {
    console.log(data[0].rawValue);
  };

  useEffect(() => {
    if (user?.status === "Pending for Approval") {
      setPendingForApproval(true);
    }
  }, [user]);

  return (
    <header className="flex items-center justify-between py-4">
      <button className="rounded-full p-2 hover:bg-white/20 transition-colors">
        <Menu className="h-6 w-6 text-purple-900" />
      </button>
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          className="rounded-full p-2 hover:bg-white/20 transition-colors"
        >
          <User className="h-6 w-6 text-purple-900" />
        </Link>

        {
          // Only show the link if the user is pending for approval
          pendingForApproval && (
            <Link
              href="/upload-file"
              className="rounded-full p-2 hover:bg-white/20 transition-colors"
            >
              <FileUpIcon className="h-6 w-6 text-purple-900" />
            </Link>
          )
        }

        <button
          className={cn(
            "rounded-full p-2 hover:bg-white/20 transition-colors",
            {
              "cursor-not-allowed": pendingForApproval,
            }
          )}
          onClick={() => {
            if (pendingForApproval) {
              showErrorToast("Please wait for approval");
            } else {
              setIsQRScannerOpen(true);
            }
          }}
        >
          <QrCode className="h-6 w-6 text-purple-900" />
        </button>
      </div>
      <QRScanner
        isQRScannerOpen={isQRScannerOpen}
        closeScanner={closeScanner}
        processQRScan={processQRScan}
      />
    </header>
  );
}
