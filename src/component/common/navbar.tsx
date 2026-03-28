"use client";

import Link from "next/link";
import Image from "next/image";
import { ProfileIcon } from "@/icons/ProfileIcon";
import { CartIcon } from "@/icons/CartIcon";
import { SearchIcon } from "@/icons/SearchIcon";
import CartDrawer from "../ui/CartDrawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openCart, closeCart } from "@/store/slices/ui.slice";
import { WishlistIcon } from "@/icons/WishlistIcon";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";


const menuItems = [
  { label: "MENS", href: "/mens" },
  { label: "WOMENS", href: "/womens" },
  { label: "KIDS", href: "/kids" },
  { label: "GIFTS", href: "/gifts" },
  { label: "OUTLET", href: "/shop" },
  // { label: "BRAND", href: "/brand" },
  { label: "CONTACT", href: "/contactus" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const openCartState = useAppSelector(state => state.ui.isCartOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLFormElement | null>(null);

  // 🔥 Get cart items from Redux
  const cartItems = useAppSelector(state => state.cart.items);

  // 🔢 Total quantity (NOT items.length)
  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    if (pathname === "/shop") {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get("search") ?? "");
      return;
    }
    setSearchTerm("");
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [searchOpen]);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openCart());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) {
      router.push("/shop");
      setSearchOpen(false);
      return;
    }

    const params = new URLSearchParams();
    params.set("search", q);
    router.push(`/shop?${params.toString()}`);
    setSearchOpen(false);
  };

  return (
    <>
      <header className="shadow-[3px_3px_10px_#BFBFBE] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
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
            {menuItems.map(item => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-bold px-3 py-1
                  ${isActive
                      ? "bg-yellow-400 text-black"
                      : "text-gray-700 hover:text-black"
                    }
                `}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <form
              ref={searchRef}
              onSubmit={handleSearchSubmit}
              className={`hidden md:flex items-center rounded-full transition-all duration-200 ${
                searchOpen
                  ? "w-60 border border-gray-200 bg-white px-3 py-1.5"
                  : "w-10 justify-center p-2"
              }`}
            >
              <button
                type="button"
                aria-label="Search products"
                className="shrink-0"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <SearchIcon width={18} height={18} fill="#000" />
              </button>
              {searchOpen && (
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search socks..."
                  className="ml-2 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              )}
            </form>

            {/* Account */}
            <Link href="/login" aria-label="Account">
              <ProfileIcon width={20} height={20} fill="#000" />
            </Link>

            {/* Wishlist */}
            <Link href="/wishlists" aria-label="Wishlists">
              <WishlistIcon width={24} height={24} fill="#000" />
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

            {/* Search (mobile) */}
            <button
              aria-label="Search"
              className="md:hidden"
              onClick={() => router.push("/shop")}
            >
              {/* <SearchIcon width={20} height={20} fill="#000" /> */}
            </button>
          </div>
        </div>
      </header>

      {/* 🔥 Redux-powered Cart Drawer */}
      <CartDrawer
        isOpen={openCartState}
        onClose={() => dispatch(closeCart())}
      />
    </>
  );
}
