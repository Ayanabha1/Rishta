"use client";

import { useEffect, useState, useRef } from "react";
import { API } from "@/lib/axios";
import { IMasonQR, IMasonQRResponse } from "@/interfaces/IMasonQR";
import { ISubdealer, ISubdealerSearchResponse } from "@/interfaces/ISubdealer";
import { ArrowLeft, QrCode, Share2, Check } from "lucide-react";
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
import { showSuccessToast, showErrorToast } from "@/lib/utils";
import { useUserStore } from "@/hooks/use-user";
import AsyncSelect from "react-select/async";
import debounce from "debounce-promise";

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

  // Share Coupon states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedQRs, setSelectedQRs] = useState<IMasonQR[]>([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState<ISubdealer | null>(
    null
  );
  const [transferLoading, setTransferLoading] = useState(false);

  // Add state for modal pagination
  const [modalPage, setModalPage] = useState(1);
  const modalLimit = 5; // QRs per page in modal
  const paginatedSelectedQRs = selectedQRs.slice(
    (modalPage - 1) * modalLimit,
    modalPage * modalLimit
  );
  const totalModalPages = Math.ceil(selectedQRs.length / modalLimit);

  const user = useUserStore();
  const isDealer =
    user.accounttype === "Dealers" || user.accounttype === "Business Partner";

  // Subdealer search function
  const searchSubdealers = debounce(async (query: string) => {
    if (!query) {
      return Promise.resolve([]);
    }
    try {
      const response = await API.get<ISubdealerSearchResponse>(
        `/searchAccount?query=${query}`
      );
      return response.data.data.map((subdealer) => ({
        value: subdealer.accountid,
        label: subdealer.accountname,
      }));
    } catch (error) {
      console.error("Error searching subdealers:", error);
      showErrorToast("Failed to search subdealers");
      return [];
    }
  }, 1000);

  // Handle QR selection
  const handleQRSelection = (qr: IMasonQR) => {
    setSelectedQRs((prev) => {
      const isSelected = prev.some(
        (selected) => selected.qrrewardsid === qr.qrrewardsid
      );
      if (isSelected) {
        return prev.filter(
          (selected) => selected.qrrewardsid !== qr.qrrewardsid
        );
      } else {
        return [...prev, qr];
      }
    });
  };

  // Select all QRs
  const handleSelectAll = () => {
    if (selectedQRs.length === qrs.length) {
      setSelectedQRs([]);
    } else {
      setSelectedQRs([...qrs]);
    }
  };

  // Transfer QRs to subdealer
  const handleTransferQRs = async () => {
    if (selectedQRs.length === 0) {
      showErrorToast("Please select at least one QR");
      return;
    }
    if (!selectedSubdealer) {
      showErrorToast("Please select a subdealer");
      return;
    }

    setTransferLoading(true);
    try {
      const qrIds = selectedQRs.map((qr) => qr.qrrewardsid).join(",");
      await API.get(
        `/dealer/transferQrs?qrids=${qrIds}&subdealerid=${selectedSubdealer.accountid}`
      );
      showSuccessToast(`${selectedQRs.length} QR(s) transferred successfully`);
      setShareDialogOpen(false);
      setSelectedQRs([]);
      setSelectedSubdealer(null);
      // Refresh QR list
      await fetchQRs();
    } catch (error) {
      errorHandler(error);
    } finally {
      setTransferLoading(false);
    }
  };

  // Handle bulk share click
  const handleBulkShare = () => {
    if (selectedQRs.length === 0) {
      showErrorToast("Please select at least one QR to share");
      return;
    }
    setShareDialogOpen(true);
  };

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

  // Deselect QR from modal
  const handleDeselectQRInModal = (qrid: number) => {
    setSelectedQRs((prev) => prev.filter((qr) => qr.qrrewardsid !== qrid));
    // If last QR on page is removed, go to previous page if needed
    if (paginatedSelectedQRs.length === 1 && modalPage > 1) {
      setModalPage(modalPage - 1);
    }
  };

  // Reset modal page when opening/closing
  useEffect(() => {
    if (shareDialogOpen) setModalPage(1);
  }, [shareDialogOpen]);

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

  // Reset selected QRs when pagination or brand changes
  useEffect(() => {
    setSelectedQRs([]);
  }, [limit, page, brand]);

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

      <div className="glassmorphic-card rounded-2xl shadow-lg p-4 sm:p-6 relative w-full h-[calc(100vh-8rem)] flex flex-col">
        {/* Filters and Actions Section */}
        <div className="space-y-3 mb-6">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {brands.length > 0 && (
              <div className="rounded-lg bg-white/60 w-full sm:w-fit">
                <Select
                  value={brand}
                  onValueChange={(value) => {
                    setBrand(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[180px]  text-base">
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

            <div className="bg-white/60 w-full sm:w-fit rounded-lg">
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(parseInt(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] text-base">
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

          {/* Bulk Share Actions - Only show for dealers */}
          {isDealer && (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="rounded-md font-medium px-4 py-2"
              >
                {selectedQRs.length === qrs.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                onClick={handleBulkShare}
                disabled={selectedQRs.length === 0}
                className="bg-purple-500 hover:bg-blue-600 text-white rounded-md font-semibold shadow-sm px-4 py-2"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share{selectedQRs.length > 0 ? ` (${selectedQRs.length})` : ""}
              </Button>
            </div>
          )}
        </div>

        {/* QR List */}
        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 h-[85%] px-1 py-1 pb-10 overflow-y-auto">
              {qrs.map((qr) => {
                const isSelected = selectedQRs.some(
                  (selected) => selected.qrrewardsid === qr.qrrewardsid
                );
                return (
                  <div
                    key={qr.qrcode}
                    className={`glassmorphic-card p-4 hover:bg-white/30 transition-colors rounded-xl h-fit shadow-md flex flex-col border border-transparent ${
                      isSelected
                        ? "ring-2 ring-blue-400 bg-blue-50/60 border-blue-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Checkbox for selection - Only show for dealers */}
                        {isDealer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQRSelection(qr);
                            }}
                            className={`size-4 rounded border-2 flex items-center justify-center transition-colors
                            ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "bg-white border-gray-300 hover:border-blue-400"
                            }
                            `}
                          >
                            {isSelected && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </button>
                        )}

                        <button
                          className="flex items-center gap-4 flex-1"
                          onClick={() => handleQrClick(qr.qrcode)}
                        >
                          <div className="p-3 rounded-full bg-purple-100">
                            <QrCode className="h-7 w-7 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-base font-semibold text-purple-700">
                              <span className="font-medium text-purple-700">
                                Expires in {qr.available_days} days
                              </span>
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modern Pagination Bar */}
            <div className="w-full flex justify-center items-center mt-4">
              <div className="flex gap-2 bg-white/60 rounded-xl px-4 py-2 shadow-sm">
                <span className="text-gray-700 text-sm font-medium flex items-center">
                  Showing {Math.min((page - 1) * limit + 1, total)}-
                  {Math.min(page * limit, total)} of {total} QR codes
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg px-3 font-semibold"
                >
                  Previous
                </Button>
                <span className="text-base font-medium px-2 mt-1">{page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={qrs.length < limit}
                  className="rounded-lg px-3 font-semibold"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* QR Display Dialog */}
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

      {/* Share Coupon Dialog */}
      <Dialog
        open={shareDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubdealer(null);
          }
          setShareDialogOpen(open);
        }}
      >
        <DialogContent className="bg-white/90 backdrop-blur-md w-[95%] max-w-lg border-none rounded-2xl shadow-xl">
          <div className="">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-purple-900">
                Share QRs
              </h3>
              {/* <p className="text-sm text-gray-600">
                Review and confirm the QR coupons you want to share
              </p> */}
            </div>

            {/* Paginated QR List in Modal */}
            {/* <div className="flex flex-col gap-3 items-center">
              {paginatedSelectedQRs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No QRs selected.
                </div>
              ) : (
                paginatedSelectedQRs.map((qr) => (
                  <div
                    key={qr.qrrewardsid}
                    className="flex items-center justify-between w-full bg-purple-50 rounded-lg px-4 py-2 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100">
                        <QrCode className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium text-purple-800 text-sm">
                        Expires in {qr.available_days} days
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeselectQRInModal(qr.qrrewardsid)}
                      className="ml-2 px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-xs font-semibold"
                      title="Remove from selection"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div> */}

            {/* Pagination Controls in Modal */}
            {/* {selectedQRs.length > modalLimit && (
              <div className="flex justify-center items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                  disabled={modalPage === 1}
                  className="rounded-lg px-3 font-semibold"
                >
                  Previous
                </Button>
                <span className="text-base font-medium px-2 mt-1">
                  {modalPage} / {totalModalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setModalPage((p) => Math.min(totalModalPages, p + 1))
                  }
                  disabled={modalPage === totalModalPages}
                  className="rounded-lg px-3 font-semibold"
                >
                  Next
                </Button>
              </div>
            )} */}

            {/* Subdealer Search and Share */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Subdealer
                </label>
                <AsyncSelect
                  loadOptions={searchSubdealers}
                  onChange={(option) => {
                    if (option) {
                      setSelectedSubdealer({
                        accountid: option.value,
                        accountname: option.label,
                      });
                    } else {
                      setSelectedSubdealer(null);
                    }
                  }}
                  placeholder="Type to search subdealers..."
                  className="rounded-lg"
                  isClearable
                />
              </div>

              {selectedSubdealer && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Selected:</span>{" "}
                    {selectedSubdealer.accountname}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransferQRs}
                disabled={
                  !selectedSubdealer ||
                  transferLoading ||
                  selectedQRs.length === 0
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {transferLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Transferring...
                  </div>
                ) : (
                  `Share ${selectedQRs.length} Coupon${
                    selectedQRs.length > 1 ? "s" : ""
                  }`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
