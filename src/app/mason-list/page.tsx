"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/axios";
import { IMason, IMasonListResponse } from "@/interfaces/IMason";
import { ArrowLeft, IndianRupee } from "lucide-react";
import Link from "next/link";
import errorHandler from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MasonListPage() {
  const [masons, setMasons] = useState<IMason[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("all");
  const [total, setTotal] = useState(0);

  const fetchMasons = async () => {
    try {
      setLoading(true);
      const response = await API.get<IMasonListResponse>(
        `/dealer/masonList?status=${
          status === "all" ? "" : status
        }&page=${page}&limit=${limit}`
      );
      setMasons(response.data.data.records);
      setTotal(response.data.data.total);
    } catch (error) {
      errorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasons();
  }, [page, limit, status]);

  return (
    <div className="w-full p-4 pb-8 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-8  -mx-4 px-4 py-2">
        <Link
          href="/"
          className="rounded-full p-2 bg-white/40 backdrop-blur-md hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 " />
        </Link>
        <div className="px-4 py-2 rounded-full backdrop-blur-md bg-white/40 ">
          <span className="font-medium">Mason List</span>
        </div>
      </div>

      <div className="glassmorphic-card rounded-lg shadow-sm p-6 min-h-[80vh] overflow-y-hidden relative">
        <div className="flex gap-4 mb-6">
          <div className="bg-white/40 rounded-md">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white/40 rounded-md">
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
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
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto h-[82%] pb-20">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Mobile</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {masons.map((mason) => (
                    <tr key={mason.contactid} className="border-b">
                      <td className="py-3 px-4">
                        {mason.firstname} {mason.lastname}
                      </td>
                      <td className="py-3 px-4">{mason.mobile}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            mason.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {mason.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {mason.earnings}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {masons.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No masons found
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {masons.length} of {total} masons
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
                    disabled={masons.length < limit}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
