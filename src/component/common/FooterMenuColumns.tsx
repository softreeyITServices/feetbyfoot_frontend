"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productService } from "@/domain/application/services/product.service";
import type { MenuCategory, MenuGroup } from "@/domain/shared/types/product.type";
import {
  categoryHref,
  categoryIsHeaderOnly,
  groupIsHeaderOnly,
  groupPrimaryHref,
  subcategoryHref,
  subcategoryIsHeaderOnly,
} from "@/lib/megaMenuLinks";

function FooterColumn({ group }: { group: MenuGroup }) {
  const categories = group.categories ?? [];
  const showSingleGroupLink =
    categories.length === 0 && !groupIsHeaderOnly(group);

  return (
    <div className="w-full">
      <h4 className="font-semibold mb-3 text-white text-lg">{group.name}</h4>
      <ul className="space-y-2 text-neutral-300">
        {showSingleGroupLink ? (
          <li>
            <Link href={groupPrimaryHref(group)}>
              {group.name}
            </Link>
          </li>
        ) : null}
        {categories.map((c) => (
          <FooterCategoryRows key={c.id} group={group} category={c} />
        ))}
      </ul>
    </div>
  );
}

function FooterCategoryRows({
  group,
  category,
}: {
  group: MenuGroup;
  category: MenuCategory;
}) {
  const subs = category.subcategories ?? [];
  const catHeader = categoryIsHeaderOnly(group, category);

  return (
    <>
      <li>
        {catHeader ? (
          <span className="text-neutral-300">{category.name}</span>
        ) : (
          <Link href={categoryHref(group, category)}>
            {category.name}
          </Link>
        )}
      </li>
      {subs.map((s) => (
        <li key={s.id} className="pl-3">
          {subcategoryIsHeaderOnly(group, s) ? (
            <span className="text-neutral-400 text-sm">{s.name}</span>
          ) : (
            <Link
              href={subcategoryHref(group, category, s)}
              className="text-sm text-neutral-300"
            >
              {s.name}
            </Link>
          )}
        </li>
      ))}
    </>
  );
}

function StaticFooterColumns() {
  return (
    <>
      <div className="w-full">
        <h4 className="font-semibold mb-3 text-white text-lg">About Us</h4>
        <ul className="space-y-2 text-neutral-300">
          <li>
            <Link href="/workofart">About Us</Link>{" "}
          </li>
          <li>
            <Link href="/blogs">Blog</Link>
          </li>
          <li>
            <Link href="/privacypolicy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/shippingpolicy">Shipping Policy</Link>
          </li>
          <li>
            <Link href="/termsandconditions">Terms & Conditions</Link>
          </li>
        </ul>
      </div>

      <div className="w-full">
        <h4 className="font-semibold mb-3 text-white text-lg">Support</h4>
        <ul className="space-y-2 text-neutral-300">
          <li>
            <Link href="/refundreturnpolicy">Returns & Refunds</Link>
          </li>
          <li>
            <Link href="/contactus">Contact Us</Link>
          </li>
          <li>
            <Link href="/changesorders">Changes to Orders</Link>
          </li>
          <li>
            <Link href="/faqs">FAQs</Link>
          </li>
          <li>
            <Link href="/sizeguide">Size Guide</Link>
          </li>
        </ul>
      </div>

      <div className="w-full">
        <h4 className="font-semibold mb-3 text-white text-lg">Quick Links</h4>
        <ul className="space-y-2 text-neutral-300">
          <li>
            <Link href="/shop">Shop</Link>
          </li>
          <li>
            <Link href="/cart">My Cart</Link>
          </li>
          <li>
            <Link href="/account">My Account</Link>
          </li>
          <li>
            <Link href="/wishlists">My Wishlist</Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default function FooterMenuColumns() {
  const [groups, setGroups] = useState<MenuGroup[] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const doc = await productService.getMegaMenuForPlacement("footer");
        if (cancelled) return;
        const isDefaultFooter =
          (doc.isDefault !== false) &&
          (doc.groups?.length ?? 0) > 0;
        setGroups(isDefaultFooter ? (doc.groups ?? []) : []);
      } catch {
        if (!cancelled) setGroups([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full space-y-3">
            <div className="h-6 w-28 rounded bg-neutral-200 animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-4 w-full max-w-[160px] rounded bg-neutral-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups && groups.length > 0) {
    return (
      <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {groups.map((g) => (
          <FooterColumn key={g.id} group={g} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
      <StaticFooterColumns />
    </div>
  );
}
