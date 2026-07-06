"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  PopularSearchAdminService,
  type PopularSearchAdminItem,
} from "@/domain/application/services/popularSearch.service";
import { httpClient } from "@/lib/httpClient";
import { CATEGORIES_URL } from "@/constants/apis";

type Category = { _id: string; name: string };

type LinkType =
  | "category"
  | "discount"
  | "bestseller"
  | "newarrival"
  | "search";

const TYPE_OPTIONS: { value: LinkType; label: string }[] = [
  { value: "category", label: "Category" },
  { value: "discount", label: "Discount (% off)" },
  { value: "bestseller", label: "Best Sellers" },
  { value: "newarrival", label: "New Arrivals" },
  { value: "search", label: "Search word" },
];

const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "/icons/popular-searches/mens-socks.svg", label: "Mens Socks" },
  { value: "/icons/popular-searches/womens-socks.svg", label: "Womens Socks" },
  { value: "/icons/popular-searches/kids-socks.svg", label: "Kids Socks" },
  { value: "/icons/popular-searches/gift-packs.svg", label: "Gift Packs" },
  { value: "/icons/popular-searches/towels.svg", label: "Towels" },
  { value: "/icons/popular-searches/festival-offers.svg", label: "Festival Offers" },
  { value: "/icons/popular-searches/outlet.svg", label: "Outlet" },
  { value: "/icons/popular-searches/best-sellers.svg", label: "Best Sellers" },
  { value: "/icons/popular-searches/new-arrivals.svg", label: "New Arrivals" },
  { value: "/icons/popular-searches/antimicrobial-socks.svg", label: "Antimicrobial Socks" },
];

export default function PopularSearchesPage() {
  const [rows, setRows] = useState<PopularSearchAdminItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [label, setLabel] = useState("");
  const [type, setType] = useState<LinkType>("category");
  const [categoryId, setCategoryId] = useState("");
  const [discount, setDiscount] = useState("");
  const [searchWord, setSearchWord] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0].value);

  const load = async () => {
    try {
      setLoading(true);
      setRows(await PopularSearchAdminService.getAll());
    } catch {
      toast.error("Failed to load popular searches");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res: any = await httpClient.request<any>({
        url: CATEGORIES_URL,
        method: "GET",
        skipAuth: true,
      });
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setCategories(list);
    } catch {
      // categories are optional; ignore failure
    }
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  /** Build the /shop link from the friendly form choices. */
  const buildHref = (): string | null => {
    switch (type) {
      case "category":
        if (!categoryId) return null;
        return `/shop?categoryIds=${categoryId}`;
      case "discount": {
        const n = Number(discount);
        if (!n || n <= 0) return null;
        return `/shop?minDiscount=${n}`;
      }
      case "bestseller":
        return `/shop?isBestseller=true`;
      case "newarrival":
        return `/shop?isNewArrival=true`;
      case "search":
        if (!searchWord.trim()) return null;
        return `/shop?search=${encodeURIComponent(searchWord.trim())}`;
      default:
        return null;
    }
  };

  const resetForm = () => {
    setLabel("");
    setType("category");
    setCategoryId("");
    setDiscount("");
    setSearchWord("");
  };

  const add = async () => {
    if (!label.trim()) {
      toast.error("Please enter a label");
      return;
    }
    const href = buildHref();
    if (!href) {
      toast.error("Please complete the selection for this type");
      return;
    }
    try {
      await PopularSearchAdminService.create({
        label: label.trim(),
        href,
        order: rows.length + 1,
        imageUrl: icon,
      });
      resetForm();
      toast.success("Added");
      load();
    } catch {
      toast.error("Failed to add");
    }
  };

  const toggle = async (r: PopularSearchAdminItem) => {
    try {
      await PopularSearchAdminService.update(r._id, { isActive: !r.isActive });
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await PopularSearchAdminService.remove(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-1 text-2xl font-semibold">Popular Searches</h1>
      <p className="mb-6 text-sm text-gray-500">
        Add a shortcut, choose what it points to, and it appears on the
        storefront. Hidden items are not shown to customers.
      </p>

      {/* Friendly Add form */}
      <div className="mb-6 rounded border p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Title shown on the tile
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Winter Socks"
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              What should it show?
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LinkType)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Icon
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              {ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Second field changes with the chosen type */}
          {type === "category" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Choose a category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === "discount" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Minimum discount (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="e.g. 30"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          )}

          {type === "search" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Search word
              </label>
              <input
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                placeholder="e.g. antimicrobial"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          )}

          {(type === "bestseller" || type === "newarrival") && (
            <div className="flex items-end">
              <p className="text-sm text-gray-500">
                No extra input needed — this shows all{" "}
                {type === "bestseller" ? "best sellers" : "new arrivals"}.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={add}
            className="rounded bg-black px-5 py-2 text-sm text-white"
          >
            Add
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Title</th>
                <th className="p-3">Shows</th>
                <th className="p-3">Active</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{r.label}</td>
                  <td className="p-3 text-gray-500">{describeHref(r.href)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggle(r)}
                      className={`rounded px-2 py-1 text-xs ${
                        r.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {r.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => remove(r._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No popular searches yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Turn a technical href into a plain-English description for the table. */
function describeHref(href: string): string {
  if (href.includes("isBestseller=true")) return "Best sellers";
  if (href.includes("isNewArrival=true")) return "New arrivals";
  if (href.includes("minDiscount=")) {
    const m = href.match(/minDiscount=(\d+)/);
    return m ? `${m[1]}% or more off` : "Discounted items";
  }
  if (href.includes("search=")) {
    const m = href.match(/search=([^&]+)/);
    return m ? `Search: ${decodeURIComponent(m[1])}` : "Search";
  }
  if (href.includes("categoryIds=")) return "A category";
  return href;
}
