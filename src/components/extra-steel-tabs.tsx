import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExtraSteelRequirementForm,
  ExtraSteelRequirementPage,
} from "@/lib/extra-steel";

interface ExtraSteelTabsProps {
  leadStatus: string;
  data?: ExtraSteelRequirementPage;
  loading: boolean;
  error: string;
  formOpen: boolean;
  form: ExtraSteelRequirementForm;
  submitting: boolean;
  onFormOpenChange: (open: boolean) => void;
  onFormChange: (form: ExtraSteelRequirementForm) => void;
  onSubmit: (event: React.FormEvent) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

const number = (value: number) => value.toLocaleString("en-IN");

const statusClass = (status: string) => {
  if (status === "Approved") return "bg-emerald-100 text-emerald-800";
  if (status === "Rejected") return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
};

export function ExtraSteelTabs({
  leadStatus,
  data,
  loading,
  error,
  formOpen,
  form,
  submitting,
  onFormOpenChange,
  onFormChange,
  onSubmit,
  onPageChange,
  onRetry,
}: ExtraSteelTabsProps) {
  const totalPages = Math.max(
    1,
    Math.ceil((data?.total || 0) / (data?.limit || 10))
  );
  const currentPage = data?.page || 1;

  return (
    <div className="bg-white/20 rounded-2xl p-4">
      <Tabs defaultValue="extra-steel" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-white/40">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="extra-steel">Extra Steel</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-0">
          <div className="rounded-xl bg-white/30 p-4">
            <h2 className="font-semibold text-black">Current Status</h2>
            <p className="mt-1 text-sm text-black/70">
              This lead is at <span className="font-medium">{leadStatus}</span>.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="extra-steel" className="mt-0 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-black">
                Extra Steel Requirements
              </h2>
              <p className="text-xs text-black/50">
                Request and track additional steel for this estimate.
              </p>
            </div>
            {!formOpen && (
              <button
                type="button"
                onClick={() => onFormOpenChange(true)}
                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800"
              >
                <Plus className="h-4 w-4" />
                Request Steel
              </button>
            )}
          </div>

          {formOpen && (
            <form
              onSubmit={onSubmit}
              className="space-y-3 rounded-xl bg-white/35 p-3"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Extra Steel Quantity
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={form.extraSteelQty}
                  onChange={(event) =>
                    onFormChange({
                      ...form,
                      extraSteelQty: event.target.value,
                    })
                  }
                  placeholder="1.40"
                  className="w-full rounded-lg bg-white/60 px-3 py-2 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black">
                  Reason
                </label>
                <textarea
                  rows={3}
                  value={form.reason}
                  onChange={(event) =>
                    onFormChange({ ...form, reason: event.target.value })
                  }
                  placeholder="Why is additional steel required?"
                  className="w-full resize-none rounded-lg bg-white/60 px-3 py-2 text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => onFormOpenChange(false)}
                  className="rounded-lg bg-white/60 px-4 py-2.5 font-semibold text-black/70 hover:bg-white/80 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-purple-700 px-4 py-2.5 font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}

          {error ? (
            <div className="rounded-xl bg-red-50 p-4 text-center">
              <p className="text-sm text-red-800">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          ) : loading && !data ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["Actual Steel", data?.actual_steel_qty || 0],
                  ["Extra Steel", data?.total_extra_steel_qty || 0],
                  ["Grand Total", data?.grand_total_steel_qty || 0],
                  ["Phase 1", data?.phase1_points || 0],
                  ["Phase 2", data?.phase2_points || 0],
                  ["Total Points", data?.total_points || 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white/40 p-2">
                    <p className="text-[11px] text-black/50">{label}</p>
                    <p className="text-sm font-bold text-black">
                      {number(Number(value))}
                    </p>
                  </div>
                ))}
              </div>

              {data?.entries.length ? (
                <div className="space-y-3">
                  {data.entries.map((entry) => (
                    <article key={entry.id} className="rounded-xl bg-white/35 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-black">
                            {entry.extra_steel_qty} extra steel
                          </p>
                          <p className="mt-0.5 text-sm text-black/70">
                            {entry.reason}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(
                            entry.status
                          )}`}
                        >
                          {entry.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-2 text-xs text-black/50">
                        <div>
                          <p>{entry.created_by}</p>
                          <p>{entry.created_at}</p>
                        </div>
                        <p className="font-medium text-black/70">
                          {number(entry.points_awarded)} points
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-white/30 py-6 text-center text-sm text-black/60">
                  No extra steel requirements yet.
                </p>
              )}

              {data && data.total > data.limit && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Previous requirements page"
                    disabled={loading || currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="rounded-lg bg-white/50 p-2 text-black disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-black/60">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    aria-label="Next requirements page"
                    disabled={loading || currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="rounded-lg bg-white/50 p-2 text-black disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
