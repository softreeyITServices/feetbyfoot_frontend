"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ProfileIcon } from "@/icons/ProfileIcon";
import { CartIcon } from "@/icons/CartIcon";
import { SearchIcon } from "@/icons/SearchIcon";
import CartDrawer from "../ui/CartDrawer";
import { useAppSelector } from "@/store/hooks";

const menuItems = [
  { label: "MENS", href: "/mens" },
  { label: "WOMENS", href: "/womens" },
  { label: "KIDS", href: "/kids" },
  { label: "GIFTS", href: "/gifts", active: true },
  { label: "OUTLET", href: "/outlet" },
  { label: "BRAND", href: "/ourstory" },
  { label: "CONTACT", href: "/contactus" },
];

export default function Navbar() {
  const [openCart, setOpenCart] = useState(false);

  // 🔥 Get cart items from Redux
  const cartItems = useAppSelector(state => state.cart.items);

  // 🔢 Total quantity (NOT items.length)
  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenCart(true);
  };

  return (
    <>
      <header className="shadow-[3px_3px_10px_#BFBFBE] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={36}
              height={36}
            />
          </Link>

          {/* Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-bold px-3 py-1
                  ${
                    item.active
                      ? "bg-yellow-400 text-black"
                      : "text-gray-700 hover:text-black"
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Account */}
            <Link href="/login" aria-label="Account">
              <ProfileIcon width={20} height={20} fill="#000" />
            </Link>

            {/* Cart */}
            <button
              aria-label="Cart"
              onClick={handleCart}
              className="relative"
            >
              <CartIcon width={20} height={20} fill="#000" />

              {/* 🔴 Cart Badge */}
              {cartCount > 0 && (
                <span
                  className="
                    absolute -top-3 -right-2
                    bg-black text-white
                    text-[10px] font-semibold
                    w-5 h-5
                    flex items-center justify-center
                    rounded-full
                  "
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Search */}
            <button aria-label="Search">
              <SearchIcon width={20} height={20} fill="#000" />
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 Redux-powered Cart Drawer */}
      <CartDrawer
        isOpen={openCart}
        onClose={() => setOpenCart(false)}
      />
    </>
  );
}
