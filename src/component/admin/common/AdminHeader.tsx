"use client";

import { Menu, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ConfirmModal } from "../modal/ConfirmModal";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

interface AdminHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

function useOutsideClick(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

function getInitials(name?: string) {
  if (!name) return "A";

  const parts = name.split(" ");

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? "A";
  }

  return (
    (parts[0][0] ?? "") +
    (parts[1][0] ?? "")
  ).toUpperCase();
}

export default function AdminHeader({ onToggle }: AdminHeaderProps) {
  const { data: session } = useSession();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    profileRef as React.RefObject<HTMLElement>,
    () => {}
  );

  const name = session?.user?.name ?? "Admin";
  const email = session?.user?.email ?? "";

  const initials = getInitials(name);

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-5 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50"
        style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.06)" }}
      >

        {/* left */}
        <div className="flex items-center gap-3">

          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-150"
          >
            <Menu size={17} />
          </button>

          <div className="flex items-center gap-2">

            <div className="w-6 h-6 rounded flex items-center justify-center">
              <Image src={`/assets/images/logo.png`} width={40} height={40} alt=""/>
            </div>

            <span className="text-sm font-semibold text-neutral-900">
              FeetByFoot
              <span className="ml-1.5 text-[10px] text-neutral-400 uppercase">
                Admin
              </span>
            </span>

          </div>

        </div>

        {/* right */}
        <div className="flex items-center gap-3">

          <div
            ref={profileRef}
            className="flex items-center gap-3 px-2"
          >

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">

              <span className="text-white text-xs font-bold">
                {initials}
              </span>

            </div>

            <div className="hidden sm:flex flex-col leading-none">

              <span className="text-xs font-semibold text-neutral-800">
                {name}
              </span>

              <span className="text-[10px] text-neutral-400">
                {email}
              </span>

            </div>

            <button
              onClick={() => setLogoutOpen(true)}
              className="ml-2 flex items-center gap-1 text-red-500 hover:text-red-600 text-xs"
            >
              <LogOut size={14} />
              Logout
            </button>

          </div>

        </div>

      </header>

      <ConfirmModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        variant="danger"
        title="Log out"
        description="Are you sure you want to log out from admin?"
        confirmText="Log out"
        cancelText="Cancel"
        loadingText="Logging out..."
        onConfirm={async () => {
          await signOut({
            callbackUrl: "/login"
          });
        }}
      />
    </>
  );
}