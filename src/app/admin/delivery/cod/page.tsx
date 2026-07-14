"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Column, DataTable } from "@/component/admin/Admindatatable";
import {
  AdminDeliveryService,
  RemittanceReport,
  UnremittedRow,
  daysSince,
} from "@/domain/application/services/admin/delivery.service";
import toast from "react-hot-toast";

type UnremittedTableRow = UnremittedRow & { id: string };

/** Plain English for every way a remittance row can fail to match an order. */
const PROBLEM_TEXT: Record<string, string> = {
  AMOUNT_MISMATCH: "Delhivery paid a different amount than the order was worth",
  UNKNOWN_WAYBILL: "No order in our system has this waybill",
  NOT_COD: "Delhivery sent cash for an order the customer paid online",
  DUPLICATE: "This row was already imported",
};

const rupees = (paise?: number) =>
  paise === undefined ? "—" : `₹${(paise / 100).toFixed(2)}`;

export default function AdminCodPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<RemittanceReport | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  // Kept so "Download exceptions" can re-post the same file instead of making
  // the admin pick it again.
  const [lastFile, setLastFile] = useState<File | null>(null);
  /**
   * Delhivery's export does not include the remittance number in the rows —
   * it names the download folder after it (R5473872026070600006). We need it
   * as the idempotency key, so the admin types it in.
   */
  const [remittanceNumber, setRemittanceNumber] = useState("");

  const [rows, setRows] = useState<UnremittedTableRow[]>([]);
  const [graceDays, setGraceDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminDeliveryService.listUnremitted(graceDays);
      setRows(data.map((r) => ({ ...r, id: r._id })));
    } catch {
      toast.error("Could not load unremitted COD orders");
    } finally {
      setLoading(false);
    }
  }, [graceDays]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    setReport(null);
    try {
      const result = await AdminDeliveryService.uploadRemittance(
        file,
        remittanceNumber.trim(),
      );
      setReport(result);

      if (result.needsReview > 0 || result.skippedRows.length > 0) {
        toast.error(`${result.matched} matched, ${result.needsReview} need review`);
      } else {
        toast.success(`${result.matched} orders reconciled`);
      }
      void load();
    } catch (error: unknown) {
      // The backend explains exactly which columns it found. Surface that
      // rather than a generic failure, since the file format varies by account.
      const message =
        (error as { message?: string })?.message ?? "Could not read that file";
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const owed = rows.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

  const columns: Column<UnremittedTableRow>[] = [
    { key: "orderNumber", label: "Order", sortable: true },
    {
      key: "delhivery",
      label: "Waybill",
      render: (r) => r.delhivery?.waybill ?? "—",
    },
    {
      key: "totalAmount",
      label: "Amount owed",
      sortable: true,
      render: (r) => `₹${Number(r.totalAmount).toFixed(2)}`,
    },
    {
      key: "deliveredAt",
      label: "Delivered",
      render: (r) =>
        r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString() : "—",
    },
    {
      key: "id",
      label: "Days outstanding",
      render: (r) => {
        const days = daysSince(r.deliveredAt);
        return (
          <span className={days !== null && days > 14 ? "text-red-600 font-semibold" : ""}>
            {days === null ? "—" : days}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-4">
      {/* ---------- Upload ---------- */}
      <section>
        <h1 className="text-xl font-semibold">COD Reconciliation</h1>
        <p className="mb-4 max-w-3xl text-sm text-gray-600">
          Delhivery has no API for remittances, so the report has to be uploaded
          by hand. Uploading the same file twice is safe — repeated rows are
          ignored, never counted twice.
        </p>

        {/* Where the file comes from. Without this the admin has no idea what
            to upload, and the whole reconciliation never gets used. */}
        <div className="mb-4 max-w-3xl rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="mb-2 font-medium text-blue-900">
            Where to get this file
          </p>
          <ol className="ml-4 list-decimal space-y-1 text-blue-900">
            <li>
              Sign in to{" "}
              <a
                href="https://one.delhivery.com/settings/remittance"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Delhivery One
              </a>
            </li>
            <li>
              Go to <strong>Main Menu → Finances → Remittance</strong>
            </li>
            <li>
              Open a remittance number and <strong>download</strong> it
            </li>
            <li>Upload that CSV below</li>
          </ol>
          <p className="mt-2 text-xs text-blue-800">
            The file lists each waybill and the cash Delhivery collected for it.
            The remittance number is <em>not</em> inside the file — it is the
            name of the folder you downloaded, and you type it in below.
          </p>
        </div>

        <label className="mb-3 block max-w-md text-sm">
          <span className="font-medium">Remittance number</span>
          <input
            type="text"
            value={remittanceNumber}
            onChange={(e) => setRemittanceNumber(e.target.value)}
            placeholder="R5473872026070600006"
            className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
          />
          <span className="text-xs text-gray-500">
            From Finances → Remittance. This is what stops the same report being
            counted twice.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          {/* A bare <input type="file"> reads as unstyled browser chrome and
              nobody notices it. Hide it and drive it from a real button. */}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedName(file.name);
                setLastFile(file);
                void upload(file);
              }
            }}
          />

          <button
            type="button"
            disabled={uploading || !remittanceNumber.trim()}
            onClick={() => fileRef.current?.click()}
            title={
              remittanceNumber.trim()
                ? undefined
                : "Enter the remittance number first"
            }
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Reconciling…" : "Upload Remittance Report"}
          </button>

          {selectedName && !uploading && (
            <span className="text-sm text-gray-600">
              Last file: <strong>{selectedName}</strong>
            </span>
          )}

          <span className="text-xs text-gray-500">CSV only</span>
        </div>

        {report && (
          <div className="mt-4 rounded border p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <Stat label="Rows imported" value={report.ingested} />
              <Stat label="Matched" value={report.matched} tone="good" />
              <Stat
                label="Need review"
                value={report.needsReview}
                tone={report.needsReview ? "bad" : undefined}
              />
              <Stat
                label="Unreadable rows"
                value={report.skippedRows.length}
                tone={report.skippedRows.length ? "bad" : undefined}
              />
            </div>

            {report.skippedRows.length > 0 && (
              <div className="mt-3 rounded bg-amber-50 p-3 text-sm">
                <p className="font-medium">These rows could not be read:</p>
                <ul className="ml-4 list-disc">
                  {report.skippedRows.map((s) => (
                    <li key={s.line}>
                      Line {s.line}: {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.exceptions.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Rows that did not match. These orders are <em>not</em> marked
                    paid — a short payment must never be accepted silently.
                  </p>
                  <button
                    onClick={() =>
                      lastFile &&
                      AdminDeliveryService.uploadRemittanceExceptions(
                        lastFile,
                        remittanceNumber.trim(),
                      ).catch(() => toast.error("Download failed"))
                    }
                    disabled={!lastFile}
                    className="shrink-0 rounded border px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Download as CSV
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500">
                    <tr>
                      <th className="py-1">Waybill</th>
                      <th>Order</th>
                      <th>Problem</th>
                      <th className="text-right">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.exceptions.map((e) => (
                      <tr key={`${e.remittanceNumber}-${e.waybill}`} className="border-t">
                        <td className="py-1">{e.waybill}</td>
                        <td>{e.orderNumber ?? "Not found"}</td>
                        <td>{PROBLEM_TEXT[e.status] ?? e.status}</td>
                        <td
                          className={`text-right ${(e.variancePaise ?? 0) < 0 ? "text-red-600" : ""
                            }`}
                        >
                          {rupees(e.variancePaise)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---------- Unremitted ---------- */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Money Delhivery owes us</h2>
            <p className="text-sm text-gray-600">
              Delivered COD orders whose cash has not reached our bank.{" "}
              <strong>₹{owed.toFixed(2)}</strong> outstanding across {rows.length}{" "}
              order{rows.length === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="flex items-end gap-2">
            <label className="text-sm">
              Older than
              <select
                value={graceDays}
                onChange={(e) => setGraceDays(Number(e.target.value))}
                className="ml-2 rounded border px-2 py-1"
              >
                <option value={2}>2 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </label>
            <button
              onClick={() =>
                AdminDeliveryService.exportUnremitted(graceDays).catch(() =>
                  toast.error("Export failed"),
                )
              }
              className="rounded border px-3 py-2 text-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          selectable={false}
          searchKeys={["orderNumber"]}
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "bad";
}) {
  const colour =
    tone === "good" ? "text-green-700" : tone === "bad" ? "text-red-600" : "";
  return (
    <div>
      <div className={`text-2xl font-semibold ${colour}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
