"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Gift,
  ImageIcon,
  Star,
} from "lucide-react";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import {
  IRedeemCatalogueDetailResponse,
  IRedeemCatalogueItem,
} from "@/interfaces/IRedeemCatalogue";
import {
  formatCatalogueDate,
  toSafeExternalUrl,
} from "@/lib/redeem-catalogue.mjs";

export default function RedeemCatalogueDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<IRedeemCatalogueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!params.id) return;

    setLoading(true);
    setFailed(false);
    try {
      const response = await API.get<IRedeemCatalogueDetailResponse>(
        `/redeem-catalogue/${params.id}`
      );
      setItem(response.data.data);
    } catch (error) {
      setFailed(true);
      errorHandler(error, "Unable to load this reward.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const productUrl = toSafeExternalUrl(item?.product_link);
  const startDate = formatCatalogueDate(item?.start_date);
  const endDate = formatCatalogueDate(item?.end_date);

  return (
    <section className="flex h-full w-full flex-col px-1">
      <header className="flex items-center gap-3 py-4">
        <Link
          href="/redeem-catalogue"
          aria-label="Back to rewards catalogue"
          className="rounded-full bg-white/40 p-2 text-purple-950 transition-colors hover:bg-white/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-medium text-purple-800/70">Rewards Catalogue</p>
          <h1 className="truncate text-lg font-bold text-purple-950">
            {item?.name || "Reward details"}
          </h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-5">
        {loading ? (
          <div className="space-y-4">
            <div className="aspect-square animate-pulse rounded-3xl bg-white/40" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/40" />
          </div>
        ) : failed || !item ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white/30 px-6 text-center">
            <Gift className="mb-3 h-12 w-12 text-purple-700" />
            <p className="font-semibold text-purple-950">Reward unavailable</p>
            <button
              type="button"
              onClick={fetchItem}
              className="mt-4 rounded-xl bg-purple-700 px-5 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <article className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/50 bg-purple-100 shadow-md">
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-purple-300" />
              </div>
              {item.image_url && (
                // The API owns these image URLs and may serve them from
                // different storage hosts, so Next Image cannot whitelist
                // them at build time.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="relative h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
              {item.is_featured && (
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-amber-950 shadow">
                  <Star className="h-3.5 w-3.5 fill-current" /> Featured
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-white/50 bg-white/55 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                {item.category}
              </p>
              <h2 className="mt-1 text-xl font-bold leading-7 text-purple-950">
                {item.name}
              </h2>
              <p className="mt-3 flex items-center gap-2 text-lg font-bold text-purple-800">
                <Star className="h-5 w-5 fill-current" />
                {item.points_required.toLocaleString("en-IN")} points
              </p>
            </div>

            {item.description && (
              <div className="rounded-2xl border border-white/50 bg-white/45 p-4">
                <h3 className="font-semibold text-purple-950">About this reward</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-purple-950/75">
                  {item.description}
                </p>
              </div>
            )}

            {(startDate || endDate) && (
              <div className="flex items-start gap-3 rounded-2xl border border-white/50 bg-white/45 p-4">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />
                <div>
                  <h3 className="font-semibold text-purple-950">Availability</h3>
                  <p className="mt-1 text-sm text-purple-950/75">
                    {startDate || "Now"}
                    {endDate ? ` – ${endDate}` : " onwards"}
                  </p>
                </div>
              </div>
            )}

            {item.terms_conditions && (
              <div className="rounded-2xl border border-white/50 bg-white/45 p-4">
                <h3 className="font-semibold text-purple-950">Terms &amp; conditions</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-purple-950/75">
                  {item.terms_conditions}
                </p>
              </div>
            )}

            {productUrl && (
              <a
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-700 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-purple-800"
              >
                View product <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </article>
        )}
      </div>
    </section>
  );
}
