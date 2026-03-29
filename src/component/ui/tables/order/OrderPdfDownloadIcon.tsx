"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type OrderPdfDownloadIconProps = {
  enabled: boolean;
  enabledTitle?: string;
  disabledTitle: string;
  onDownload: () => Promise<void>;
};

export function OrderPdfDownloadIcon({
  enabled,
  enabledTitle = "Download PDF",
  disabledTitle,
  onDownload,
}: OrderPdfDownloadIconProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={!enabled || loading}
      title={enabled ? enabledTitle : disabledTitle}
      onClick={async () => {
        setLoading(true);
        try {
          await onDownload();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Download failed");
        } finally {
          setLoading(false);
        }
      }}
      className={`inline-flex items-center justify-center p-2 rounded-full transition ${
        enabled && !loading
          ? "text-gray-700 hover:bg-gray-100"
          : "text-gray-300 cursor-not-allowed"
      }`}
      aria-disabled={!enabled || loading}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
      ) : (
        <FileDown className="w-5 h-5" aria-hidden />
      )}
    </button>
  );
}
