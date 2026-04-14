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
import { ChevronDown } from "lucide-react";
import { productService } from "@/domain/application/services/product.service";
import type { MenuCategory, MenuGroup } from "@/domain/shared/types/product.type";
import {
  categoryHref,
  categoryIsHeaderOnly,
  groupIsHeaderOnly,
  groupPrimaryHref,
  isGroupPathActive,
  subcategoryHref,
  subcategoryIsHeaderOnly,
} from "@/lib/megaMenuLinks";

function DesktopNavSkeleton() {
  return (
    <div
      className="flex items-center gap-2"
      aria-label="Loading navigation"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-7 w-12 lg:w-14 rounded bg-neutral-200 animate-pulse"
        />
      ))}
    </div>
  );
}

function DesktopMegaNav({
  pathname,
  megaGroups,
}: {
  pathname: string;
  megaGroups: MenuGroup[];
}) {
  return (
    <>
      {megaGroups.map((g) => {
        const categories = g.categories ?? [];
        const hasFlyout = categories.length > 0;
        const primary = groupPrimaryHref(g);
        const groupActive = isGroupPathActive(pathname, g);
        const headerOnly = groupIsHeaderOnly(g);
        const groupLabelClass = `text-[12px] tracking-[0.08em] uppercase px-2 lg:px-3 py-2 whitespace-nowrap transition-colors ${
          groupActive
            ? "text-black font-semibold"
            : "text-[#555] font-medium hover:text-black"
        }`;
        const groupLabelClassFlyout = `${groupLabelClass} inline-flex items-center gap-1`;

        if (!hasFlyout) {
          if (headerOnly) {
            return (
              <span
                key={g.id}
                className={`${groupLabelClass} cursor-default`}
                role="presentation"
              >
                {g.name}
              </span>
            );
          }
          return (
            <Link key={g.id} href={primary} className={groupLabelClass}>
              {g.name}
            </Link>
          );
        }

        return (
          <div key={g.id} className="relative group">
            {headerOnly ? (
              <span className={`${groupLabelClassFlyout} cursor-default`}>
                {g.name}
                <ChevronDown
                  className="h-3 w-3 opacity-70 group-hover:rotate-180 transition-transform shrink-0"
                  aria-hidden
                />
              </span>
            ) : (
              <Link href={primary} className={groupLabelClassFlyout}>
                {g.name}
                <ChevronDown
                  className="h-3 w-3 opacity-70 group-hover:rotate-180 transition-transform shrink-0"
                  aria-hidden
                />
              </Link>
            )}

            {/* Flyout panel — fixed to full viewport width */}
            <div
              className="fixed left-0 top-[72px] w-screen opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-[60]"
              role="region"
              aria-label={`${g.name} categories`}
            >
              <div className="bg-[#f4f4f4] border-t border-neutral-300 shadow-xl w-full px-8 py-8 h-[360px] overflow-hidden">
                {/* ✅ KEY FIX: use inline-grid + auto columns so items only take the space they need and align left */}
                <div
                  className="inline-grid gap-6"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(categories.length, 6)}, 160px)`,
                  }}
                >
                  {categories.map((c) => {
                    const subs = c.subcategories ?? [];
                    const catHeader = categoryIsHeaderOnly(g, c);
                    const catLink = categoryHref(g, c);
                    return (
                      <div key={c.id} className="w-[160px]">
                        {/* Image */}
                        {c.image && (
                          catHeader ? (
                            <div className="mb-3 overflow-hidden bg-neutral-100">
                              <Image
                                src={c.image}
                                width={160}
                                height={170}
                                alt={c.name}
                                className="w-full h-[170px] object-cover"
                              />
                            </div>
                          ) : (
                            <Link href={catLink} className="block mb-3 overflow-hidden bg-neutral-100">
                              <Image
                                src={c.image}
                                width={160}
                                height={170}
                                alt={c.name}
                                className="w-full h-[170px] object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </Link>
                          )
                        )}
                        {/* Category name */}
                        {catHeader ? (
                          <span className="text-[11px] font-bold text-black uppercase tracking-wide block mb-2 cursor-default">
                            {c.name}
                          </span>
                        ) : (
                          <Link
                            href={catLink}
                            className="text-[11px] font-bold text-black uppercase tracking-wide hover:underline block mb-2"
                          >
                            {c.name}
                          </Link>
                        )}
                        {/* Subcategory list */}
                        <ul className="space-y-1.5">
                          {subs.map((s) => {
                            const subHeader = subcategoryIsHeaderOnly(g, s);
                            return (
                              <li key={s.id}>
                                {subHeader ? (
                                  <span className="text-xs text-gray-500 cursor-default">
                                    {s.name}
                                  </span>
                                ) : (
                                  <Link
                                    href={subcategoryHref(g, c, s)}
                                    className="text-xs text-gray-600 hover:text-black"
                                  >
                                    {s.name}
                                  </Link>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const openCartState = useAppSelector((state) => state.ui.isCartOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLFormElement | null>(null);
  const [megaMenuReady, setMegaMenuReady] = useState(false);
  const [megaGroups, setMegaGroups] = useState<MenuGroup[]>([]);

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doc = await productService.getMegaMenu();
        if (cancelled) return;
        if (doc.position === "footer") {
          setMegaGroups([]);
          return;
        }
        setMegaGroups(doc.groups?.length ? doc.groups : []);
      } catch {
        if (!cancelled) setMegaGroups([]);
      } finally {
        if (!cancelled) setMegaMenuReady(true);
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

  const hasMegaNav = megaMenuReady && megaGroups.length > 0;

  let desktopNavBody: React.ReactNode;
  if (!megaMenuReady) {
    desktopNavBody = <DesktopNavSkeleton />;
  } else if (hasMegaNav) {
    desktopNavBody = (
      <DesktopMegaNav pathname={pathname} megaGroups={megaGroups} />
    );
  } else {
    desktopNavBody = null;
  }

  let mobileNavBody: React.ReactNode;
  if (megaMenuReady && hasMegaNav) {
    mobileNavBody = (
      <nav className="flex md:hidden items-center gap-2 overflow-x-auto max-w-[45%] sm:max-w-[55%] scrollbar-thin pb-0.5">
        {megaGroups.map((g) => {
          const primary = groupPrimaryHref(g);
          const groupActive = isGroupPathActive(pathname, g);
          const isOutlet = g.name.toLowerCase() === "outlet";
          const mobileClass = `text-[11px] tracking-wide uppercase px-2 py-1 shrink-0 whitespace-nowrap transition-colors ${
            isOutlet
              ? "text-[#F93A3A] font-semibold"
              : groupActive
              ? "text-black font-semibold"
              : "text-[#555] font-medium"
          }`;
          if (groupIsHeaderOnly(g)) {
            return (
              <span
                key={g.id}
                className={`${mobileClass} cursor-default`}
                role="presentation"
              >
                {g.name}
              </span>
            );
          }
          return (
            <Link key={g.id} href={primary} className={mobileClass}>
              {g.name}
            </Link>
          );
        })}
      </nav>
    );
  } else if (!megaMenuReady) {
    mobileNavBody = (
      <div
        className="flex md:hidden items-center gap-1.5 max-w-[40%] overflow-hidden"
        aria-label="Loading navigation"
      >
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-6 w-10 shrink-0 rounded bg-neutral-200 animate-pulse"
          />
        ))}
      </div>
    );
  } else {
    mobileNavBody = null;
  }

  return (
    <>
      <header className="bg-[#f4f4f4] sticky top-0 z-50">
        <div className="max-w-[90rem] mx-auto px-4 lg:px-8 h-[72px] flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={36}
              height={36}
            />
          </Link>

          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 min-w-0 justify-center flex-1 min-h-8"
            aria-busy={!megaMenuReady}
          >
            {desktopNavBody}
          </nav>

          {mobileNavBody}

          <div className="flex items-center gap-5 lg:gap-7 shrink-0 text-gray-800">
            <Link href="/login" aria-label="Account" className="hover:text-black transition-colors">
              <ProfileIcon width={21} height={21} fill="currentColor" />
            </Link>

            <form
              ref={searchRef}
              onSubmit={handleSearchSubmit}
              className={`hidden md:flex items-center rounded-full transition-all duration-200 ${
                searchOpen
                  ? "w-60 border border-gray-300 bg-white px-3 py-1.5"
                  : "w-10 justify-center p-2 hover:text-black cursor-pointer"
              }`}
            >
              <button
                type="button"
                aria-label="Search products"
                className="shrink-0"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <SearchIcon width={20} height={20} fill="currentColor" />
              </button>
              {searchOpen && (
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="ml-2 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              )}
            </form>

            <button
              aria-label="Search"
              className="md:hidden hover:text-black transition-colors"
              onClick={() => router.push("/shop")}
            >
              <SearchIcon width={20} height={20} fill="currentColor" />
            </button>

            <Link href="/wishlists" aria-label="Wishlists" className="hover:text-black transition-colors hidden lg:block">
              <WishlistIcon width={24} height={24} fill="currentColor" />
            </Link>

            <button
              aria-label="Cart"
              onClick={handleCart}
              className="relative hover:text-black transition-colors"
            >
              <CartIcon width={21} height={21} fill="currentColor" />

              {cartCount > 0 && (
                <span
                  className="
                    absolute -top-2.5 -right-2.5
                    bg-[#F93A3A] text-white
                    text-[10px] font-bold
                    w-[18px] h-[18px]
                    flex items-center justify-center
                    rounded-full
                  "
                >
                  {cartCount}
                </span>
              )}
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