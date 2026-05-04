"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface ActionItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface RowActionMenuProps {
  actions: ActionItem[];
}

export const RowActionMenu = ({ actions }: RowActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-gray-100 rounded-full transition"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 min-w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-100">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              className={`
          w-full text-left px-3 py-2 text-sm 
          hover:bg-gray-50 
          transition-colors
          ${action.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"}
        `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
