"use client";

import React from "react";

interface ConfirmModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

function ConfirmModal({
  title = "Confirm Action",
  description = "This action cannot be undone.",
  isOpen,
  onClose,
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">
          {title}
        </h2>

        <p className="text-sm text-neutral-600">{description}</p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg"
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;