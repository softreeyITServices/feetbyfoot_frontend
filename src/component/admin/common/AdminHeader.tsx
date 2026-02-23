"use client";

import {
  Menu, Bell, ChevronDown,
  User, Settings, LogOut,
  ShoppingBag, UserPlus, AlertTriangle, Package,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ConfirmModal } from "../modal/ConfirmModal";
import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NOTIFICATIONS = [
  {
    id: 1,
    icon: ShoppingBag,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "New order received",
    description: "Order #4521 placed by Rahul Mehta",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: UserPlus,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    title: "New user registered",
    description: "priya.sharma@gmail.com just signed up",
    time: "18 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "Low stock alert",
    description: "Nike Air Max 90 — only 3 units left",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    icon: Package,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Shipment dispatched",
    description: "Order #4498 shipped via BlueDart",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    icon: ShoppingBag,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Order cancelled",
    description: "Order #4489 was cancelled by customer",
    time: "Yesterday",
    unread: false,
  },
];

function useOutsideClick(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

export default function AdminHeader({ onToggle }: AdminHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useOutsideClick(profileRef as React.RefObject<HTMLElement>, () => setProfileOpen(false));
  useOutsideClick(notifRef as React.RefObject<HTMLElement>, () => setNotifOpen(false));

  const unreadCount = notifications.filter((n) => n.unread).length;
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-5 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50"
        style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.06)" }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-150"
            aria-label="Toggle sidebar"
          >
            <Menu size={17} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tight">F</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">
              FeetByFoot
              <span className="ml-1.5 text-[10px] font-medium text-neutral-400 uppercase tracking-widest">
                Admin
              </span>
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">


          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-white border border-neutral-200 rounded-xl shadow-lg shadow-neutral-200/60 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="divide-y divide-neutral-50 max-h-85 overflow-y-auto">
                  {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer ${notif.unread ? "bg-amber-50/40" : ""
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${notif.iconBg}`}
                        >
                          <Icon size={14} className={notif.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[12px] font-medium leading-snug ${notif.unread ? "text-neutral-900" : "text-neutral-600"}`}>
                              {notif.title}
                            </p>
                            {notif.unread && (
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{notif.description}</p>
                          <p className="text-[10px] text-neutral-400 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-100 px-4 py-2.5">
                  <button className="w-full text-center text-[12px] text-amber-600 hover:text-amber-700 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-neutral-200 mx-1" />

          {/* Avatar with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 h-9 px-2 rounded-lg hover:bg-neutral-100 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center ring-2 ring-amber-200">
                <span className="text-white text-[10px] font-bold">AS</span>
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
                <span className="text-xs font-semibold text-neutral-800">Admin Super</span>
                <span className="text-[10px] text-neutral-400">admin@feetbyfoot.com</span>
              </div>
              <ChevronDown
                size={12}
                className={`text-neutral-400 hidden sm:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-neutral-200 rounded-xl shadow-lg shadow-neutral-200/60 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 ring-2 ring-amber-200">
                    <span className="text-white text-xs font-bold">AS</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">Admin Super</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">admin@feetbyfoot.com</p>
                  </div>
                </div>

                <div className="py-1.5">
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                    <User size={14} className="text-neutral-400" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors">
                    <Settings size={14} className="text-neutral-400" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-neutral-100 py-1.5">
                  <button
                    onClick={() => {
                      setLogoutOpen(true);
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <ConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        variant="danger"
        title="Log out"
        description="Are you sure you want to log out from the admin panel?"
        confirmText="Log out"
        cancelText="Cancel"
        loadingText="Logging out..."
        onConfirm={async () => {
          await signOut({ callbackUrl: "/login" });
        }}
      />
    </>
  );
}