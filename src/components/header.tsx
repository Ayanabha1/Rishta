"use client";

import { Menu, User, QrCode, FileUpIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRScanner from "./QRScanner";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useUserStore } from "@/hooks/use-user";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import { API } from "@/lib/axios";
import Image from "next/image";

export function Header({
  pendingForApproval,
  processQRScan,
}: {
  pendingForApproval: boolean;
  processQRScan: (
    data: IDetectedBarcode[],
    closeScanner: () => void
  ) => Promise<void>;
}) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const closeScanner = () => {
    setIsQRScannerOpen(false);
  };

  return (
    <header className="flex items-center justify-between py-4">
      <div className="relative">
        <Image
          src="/assets/logo.png"
          alt="Company Logo"
          width={60}
          height={60}
          className="object-contain"
          priority
        />
      </div>
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
