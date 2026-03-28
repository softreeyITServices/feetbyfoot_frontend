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
import { productService } from "@/domain/application/services/product.service";
import type { MenuCategory, MenuGroup, MenuSubcategory } from "@/domain/shared/types/product.type";

const FALLBACK_MENU_ITEMS = [
  { label: "MENS", href: "/mens" },
  { label: "WOMENS", href: "/womens" },
  { label: "KIDS", href: "/kids" },
  { label: "GIFTS", href: "/gifts" },
  { label: "OUTLET", href: "/shop" },
  { label: "CONTACT", href: "/contactus" },
];

function groupPrimaryHref(g: MenuGroup): string {
  if (g.href) return g.href;
  if (g.storefrontPath) return g.storefrontPath;
  return "#";
}

function categoryHref(g: MenuGroup, c: MenuCategory): string {
  if (c.href) return c.href;
  if (g.storefrontPath) {
    const qs = new URLSearchParams();
    qs.set("category", c.id);
    return `${g.storefrontPath}?${qs.toString()}`;
  }
  return "#";
}

function subcategoryHref(
  g: MenuGroup,
  c: MenuCategory,
  s: MenuSubcategory
): string {
  if (s.href) return s.href;
  if (g.storefrontPath) {
    const qs = new URLSearchParams();
    qs.set("category", c.id);
    qs.set("subcategory", s.id);
    return `${g.storefrontPath}?${qs.toString()}`;
  }
  return "#";
}

function pathFromHref(href: string): string {
  try {
    if (href.startsWith("/")) return href.split("?")[0] ?? href;
    const u = new URL(href);
    return u.pathname;
  } catch {
    return href.split("?")[0] ?? href;
  }
}

function isGroupPathActive(pathname: string, g: MenuGroup): boolean {
  const raw = g.storefrontPath || g.href;
  if (!raw || raw === "#") return false;
  const path = pathFromHref(raw);
  if (!path || path === "#") return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function isFallbackActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const openCartState = useAppSelector((state) => state.ui.isCartOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLFormElement | null>(null);
  const [megaGroups, setMegaGroups] = useState<MenuGroup[] | null>(null);

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doc = await productService.getMegaMenu();
        if (cancelled) return;
        if (doc.position === "footer") {
          setMegaGroups(null);
          return;
        }
        setMegaGroups(doc.groups?.length ? doc.groups : null);
      } catch {
        if (!cancelled) setMegaGroups(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const useApiNav = Boolean(megaGroups && megaGroups.length > 0);

  return (
    <>
      <header className="shadow-[3px_3px_10px_#BFBFBE] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={36}
              height={36}
            />
          </Link>

          {/* Desktop: mega menu or fallback */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 min-w-0 justify-center flex-1">
            {useApiNav && megaGroups
              ? megaGroups.map((g) => {
                  const categories = g.categories ?? [];
                  const hasFlyout = categories.length > 0;
                  const primary = groupPrimaryHref(g);
                  const groupActive = isGroupPathActive(pathname, g);

                  if (!hasFlyout) {
                    return (
                      <Link
                        key={g.id}
                        href={primary}
                        className={`text-sm font-bold px-2 lg:px-3 py-1 whitespace-nowrap rounded ${
                          groupActive
                            ? "bg-yellow-400 text-black"
                            : "text-gray-700 hover:text-black"
                        }`}
                      >
                        {g.name}
                      </Link>
                    );
                  }

                  return (
                    <div key={g.id} className="relative group">
                      <Link
                        href={primary}
                        className={`text-sm font-bold px-2 lg:px-3 py-1 inline-flex items-center gap-0.5 whitespace-nowrap rounded ${
                          groupActive
                            ? "bg-yellow-400 text-black"
                            : "text-gray-700 hover:text-black"
                        }`}
                      >
                        {g.name}
                        <span
                          className="text-[10px] opacity-70 group-hover:rotate-180 transition-transform"
                          aria-hidden
                        >
                          ▾
                        </span>
                      </Link>
                      <div
                        className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-[60]"
                        role="region"
                        aria-label={`${g.name} categories`}
                      >
                        <div className="bg-white border border-neutral-200 shadow-lg rounded-lg p-4 max-h-[min(70vh,480px)] overflow-y-auto min-w-[min(90vw,720px)] max-w-[90vw]">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map((c) => {
                              const subs = c.subcategories ?? [];
                              const catLink = categoryHref(g, c);
                              return (
                                <div key={c.id} className="min-w-0">
                                  <Link
                                    href={catLink}
                                    className="text-xs font-bold text-black hover:underline block mb-2"
                                  >
                                    {c.name}
                                  </Link>
                                  {c.image ? (
                                    <Link
                                      href={catLink}
                                      className="block mb-2 rounded overflow-hidden bg-neutral-100 max-h-20"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element -- menu image URLs come from CMS / various hosts */}
                                      <img
                                        src={c.image}
                                        alt=""
                                        className="w-full h-20 object-cover"
                                      />
                                    </Link>
                                  ) : null}
                                  <ul className="space-y-1">
                                    {subs.map((s) => (
                                      <li key={s.id}>
                                        <Link
                                          href={subcategoryHref(g, c, s)}
                                          className="text-xs text-gray-600 hover:text-black line-clamp-2"
                                        >
                                          {s.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              : FALLBACK_MENU_ITEMS.map((item) => {
                  const isActive = isFallbackActive(pathname, item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`text-sm font-bold px-3 py-1 whitespace-nowrap rounded ${
                        isActive
                          ? "bg-yellow-400 text-black"
                          : "text-gray-700 hover:text-black"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
          </nav>

          {/* Mobile: primary group links (no flyout) */}
          {useApiNav && megaGroups ? (
            <nav className="flex md:hidden items-center gap-2 overflow-x-auto max-w-[45%] sm:max-w-[55%] scrollbar-thin pb-0.5">
              {megaGroups.map((g) => {
                const primary = groupPrimaryHref(g);
                const groupActive = isGroupPathActive(pathname, g);
                return (
                  <Link
                    key={g.id}
                    href={primary}
                    className={`text-[11px] font-bold px-2 py-1 shrink-0 rounded whitespace-nowrap ${
                      groupActive
                        ? "bg-yellow-400 text-black"
                        : "text-gray-700"
                    }`}
                  >
                    {g.name}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          <div className="flex items-center gap-3 shrink-0">
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

            <Link href="/login" aria-label="Account">
              <ProfileIcon width={20} height={20} fill="#000" />
            </Link>

            <Link href="/wishlists" aria-label="Wishlists">
              <WishlistIcon width={24} height={24} fill="#000" />
            </Link>

            <button
              aria-label="Cart"
              onClick={handleCart}
              className="relative"
            >
              <CartIcon width={20} height={20} fill="#000" />

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

            <button
              aria-label="Search"
              className="md:hidden"
              onClick={() => router.push("/shop")}
            >
              <SearchIcon width={20} height={20} fill="#000" />
            </button>
          </div>
        </div>
      </header>

      <CartDrawer
        isOpen={openCartState}
        onClose={() => dispatch(closeCart())}
      />
    </>
  );
}
