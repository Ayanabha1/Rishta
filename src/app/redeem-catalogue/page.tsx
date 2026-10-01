"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Gift,
  ImageIcon,
  Star,
} from "lucide-react";
import { API } from "@/lib/axios";
import errorHandler from "@/lib/error-handler";
import {
  IRedeemCatalogueItem,
  IRedeemCatalogueListData,
  IRedeemCatalogueListResponse,
} from "@/interfaces/IRedeemCatalogue";
import { buildRedeemCatalogueParams } from "@/lib/redeem-catalogue.mjs";

const PAGE_SIZE = 20;

export default function RedeemCataloguePage() {
  const [items, setItems] = useState<IRedeemCatalogueItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [featured, setFeatured] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const requestIdRef = useRef(0);

  const fetchCatalogue = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setFailed(false);

    try {
      const params = buildRedeemCatalogueParams({
        category,
        featured,
        page,
        limit: PAGE_SIZE,
      });
      const response = await API.get<IRedeemCatalogueListResponse>(
        `/redeem-catalogue?${params.toString()}`
      );
      if (requestId !== requestIdRef.current) return;

      const data: IRedeemCatalogueListData = response.data.data;

      setItems(data.items || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(Math.max(data.pagination?.total_pages || 1, 1));
      setCategories((current) =>
        Array.from(
          new Set([
            ...current,
            ...(data.items || []).map((item) => item.category).filter(Boolean),
          ])
        ).sort()
      );
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setFailed(true);
      errorHandler(error, "Unable to load the rewards catalogue.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [category, featured, page]);

  useEffect(() => {
    fetchCatalogue();
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchCatalogue]);

  return (
    <section className="flex h-full w-full flex-col px-1">
      <header className="flex items-center gap-3 py-4">
        <Link
          href="/"
          aria-label="Back to home"
          className="rounded-full bg-white/40 p-2 text-purple-950 transition-colors hover:bg-white/60"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-purple-950">Rewards Catalogue</h1>
          <p className="text-xs text-purple-800/70">
            {loading ? "Loading rewards..." : `${total} reward${total === 1 ? "" : "s"}`}
          </p>
        </div>
      </header>

      <div className="mb-4 space-y-3 rounded-2xl bg-white/35 p-3 backdrop-blur-md">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setCategory(categoryInput.trim());
            setPage(1);
          }}
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-purple-900/70">
            Category
            <div className="mt-1.5 flex gap-2">
              <input
                type="search"
                list="catalogue-categories"
                value={categoryInput}
                onChange={(event) => setCategoryInput(event.target.value)}
                placeholder="All categories"
                className="min-w-0 flex-1 rounded-xl border border-white/50 bg-white/70 px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-purple-950 outline-none placeholder:text-purple-900/45 focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold normal-case tracking-normal text-white"
              >
                Apply
              </button>
            </div>
          </label>
          <datalist id="catalogue-categories">
            {categories.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          {category && (
            <button
              type="button"
              onClick={() => {
                setCategoryInput("");
                setCategory("");
                setPage(1);
              }}
              className="mt-2 text-xs font-semibold text-purple-700 underline underline-offset-2"
            >
              Clear category: {category}
            </button>
          )}
        </form>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-900/70">
            Type
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["", "All"],
              ["true", "Featured"],
              ["false", "Standard"],
            ].map(([value, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setFeatured(value);
                  setPage(1);
                }}
                className={`rounded-xl px-2 py-2 text-sm font-semibold transition-colors ${
                  featured === value
                    ? "bg-purple-700 text-white shadow"
                    : "bg-white/60 text-purple-900 hover:bg-white/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3" aria-label="Loading catalogue">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl bg-white/40"
              />
            ))}
          </div>
        ) : failed ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl bg-white/30 px-6 text-center">
            <Gift className="mb-3 h-10 w-10 text-purple-700" />
            <p className="font-semibold text-purple-950">Couldn&apos;t load rewards</p>
            <button
              type="button"
              onClick={fetchCatalogue}
              className="mt-4 rounded-xl bg-purple-700 px-5 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl bg-white/30 px-6 text-center">
            <Gift className="mb-3 h-10 w-10 text-purple-700" />
            <p className="font-semibold text-purple-950">No rewards found</p>
            <p className="mt-1 text-sm text-purple-800/70">
              Try another category or reward type.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/redeem-catalogue/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-white/50 bg-white/55 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-purple-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-purple-300" />
                  </div>
                  {item.image_url && (
                    // The API owns these image URLs and may serve them from
                    // different storage hosts, so Next Image cannot whitelist
                    // them at build time.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="relative h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  {item.is_featured && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-300 px-2 py-1 text-[10px] font-bold text-amber-950 shadow">
                      <Star className="h-3 w-3 fill-current" /> Featured
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-700">
                    {item.category}
                  </p>
                  <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-purple-950">
                    {item.name}
                  </h2>
                  <p className="flex items-center gap-1 text-sm font-bold text-purple-800">
                    <Star className="h-4 w-4 fill-current" />
                    {item.points_required.toLocaleString("en-IN")} points
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {!loading && !failed && totalPages > 1 && (
        <nav
          aria-label="Catalogue pagination"
          className="flex items-center justify-between border-t border-white/40 py-3"
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            className="flex items-center gap-1 rounded-xl bg-white/50 px-3 py-2 text-sm font-semibold text-purple-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm font-medium text-purple-900">
            {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
            className="flex items-center gap-1 rounded-xl bg-white/50 px-3 py-2 text-sm font-semibold text-purple-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </section>
  );
}
