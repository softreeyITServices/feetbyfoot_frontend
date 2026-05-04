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
import { ChevronDown, Menu, X, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="flex items-center gap-2" aria-label="Loading navigation">
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
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (groupId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveGroup(groupId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveGroup(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-0.5">
      {megaGroups.map((g) => {
        const categories = g.categories ?? [];
        const hasFlyout = categories.length > 0;
        const primary = groupPrimaryHref(g);
        const groupActive = isGroupPathActive(pathname, g);
        const headerOnly = groupIsHeaderOnly(g);
        const isActive = activeGroup === g.id || groupActive;
        const isOutlet = g.name.toLowerCase() === "outlet";
        
        const baseClass = `
          relative px-3 lg:px-4 py-2 text-xs lg:text-[13px] font-medium
          tracking-[0.05em] uppercase whitespace-nowrap transition-all duration-300
          rounded-lg
          ${isActive 
            ? 'text-black bg-white/60 shadow-sm' 
            : 'text-gray-600 hover:text-black hover:bg-white/40'
          }
          ${isOutlet ? 'text-red-500 hover:text-red-600' : ''}
        `;

        const chevronClass = `
          h-3 w-3 ml-1 transition-all duration-300 ease-out
          ${isActive ? 'rotate-180 opacity-100' : 'opacity-50'}
          group-hover:opacity-100
        `;

        if (!hasFlyout) {
          if (headerOnly) {
            return (
              <span
                key={g.id}
                className={`${baseClass} cursor-default`}
                role="presentation"
              >
                {g.name}
              </span>
            );
          }
          return (
            <Link key={g.id} href={primary} className={baseClass}>
              {g.name}
            </Link>
          );
        }

        return (
          <div
            key={g.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(g.id)}
            onMouseLeave={handleMouseLeave}
          >
            {headerOnly ? (
              <span className={`${baseClass} inline-flex items-center cursor-default`}>
                {g.name}
                {hasFlyout && <ChevronDown className={chevronClass} aria-hidden />}
              </span>
            ) : (
              <Link 
                href={primary} 
                className={`${baseClass} inline-flex items-center`}
              >
                {g.name}
                {hasFlyout && <ChevronDown className={chevronClass} aria-hidden />}
              </Link>
            )}

            {/* Modern Mega Menu Dropdown */}
            <div
              className={`
                fixed left-0 right-0 mx-auto
                transition-all duration-300 ease-out
                ${isActive 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible -translate-y-2'
                }
              `}
              style={{ 
                top: '72px',
                zIndex: 60,
                pointerEvents: isActive ? 'auto' : 'none'
              }}
              role="region"
              aria-label={`${g.name} categories`}
            >
              {/* Backdrop with glass effect */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              
              {/* Content */}
              <div className="relative bg-white/95 backdrop-blur-md border-t border-gray-200/60 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10">
                  <div className="flex items-start gap-8">
                    {/* Categories Grid */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                      {categories.map((c, idx) => {
                        const subs = c.subcategories ?? [];
                        const catHeader = categoryIsHeaderOnly(g, c);
                        const catLink = categoryHref(g, c);
                        
                        return (
                          <div 
                            key={c.id}
                            className="group/cat"
                            style={{
                              animationDelay: `${idx * 50}ms`,
                              animation: isActive ? 'fadeInUp 0.5s ease-out forwards' : 'none',
                              opacity: isActive ? 1 : 0,
                            }}
                          >
                            {/* Category Image */}
                            {c.image && (
                              <div className="mb-3 overflow-hidden rounded-xl bg-gray-100 aspect-[4/5] relative group/img">
                                {catHeader ? (
                                  <Image
                                    src={c.image}
                                    width={200}
                                    height={250}
                                    alt={c.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Link href={catLink}>
                                    <Image
                                      src={c.image}
                                      width={200}
                                      height={250}
                                      alt={c.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                    />
                                  </Link>
                                )}
                              </div>
                            )}
                            
                            {/* Category Name */}
                            <div>
                              {catHeader ? (
                                <span className="text-[12px] lg:text-[13px] font-bold text-gray-900 tracking-wide mb-3 block">
                                  {c.name}
                                </span>
                              ) : (
                                <Link
                                  href={catLink}
                                  className="text-[12px] lg:text-[13px] font-bold text-gray-900 hover:text-black tracking-wide mb-3 block group/link"
                                >
                                  <span className="inline-flex items-center gap-1 group-hover/link:gap-2 transition-all">
                                    {c.name}
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                  </span>
                                </Link>
                              )}
                              
                              {/* Subcategories */}
                              {subs.length > 0 && (
                                <ul className="space-y-2">
                                  {subs.map((s) => {
                                    const subHeader = subcategoryIsHeaderOnly(g, s);
                                    return (
                                      <li key={s.id}>
                                        {subHeader ? (
                                          <span className="text-[11px] lg:text-[12px] text-gray-400 cursor-default">
                                            {s.name}
                                          </span>
                                        ) : (
                                          <Link
                                            href={subcategoryHref(g, c, s)}
                                            className="text-[11px] lg:text-[12px] text-gray-500 hover:text-black transition-colors duration-200 inline-flex items-center group/sub"
                                          >
                                            <span className="w-0 group-hover/sub:w-3 transition-all duration-200 h-px bg-current mr-0 group-hover/sub:mr-1" />
                                            {s.name}
                                          </Link>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Featured/Promotional Section (Optional) */}
                    {g.name.toLowerCase() === "new arrivals" || g.name.toLowerCase() === "sale" ? (
                      <div className="hidden xl:block w-72 shrink-0">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white h-full">
                          <Sparkles className="w-6 h-6 text-yellow-400 mb-3" />
                          <h3 className="text-lg font-bold mb-2">
                            {g.name.toLowerCase() === "new arrivals" ? "Just Dropped" : "Limited Time"}
                          </h3>
                          <p className="text-sm text-gray-300 mb-4">
                            {g.name.toLowerCase() === "new arrivals" 
                              ? "Be the first to shop our latest collection. Fresh styles added weekly."
                              : "Don't miss out on exclusive deals. Up to 50% off selected styles."
                            }
                          </p>
                          <Link
                            href={primary}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            Shop Now
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
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
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setAnimationComplete(true), 100);
    } else {
      document.body.style.overflow = "";
      setAnimationComplete(false);
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
      {/* Overlay with blur */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] transition-all duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer with smooth slide */}
      <div
        className={`fixed top-0 left-0 h-full w-[88%] max-w-[400px] bg-white z-[80] 
          transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          overflow-y-auto shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-bold text-lg tracking-tight">Menu</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-5 py-6">
          {megaGroups.map((g, idx) => {
            const categories = g.categories ?? [];
            const hasFlyout = categories.length > 0;
            const primary = groupPrimaryHref(g);
            const groupActive = isGroupPathActive(pathname, g);
            const isExpanded = expandedGroups.has(g.id);
            const isOutlet = g.name.toLowerCase() === "outlet";

            const itemStyle = {
              animationDelay: `${idx * 60}ms`,
              opacity: animationComplete ? 1 : 0,
              transform: animationComplete ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.4s ease-out',
            };

            if (!hasFlyout && !groupIsHeaderOnly(g)) {
              return (
                <div key={g.id} style={itemStyle}>
                  <Link
                    href={primary}
                    onClick={onClose}
                    className={`flex items-center justify-between py-4 px-3 text-[15px] font-medium rounded-xl transition-all duration-200 mb-1
                      ${isOutlet
                        ? "text-red-500 hover:bg-red-50"
                        : groupActive
                        ? "bg-gray-100 text-black"
                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                      }`}
                  >
                    {g.name}
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </Link>
                </div>
              );
            }

            return (
              <div key={g.id} style={itemStyle} className="mb-1">
                <button
                  onClick={() => (hasFlyout ? toggleGroup(g.id) : null)}
                  className={`w-full flex items-center justify-between py-4 px-3 text-[15px] font-medium rounded-xl transition-all duration-200
                    ${isOutlet
                      ? "text-red-500 hover:bg-red-50"
                      : groupActive
                      ? "bg-gray-100 text-black"
                      : "text-gray-700 hover:bg-gray-50 hover:text-black"
                    }`}
                >
                  <span>{g.name}</span>
                  {hasFlyout && (
                    <ChevronDown
                      className={`h-5 w-5 transition-all duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {hasFlyout && (
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      isExpanded ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-5 pb-4 space-y-4">
                      {categories.map((c) => {
                        const catHeader = categoryIsHeaderOnly(g, c);
                        const catLink = categoryHref(g, c);
                        const subs = c.subcategories ?? [];

                        return (
                          <div key={c.id} className="space-y-2">
                            {catHeader ? (
                              <span className="block py-2 text-sm font-bold uppercase text-gray-400 tracking-wider">
                                {c.name}
                              </span>
                            ) : (
                              <Link
                                href={catLink}
                                onClick={onClose}
                                className="flex items-center gap-2 py-2 text-sm font-semibold text-gray-800 hover:text-black transition-colors group"
                              >
                                {c.name}
                                <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </Link>
                            )}
                            {subs.length > 0 && (
                              <ul className="pl-4 space-y-1.5">
                                {subs.map((s) => {
                                  const subHeader = subcategoryIsHeaderOnly(g, s);
                                  return (
                                    <li key={s.id}>
                                      {subHeader ? (
                                        <span className="block py-1.5 text-[13px] text-gray-300">
                                          {s.name}
                                        </span>
                                      ) : (
                                        <Link
                                          href={subcategoryHref(g, c, s)}
                                          onClick={onClose}
                                          className="block py-1.5 text-[13px] text-gray-500 hover:text-black transition-colors"
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

        {/* Quick Links Footer */}
        <div className="border-t border-gray-100 px-5 py-6 mt-4">
          <div className="space-y-3">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <ProfileIcon width={18} height={18} fill="currentColor" />
              Account
            </Link>
            <Link
              href="/wishlists"
              onClick={onClose}
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-black transition-colors"
            >
              <WishlistIcon width={18} height={18} fill="currentColor" />
              Wishlist
            </Link>
          </div>
        </div>
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
  const lastNavigatedRef = useRef("");
  const [megaMenuReady, setMegaMenuReady] = useState(false);
  const [megaGroups, setMegaGroups] = useState<MenuGroup[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header 
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/90 backdrop-blur-lg shadow-lg shadow-black/5' 
            : 'bg-[#fafafa]'
          }
        `}
      >
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] sm:h-[72px] flex items-center justify-between gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden p-2 -ml-2 hover:bg-black/5 rounded-full transition-all duration-200 shrink-0 active:scale-95"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 shrink-0 group"
          >
            <Image
              src="/assets/images/logo.png"
              alt="Feet by Foot"
              width={34}
              height={34}
              className="sm:w-[38px] sm:h-[38px] transition-transform duration-300 group-hover:scale-105 rounded-xl"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center min-w-0 justify-center flex-1"
            aria-busy={!megaMenuReady}
          >
            {desktopNavBody}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center gap-1 sm:gap-3 lg:gap-5 shrink-0">
            {/* Desktop Search */}
            <form
              ref={searchRef}
              onSubmit={handleSearchSubmit}
              className={`hidden md:flex items-center rounded-full transition-all duration-300 ease-out
                ${searchOpen
                  ? "w-44 lg:w-64 bg-gray-100 border-2 border-gray-200 px-4 py-2"
                  : "w-10 justify-center hover:bg-gray-100"
                }`}
            >
              <button
                type="button"
                aria-label="Search products"
                className={`shrink-0 transition-all duration-200 ${
                  searchOpen ? 'text-gray-400' : 'text-gray-600 hover:text-black'
                }`}
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <SearchIcon 
                  width={18} 
                  height={18} 
                  className="lg:w-[20px] lg:h-[20px] transition-transform duration-200" 
                  fill="currentColor" 
                />
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
              className="md:hidden p-2 hover:bg-black/5 rounded-full transition-all duration-200 active:scale-95"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
            >
              <SearchIcon 
                width={18} 
                height={18} 
                className="sm:w-[20px] sm:h-[20px]" 
                fill="currentColor" 
              />
            </button>

            {/* Account */}
            <Link 
              href="/login" 
              aria-label="Account" 
              className="hidden sm:flex p-2 hover:bg-black/5 rounded-full transition-all duration-200 active:scale-95"
            >
              <ProfileIcon 
                width={20} 
                height={20} 
                className="lg:w-[22px] lg:h-[22px]" 
                fill="currentColor" 
              />
            </Link>

            {/* Wishlist */}
            <Link 
              href="/wishlists" 
              aria-label="Wishlists" 
              className="hidden lg:flex p-2 hover:bg-black/5 rounded-full transition-all duration-200 active:scale-95"
            >
              <WishlistIcon 
                width={22} 
                height={22} 
                className="lg:w-[24px] lg:h-[24px]" 
                fill="currentColor" 
              />
            </Link>

            {/* Cart */}
            <button
              aria-label="Cart"
              onClick={handleCart}
              className="relative p-2 hover:bg-black/5 rounded-full transition-all duration-200 active:scale-95"
            >
              <CartIcon 
                width={20} 
                height={20} 
                className="lg:w-[22px] lg:h-[22px]" 
                fill="currentColor" 
              />

              {cartCount > 0 && (
                <span className="
                  absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1
                  bg-red-500 text-white
                  text-[10px] sm:text-[11px] font-bold
                  min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px]
                  flex items-center justify-center
                  rounded-full animate-fade-in
                  shadow-lg shadow-red-500/25
                ">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div 
        className={`
          md:hidden bg-white border-b border-gray-200 
          sticky top-[64px] sm:top-[72px] z-40
          transition-all duration-300
          ${mobileSearchOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-full pointer-events-none absolute'
          }
        `}
      >
        <div className="px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <SearchIcon width={18} height={18} fill="currentColor" className="text-gray-400" />
            <input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 py-1"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

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