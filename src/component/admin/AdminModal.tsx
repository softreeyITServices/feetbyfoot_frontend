"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOutsideClick?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOutsideClick = true,
}: AdminModalProps) {
  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* MODAL */}
      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 bg-white rounded-2xl border border-neutral-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* HEADER */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-neutral-100 flex items-start justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-sm font-semibold text-neutral-800">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  {description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-all"
            >
              <X size={14} className="text-neutral-500" />
            </button>
          </div>
        )}

        {/* BODY */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}