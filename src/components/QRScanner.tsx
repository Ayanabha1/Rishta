"use client";

import React from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "./ui/button";
import { X } from "lucide-react";

const QRScanner = ({
  isQRScannerOpen,
  closeScanner,
  processQRScan,
}: {
  isQRScannerOpen: boolean;
  closeScanner: () => void;
  processQRScan: (
    data: IDetectedBarcode[],
    closeScanner: () => void
  ) => Promise<void>;
}) => {
  return (
    <>
      {isQRScannerOpen ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-[90%] max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <h2 className="text-white font-medium">Scan QR Code</h2>
              <button
                onClick={closeScanner}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Scanner Container */}
            <div className="relative aspect-square w-full">
              {/* Scanner */}
              <Scanner
                onScan={(result) => processQRScan(result, closeScanner)}
                scanDelay={5000}
                allowMultiple
                classNames={{
                  container: "w-full h-full",
                  video: "w-full h-full object-cover",
                }}
              />

              {/* Scanner Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Corner Markers */}
                <div className="absolute inset-0 border-2 border-white/50 m-8 rounded-lg">
                  {/* Top Left Corner */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-purple-500"></div>
                  {/* Top Right Corner */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-purple-500"></div>
                  {/* Bottom Left Corner */}
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-purple-500"></div>
                  {/* Bottom Right Corner */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-purple-500"></div>
                </div>

                {/* Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-purple-500 animate-scanner-line"></div>

                {/* Center Text */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full inline-block backdrop-blur-sm">
                    Position QR code within frame
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                onClick={closeScanner}
              >
                Close Scanner
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default QRScanner;
