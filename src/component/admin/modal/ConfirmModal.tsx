"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AdminModal } from "../AdminModal";

type ConfirmVariant = "default" | "danger";

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loadingText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loadingText = "Processing...",
}: AdminConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const confirmButtonStyle =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-amber-500 hover:bg-amber-600";

  const iconColor =
    variant === "danger"
      ? "bg-red-100 text-red-600"
      : "bg-amber-100 text-amber-600";

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      size="sm"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* ICON */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}
        >
          <AlertTriangle size={18} />
        </div>

        {/* TITLE */}
        <h3 className="text-sm font-semibold text-neutral-800">
          {title}
        </h3>

        {/* DESCRIPTION */}
        {description && (
          <p className="text-xs text-neutral-500 leading-relaxed">
            {description}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-center gap-2 pt-2 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-8 text-xs font-medium text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 h-8 text-xs font-semibold text-white rounded-lg transition-all disabled:opacity-60 ${confirmButtonStyle}`}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}