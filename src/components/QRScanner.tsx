"use client";

import React from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "./ui/button";

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
        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-4 bg-white w-[80%] rounded-md flex flex-col gap-2">
            {/* Add your QR scanner component here */}
            <Scanner
              onScan={(result) => processQRScan(result, closeScanner)}
              scanDelay={5000}
              allowMultiple
            />
            <Button
              className="mt-2 bg-purple-600 hover:bg-purple-700 w-full shadow-xl"
              onClick={() => closeScanner()}
            >
              Close Scanner
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default QRScanner;
