'use client';

import React from 'react';
import Navbar from '@/component/common/navbar';
import Footer from '@/component/common/Footer';
import AccountSidebar from '@/component/account/AccountSidebar';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function ClientLayout({ children, title, subtitle, }: LayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdminWishlistRoute =
    pathname === '/wishlists' &&
    session?.user?.role?.toLowerCase() === 'admin';

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header — hidden on mobile (tab bar provides context) */}
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-md text-gray-500 mt-1">{subtitle}</p>
        </div>

        {/* Content */}
        <div
          className={
            isAdminWishlistRoute
              ? "grid grid-cols-1"
              : "flex flex-col md:grid md:grid-cols-[260px_1fr] md:gap-10 md:items-start"
          }
        >
          {!isAdminWishlistRoute && <AccountSidebar />}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
