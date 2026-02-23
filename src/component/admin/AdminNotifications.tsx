"use client";

export default function AdminNotifications() {
  return (
    <button className="relative">
      <span className="text-xl">🔔</span>
      <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full">
        3
      </span>
    </button>
  );
}