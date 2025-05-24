"use client";

import { useEffect, useState, useRef } from "react";
import { API } from "@/lib/axios";
import { IMasonQR, IMasonQRResponse } from "@/interfaces/IMasonQR";
import { ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import errorHandler from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import { showSuccessToast } from "@/lib/utils";

export default function MasonQRPage() {
  const [qrs, setQrs] = useState<IMasonQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [brand, setBrand] = useState("all");
  const [brands, setBrands] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [scannedBy, setScannedBy] = useState<string | null>(null);
  const currentQRRef = useRef<string | null>(null);
  const [listenerCleanup, setListenerCleanup] = useState<(() => void) | null>(
    null
  );

  const fetchQRs = async () => {
    try {
      setLoading(true);
      const response = await API.get<IMasonQRResponse>(
        `/dealer/masonQRs?status=&page=${page}&limit=${limit}${
          brand === "all" ? "" : `&brand=${brand}`
        }`
      );
      setQrs(response.data.data.records);
      setTotal(response.data.data.total);
      // Set brands from the first response if not already set
      if (brands.length === 0) {
        setBrands(response.data.data.brands);
      }
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  // Update QR scan listener setup
  const setupQRScanListener = (qrCode: string) => {
    // Clean up any existing listener
    if (listenerCleanup) {
      listenerCleanup();
    }

    // Set current QR code in ref
    currentQRRef.current = qrCode;

    const qrRef = ref(database, `qr_scans/${qrCode}`);

    const unsubscribe = onValue(qrRef, (snapshot) => {
      const data = snapshot.val();
      console.log("QR Scan Event:", {
        scannedQR: qrCode,
        currentQR: currentQRRef.current,
        data: data,
        isCurrentQR: qrCode === currentQRRef.current,
      });

      // Only process if this is the currently open QR code
      if (data?.scanned && qrCode === currentQRRef.current) {
        console.log("Processing scan for current QR:", qrCode);
        setScannedQR(qrCode);
        setScannedBy(data.scannedBy);
        setTimeout(() => {
          setQrDialogOpen(false);
          setScannedQR(null);
          setScannedBy(null);
          currentQRRef.current = null;
          if (listenerCleanup) {
            listenerCleanup();
            setListenerCleanup(null);
          }
        }, 2000);
      }
    });

    // Store the cleanup function
    setListenerCleanup(() => unsubscribe);
  };

  const handleQrClick = async (qrCode: string) => {
    setQrDialogOpen(true);
    setQrLoading(true);
    setQrImageUrl(null);
    try {
      const response = await API.get(`/dealer/getQRImage?qrCode=${qrCode}`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setQrImageUrl(imageUrl);

      // Setup QR scan listener for this specific QR code
      setupQRScanListener(qrCode);
    } catch (error) {
      errorHandler(error);
      // Reset states on error
      currentQRRef.current = null;
      setQrDialogOpen(false);
    } finally {
      setQrLoading(false);
    }
  };

  const handleQRClose = async (qrCode: string) => {
    try {
      // TODO: Add Firebase event handling here
      console.log("QR Code closed:", qrCode);
      // Close the QR dialog
      setQrDialogOpen(false);
      // Refresh the QR list
      await fetchQRs();
    } catch (error) {
      errorHandler(error);
    }
  };

  useEffect(() => {
    fetchQRs();
  }, [page, limit, brand]);

  // Clean up listener when component unmounts
  useEffect(() => {
    return () => {
      if (listenerCleanup) {
        listenerCleanup();
        setListenerCleanup(null);
      }
      currentQRRef.current = null;
    };
  }, []);

  // Clean up listener when dialog closes
  useEffect(() => {
    if (!qrDialogOpen && listenerCleanup) {
      listenerCleanup();
      setListenerCleanup(null);
      currentQRRef.current = null;
      setScannedQR(null);
    }
  }, [qrDialogOpen]);

  return (
    <div className="w-full p-4 pb-8 flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 -mx-4 px-4 py-2 relative">
        <Link
          href="/"
          className="rounded-full p-2 bg-white/40 backdrop-blur-md hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="px-4 py-2 rounded-full backdrop-blur-md bg-white/40">
          <span className="font-medium">Mason QRs</span>
        </div>
      </div>

      <div className="glassmorphic-card rounded-lg shadow-sm p-6 relative w-full h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {brands.length > 0 && (
            <div className="rounded-md bg-white/40 w-full sm:w-fit">
              <Select
                value={brand}
                onValueChange={(value) => {
                  setBrand(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-white/40 w-full sm:w-fit rounded-md">
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 h-[85%] overflow-y-auto">
              {qrs.map((qr) => (
                <button
                  key={qr.qrcode}
                  className="glassmorphic-card p-4 hover:bg-white/20 transition-colors rounded-lg h-fit shadow-md flex flex-col"
                  onClick={() => handleQrClick(qr.qrcode)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <QrCode className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-purple-700">
                        <span className="font-medium text-purple-700">
                          Expires in{" "}
                        </span>
                        {qr.available_days} days
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {qrs.length === 0 && (
              <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
                No QR codes found
              </div>
            )}

            <div className="mt-auto flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {qrs.length} of {total} QR codes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={qrs.length < limit}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={qrDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (listenerCleanup) {
              listenerCleanup();
              setListenerCleanup(null);
            }
            // Only reset states when dialog is manually closed
            setScannedQR(null);
            setScannedBy(null);
            currentQRRef.current = null;
            setQrImageUrl(null); // Also clear the QR image URL
          }
          setQrDialogOpen(open);
        }}
      >
        <DialogContent className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-md w-[90%] p-8 border-none rounded-2xl shadow-xl">
          {qrLoading ? (
            <div className="flex flex-col items-center justify-center h-64 w-64 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-600 font-medium">Loading QR Code...</p>
            </div>
          ) : qrImageUrl ? (
            <div className="flex flex-col items-center gap-6">
              {/* QR Code Container */}
              <div className="bg-white p-6 rounded-xl shadow-lg relative">
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  className="w-64 h-64 object-contain"
                />
                {/* Corner Decorations */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500 rounded-br-lg"></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-purple-900">
                  Share this QR Code
                </h3>
                <p className="text-sm text-gray-600 max-w-xs">
                  Have the mason scan this QR code using their phone to claim
                  their reward
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-600 mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Keep this dialog open until scanned</span>
                </div>
              </div>

              {/* Success Message */}
              {scannedQR && currentQRRef.current === scannedQR && (
                <div className="flex flex-col text-left items-center gap-2 animate-fade-in bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-left">
                      QR Code Scanned Successfully!
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 text-left">
                    Scanned by{" "}
                    <span className="font-medium text-purple-600">
                      {scannedBy}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p>Failed to load QR image</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
