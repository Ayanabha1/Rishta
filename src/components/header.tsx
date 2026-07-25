"use client";

import {
  Menu,
  User,
  QrCode,
  FileUpIcon,
  List,
  HardHat,
  Users,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import QRScanner from "./QRScanner";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useUserStore } from "@/hooks/use-user";
import { cn, showErrorToast, showSuccessToast } from "@/lib/utils";
import { API } from "@/lib/axios";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({
  pendingForApproval,
  QRVisible,
  MenuVisible,
  points,
  processQRScan,
}: {
  pendingForApproval: boolean;
  QRVisible: boolean;
  MenuVisible: boolean;
  points?: string;
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
    <header className="flex items-center justify-between py-4 gap-3">
      <div className="relative flex-shrink-0">
        <Image
          src="/assets/logo.png"
          alt="Company Logo"
          width={60}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {points !== undefined && (
          <div className="flex items-center gap-1 rounded-full border border-purple-900/20 bg-purple-900/10 px-3 py-1.5 text-sm font-semibold text-purple-900">
            <StarIcon className="h-4 w-4 fill-current" />
            <span>{points}</span>
          </div>
        )}

        <Link
          href="/profile"
          className="rounded-full p-2 hover:bg-white/20 transition-colors "
        >
          <User className="h-6 w-6 text-purple-900" />
        </Link>

        {QRVisible && (
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
        )}

        {MenuVisible && (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full p-2 hover:bg-white/20 transition-colors ">
              <Menu className="h-6 w-6 text-purple-900" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white/40 backdrop-blur-lg shadow-lg"
            >
              <DropdownMenuItem asChild>
                <Link href="/mason-list" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Masons</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/mason-qr" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  <span>QRs</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
      </div>

      <QRScanner
        isQRScannerOpen={isQRScannerOpen}
        closeScanner={closeScanner}
        processQRScan={processQRScan}
      />
    </header>
  );
}
