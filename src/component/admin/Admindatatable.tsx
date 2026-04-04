"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Settings,
} from "lucide-react";

/* =========================================================
   GENERIC DATATABLE
========================================================= */

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T extends { id: string | number }> {
  title?: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  pageSize?: number;
  searchKeys?: (keyof T)[];
  exportable?: boolean;
  onSettings?: (row: T) => void;
  loading?: boolean;
  onSearchChange?: (query: string) => void;
  selectable?: boolean;
  paginationMode?: "client" | "server";
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<T extends { id: string | number }>({
  title = "Data Table",
  description,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onSettings,
  pageSize: defaultPageSize = 10,
  searchKeys = [],
  exportable = false,
  onSearchChange,
  selectable = true,
  paginationMode = "client",
  currentPage,
  totalPages: totalPagesProp,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const isServerPagination = paginationMode === "server";

  /* ================= FILTER ================= */

  const filtered = useMemo(() => {
    if (isServerPagination) return data;
    if (!search.trim() || searchKeys.length === 0) return data;

    const q = search.toLowerCase();

    return data.filter((row) =>
      searchKeys.some((k) =>
        String(row[k] ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, search, searchKeys, isServerPagination]);

  /* ================= SORT ================= */

  const sorted = useMemo(() => {
    if (isServerPagination) return filtered;
    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      const cmp = av.localeCompare(bv, undefined, { numeric: true });

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, isServerPagination]);

  /* ================= PAGINATION ================= */

  const totalPages = isServerPagination
    ? Math.max(1, totalPagesProp ?? 1)
    : Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = isServerPagination
    ? sorted
    : sorted.slice((page - 1) * pageSize, page * pageSize);
  const effectivePage = isServerPagination ? currentPage ?? page : page;

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const toggleSelect = (id: string | number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((r) => r.id)));
    }
  };

  const hasActions = Boolean(onEdit || onDelete || onView || onSettings);

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
          {description && (
            <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => {
                const nextQuery = e.target.value;
                setSearch(nextQuery);
                if (isServerPagination) onPageChange?.(1);
                else setPage(1);
                onSearchChange?.(nextQuery);
              }}
              placeholder="Search..."
              className="h-8 pl-8 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              const nextSize = Number(e.target.value);
              setPageSize(nextSize);
              if (isServerPagination) {
                onPageSizeChange?.(nextSize);
                onPageChange?.(1);
              } else {
                setPage(1);
              }
            }}
            className="h-8 px-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>

          {exportable && (
            <button className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg">
              <Download size={13} />
              Export
            </button>
          )}

          {onAdd && (
            <button
              onClick={onAdd}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg"
            >
              <Plus size={13} />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/60">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      paginated.length > 0 &&
                      selected.size === paginated.length
                    }
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-amber-500"
                  />
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <>
                        <ChevronUp size={9} />
                        <ChevronDown size={9} />
                      </>
                    )}
                  </div>
                </th>
              ))}

              {hasActions && (
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-neutral-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row) => (
              <tr key={row.id}>
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="w-3.5 h-3.5 accent-amber-500"
                    />
                  </td>
                )}

                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-xs">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? "—")}
                  </td>
                ))}

                {hasActions && (
                  <td className="px-4 py-3 flex justify-center h-18 gap-2">
                    {onSettings && (
                      <button
                        onClick={() => onSettings(row)}
                        className="text-neutral-500 hover:text-neutral-700"
                        title="Manage subcategories"
                      >
                        <Settings size={13} />
                      </button>
                    )}

                    {onView && (
                      <button onClick={() => onView(row)}>
                        <Eye size={13} />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(row)}>
                        <Pencil size={13} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Page {effectivePage} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={effectivePage === 1}
              onClick={() => {
                const nextPage = Math.max(1, effectivePage - 1);
                if (isServerPagination) onPageChange?.(nextPage);
                else setPage(nextPage);
              }}
              className="px-2 py-1 border border-neutral-200 rounded disabled:opacity-40"
            >
              Prev
            </button>

            <button
              disabled={effectivePage === totalPages}
              onClick={() => {
                const nextPage = Math.min(totalPages, effectivePage + 1);
                if (isServerPagination) onPageChange?.(nextPage);
                else setPage(nextPage);
              }}
              className="px-2 py-1 border border-neutral-200 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
