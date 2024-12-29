import { Menu, User, QrCode } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import QRScanner from "./QRScanner";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";

export function Header() {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const closeScanner = () => {
    setIsQRScannerOpen(false);
  };

  const processQRScan = async (data: IDetectedBarcode[]) => {
    console.log(data[0].rawValue);
  };
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
        <button
          className="rounded-full p-2 hover:bg-white/20 transition-colors"
          onClick={() => setIsQRScannerOpen(true)}
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
