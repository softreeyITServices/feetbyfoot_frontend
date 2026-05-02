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
import { ChevronDown, Menu, X } from "lucide-react";
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
        const groupLabelClass = `text-xs xl:text-sm tracking-[0.08em] uppercase px-1.5 lg:px-3 py-2 whitespace-nowrap transition-colors ${
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
              className="fixed left-0 top-[72px] w-screen opacity-0 invisible -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out z-[60]"
              role="region"
              aria-label={`${g.name} categories`}
            >
              <div className="bg-[#f4f4f4] border-t border-neutral-300 shadow-xl w-full px-4 sm:px-8 py-6 sm:py-8 max-h-[70vh] overflow-y-auto">
                <div
                  className="grid gap-4 sm:gap-6 mx-auto max-w-7xl"
                  style={{
                    gridTemplateColumns: `repeat(auto-fit, minmax(140px, 160px))`,
                  }}
                >
                  {categories.map((c) => {
                    const subs = c.subcategories ?? [];
                    const catHeader = categoryIsHeaderOnly(g, c);
                    const catLink = categoryHref(g, c);
                    return (
                      <div key={c.id} className="min-w-[140px] w-full">
                        {/* Image */}
                        {c.image && (
                          catHeader ? (
                            <div className="mb-3 overflow-hidden bg-neutral-100 rounded">
                              <Image
                                src={c.image}
                                width={160}
                                height={170}
                                alt={c.name}
                                className="w-full h-[120px] sm:h-[170px] object-cover"
                              />
                            </div>
                          ) : (
                            <Link href={catLink} className="block mb-3 overflow-hidden bg-neutral-100 rounded">
                              <Image
                                src={c.image}
                                width={160}
                                height={170}
                                alt={c.name}
                                className="w-full h-[120px] sm:h-[170px] object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </Link>
                          )
                        )}
                        {/* Category name */}
                        {catHeader ? (
                          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wide block mb-2 cursor-default">
                            {c.name}
                          </span>
                        ) : (
                          <Link
                            href={catLink}
                            className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-wide hover:underline block mb-2"
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
                                  <span className="text-[11px] sm:text-xs text-gray-500 cursor-default">
                                    {s.name}
                                  </span>
                                ) : (
                                  <Link
                                    href={subcategoryHref(g, c, s)}
                                    className="text-[11px] sm:text-xs text-gray-600 hover:text-black"
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

function MobileMenuDrawer({
  isOpen,
  onClose,
  pathname,
  megaGroups,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  megaGroups: MenuGroup[];
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[380px] bg-white z-[80] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-4 py-4 flex items-center justify-between">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={30}
              height={30}
            />
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-4 py-4">
          {megaGroups.map((g) => {
            const categories = g.categories ?? [];
            const hasFlyout = categories.length > 0;
            const primary = groupPrimaryHref(g);
            const groupActive = isGroupPathActive(pathname, g);
            const isExpanded = expandedGroups.has(g.id);
            const isOutlet = g.name.toLowerCase() === "outlet";

            if (!hasFlyout && !groupIsHeaderOnly(g)) {
              return (
                <Link
                  key={g.id}
                  href={primary}
                  onClick={onClose}
                  className={`block py-3 px-2 text-sm font-medium transition-colors border-b border-neutral-100 ${
                    isOutlet
                      ? "text-[#F93A3A]"
                      : groupActive
                      ? "text-black"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  {g.name}
                </Link>
              );
            }

            return (
              <div key={g.id} className="border-b border-neutral-100">
                <button
                  onClick={() => (hasFlyout ? toggleGroup(g.id) : null)}
                  className={`w-full flex items-center justify-between py-3 px-2 text-sm font-medium transition-colors ${
                    isOutlet
                      ? "text-[#F93A3A]"
                      : groupActive
                      ? "text-black"
                      : "text-gray-700 hover:text-black"
                  }`}
                >
                  <span>{g.name}</span>
                  {hasFlyout && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {hasFlyout && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-4 pb-3 space-y-3">
                      {categories.map((c) => {
                        const catHeader = categoryIsHeaderOnly(g, c);
                        const catLink = categoryHref(g, c);
                        const subs = c.subcategories ?? [];

                        return (
                          <div key={c.id}>
                            {catHeader ? (
                              <span className="block py-2 text-xs font-semibold uppercase text-gray-800">
                                {c.name}
                              </span>
                            ) : (
                              <Link
                                href={catLink}
                                onClick={onClose}
                                className="block py-2 text-xs font-semibold uppercase text-gray-800 hover:text-black"
                              >
                                {c.name}
                              </Link>
                            )}
                            {subs.length > 0 && (
                              <ul className="pl-3 space-y-1">
                                {subs.map((s) => {
                                  const subHeader = subcategoryIsHeaderOnly(g, s);
                                  return (
                                    <li key={s.id}>
                                      {subHeader ? (
                                        <span className="block py-1 text-[11px] text-gray-400">
                                          {s.name}
                                        </span>
                                      ) : (
                                        <Link
                                          href={subcategoryHref(g, c, s)}
                                          onClick={onClose}
                                          className="block py-1 text-[11px] text-gray-500 hover:text-black"
                                        >
                                          {s.name}
                                        </Link>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}

const CATEGORY_PATHS = new Set(["/mens", "/womens", "/kids", "/gifts", "/outlet", "/brand", "/shop"]);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const openCartState = useAppSelector((state) => state.ui.isCartOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLFormElement | null>(null);
  // Tracks the search term that was last pushed to the URL so the debounce
  // doesn't fire again when the input is pre-filled from the URL on load.
  const lastNavigatedRef = useRef("");
  const [megaMenuReady, setMegaMenuReady] = useState(false);
  const [megaGroups, setMegaGroups] = useState<MenuGroup[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (CATEGORY_PATHS.has(pathname)) {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get("search") ?? "";
      lastNavigatedRef.current = urlSearch;
      setSearchTerm(urlSearch);
      return;
    }
    lastNavigatedRef.current = "";
    setSearchTerm("");
  }, [pathname]);

  // Debounce: auto-search 500 ms after the user stops typing
  useEffect(() => {
    if (searchTerm === lastNavigatedRef.current) return;
    if (!searchOpen && !mobileSearchOpen) return;

    const timer = setTimeout(() => {
      const q = searchTerm.trim();
      lastNavigatedRef.current = q;

      const targetPath = CATEGORY_PATHS.has(pathname) ? pathname : "/shop";
      const existing = new URLSearchParams(window.location.search);
      existing.delete("page");
      if (q) {
        existing.set("search", q);
      } else {
        existing.delete("search");
      }
      const qs = existing.toString();
      router.replace(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openCart());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    setMobileSearchOpen(false);
    lastNavigatedRef.current = q;

    const targetPath = CATEGORY_PATHS.has(pathname) ? pathname : "/shop";
    const existing = new URLSearchParams(window.location.search);
    existing.delete("page");
    if (q) {
      existing.set("search", q);
    } else {
      existing.delete("search");
    }
    const qs = existing.toString();
    router.push(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
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

  return (
    <>
      <header className="bg-[#f4f4f4] sticky top-0 z-50">
        <div className="max-w-[90rem] mx-auto px-3 sm:px-4 lg:px-8 h-[60px] sm:h-[72px] flex items-center justify-between gap-2 sm:gap-3">
          {/* Mobile Menu Button - Left */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 -ml-2 hover:bg-neutral-200 rounded-full transition-colors shrink-0"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Logo - Centered on mobile, left on desktop */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={30}
              height={30}
              className="sm:w-[36px] sm:h-[36px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 min-w-0 justify-center flex-1 min-h-8"
            aria-busy={!megaMenuReady}
          >
            {desktopNavBody}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-7 shrink-0 text-gray-800">
            {/* Desktop Search */}
            <form
              ref={searchRef}
              onSubmit={handleSearchSubmit}
              className={`hidden md:flex items-center rounded-full transition-all duration-200 ${
                searchOpen
                  ? "w-40 lg:w-60 border border-gray-300 bg-white px-3 py-1.5"
                  : "w-10 justify-center p-2 hover:text-black cursor-pointer"
              }`}
            >
              <button
                type="button"
                aria-label="Search products"
                className="shrink-0"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <SearchIcon width={18} height={18} className="lg:w-[20px] lg:h-[20px]" fill="currentColor" />
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

            {/* Mobile Search */}
            <button
              aria-label="Search"
              className="md:hidden hover:text-black transition-colors p-1"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
            >
              <SearchIcon width={18} height={18} className="sm:w-[20px] sm:h-[20px]" fill="currentColor" />
            </button>

            {/* Account */}
            <Link href="/login" aria-label="Account" className="hover:text-black transition-colors p-1 hidden sm:block">
              <ProfileIcon width={19} height={19} className="lg:w-[21px] lg:h-[21px]" fill="currentColor" />
            </Link>

            {/* Wishlist */}
            <Link href="/wishlists" aria-label="Wishlists" className="hover:text-black transition-colors hidden lg:block">
              <WishlistIcon width={22} height={22} className="lg:w-[24px] lg:h-[24px]" fill="currentColor" />
            </Link>

            {/* Cart */}
            <button
              aria-label="Cart"
              onClick={handleCart}
              className="relative hover:text-black transition-colors p-1"
            >
              <CartIcon width={19} height={19} className="lg:w-[21px] lg:h-[21px]" fill="currentColor" />

              {cartCount > 0 && (
                <span
                  className="
                    absolute -top-1 -right-1 sm:-top-2.5 sm:-right-2.5
                    bg-[#F93A3A] text-white
                    text-[9px] sm:text-[10px] font-bold
                    w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]
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

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-[60px] sm:top-[72px] z-40 px-4 py-2.5">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 py-1"
            />
            <button type="submit" aria-label="Submit search" className="shrink-0 text-gray-600 hover:text-black">
              <SearchIcon width={18} height={18} fill="currentColor" />
            </button>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 text-gray-500 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
        megaGroups={hasMegaNav ? megaGroups : []}
      />

      <CartDrawer
        isOpen={openCartState}
        onClose={() => dispatch(closeCart())}
      />
    </>
  );
}