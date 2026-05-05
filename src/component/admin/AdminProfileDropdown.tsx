"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const getInitials = (name?: string | null) => {
    if (!name) return "AD";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const initials = getInitials(session?.user?.name);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full text-sm">
          {initials}
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