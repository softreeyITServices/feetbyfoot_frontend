"use client";

import { useState } from "react";

export default function AdminProfileDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full text-sm">
          AS
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-md">
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
            Profile
          </button>
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
            Settings
          </button>
          <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}