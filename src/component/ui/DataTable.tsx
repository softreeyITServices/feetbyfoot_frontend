"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

export interface PaginationConfig {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  pagination?: PaginationConfig;
  rowKey?: (row: T, index: number) => string;
  emptyMessage?: string;
}

// Generate page numbers with ellipsis
const generatePageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];
  const showEllipsis = totalPages > 5;

  if (!showEllipsis) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  if (currentPage <= 3) {
    pages.push(2, 3, "ellipsis-end");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push("ellipsis-start");
    pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push("ellipsis-start");
    pages.push(currentPage - 1, currentPage, currentPage + 1);
    pages.push("ellipsis-end");
    pages.push(totalPages);
  }

  return pages;
};

export function DataTable<T>({
  columns,
  data,
  loading = false,
  searchable = false,
  onSearch,
  pagination,
  rowKey,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  /* ---------------- Debounced Search ---------------- */
  useEffect(() => {
    if (!onSearch) return;

    const handler = setTimeout(() => {
      onSearch(searchValue);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue, onSearch]);

  /* ---------------- Pagination Helpers ---------------- */
  const pageNumbers = useMemo(() => {
    if (!pagination) return [];
    return generatePageNumbers(pagination.page, pagination.totalPages);
  }, [pagination]);

  const startItem =
    pagination && pagination.totalItems && pagination.pageSize
      ? (pagination.page - 1) * pagination.pageSize + 1
      : null;

  const endItem =
    pagination && pagination.totalItems && pagination.pageSize
      ? Math.min(
        pagination.page * pagination.pageSize,
        pagination.totalItems
      )
      : null;

  return (
    // FIX 1: Removed "overflow-hidden" (was "overflow-hiddeb" — a typo that still
    // applied overflow clipping in some browsers, and logically should not be here
    // at all since it clips absolutely-positioned row menus/dropdowns).
    <div className="bg-white w-full">
      <div className={`flex ${searchable ? 'justify-between' : 'justify-end'}`}>
        {/* Search */}
        {searchable && (
          <div className="py-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && (
          <div className="flex items-center px-6 py-4 text-sm gap-2">
            {/* Previous Button */}
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="px-3 py-1 border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers with Ellipsis */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((num, idx) => {
                if (typeof num === "string") {
                  return (
                    <span
                      key={`${num}-${idx}`}
                      className="px-3 py-1 text-gray-400"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={num}
                    onClick={() => pagination.onPageChange(num)}
                    className={`px-3 py-1 hover:bg-gray-50 transition-colors ${
                      num === pagination.page
                        ? "bg-black text-white hover:bg-gray-800"
                        : ""
                    }`}
                    aria-label={`Page ${num}`}
                    aria-current={num === pagination.page ? "page" : undefined}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="px-3 py-1 border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page Size Selector */}
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  pagination.onPageSizeChange?.(Number(e.target.value))
                }
                className="ml-2 px-2 py-1 border text-sm hover:bg-gray-50 cursor-pointer"
                aria-label="Items per page"
              >
                {[1, 5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Table — overflow-x-auto enables horizontal scroll on mobile.
          The RowActionMenu dropdown uses createPortal so it renders in document.body
          and is never clipped by this scroll container. */}
      <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-left">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-6 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-6 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, rowIndex) => (
                <tr
                  key={rowKey ? rowKey(row, rowIndex) : rowIndex.toString()}
                  className="relative border-t border-gray-300 hover:bg-gray-50"
                >
                  {columns.map((col, colIndex) => (
                    // FIX 3: Added "overflow-visible" to each <td> to ensure the cell itself
                    // does not create a clipping context for the dropdown.
                    <td key={colIndex} className="px-6 py-4 overflow-visible">
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {pagination && (
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-t text-sm gap-4">
          <div className="text-gray-500">
            {startItem && endItem && pagination.totalItems
              ? `Showing ${startItem}–${endItem} of ${pagination.totalItems}`
              : `Page ${pagination.page} of ${pagination.totalPages}`}
          </div>
        </div>
      )}
    </div>
  );
}