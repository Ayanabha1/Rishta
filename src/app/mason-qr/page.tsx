"use client";

import { useEffect, useState } from "react";
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
    } catch (error) {
      errorHandler(error);
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

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="flex flex-col items-center justify-center bg-white/40 backdrop-blur-md w-fit p-10 border-none">
          {qrLoading ? (
            <div className="flex justify-center items-center h-64 w-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="QR Code"
              className="w-64 h-64 object-contain"
            />
          ) : (
            <div className="text-gray-500">Failed to load QR image</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
