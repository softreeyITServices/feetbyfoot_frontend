'use client';

import React from 'react';
import Navbar from '@/component/common/navbar';
import Footer from '@/component/common/Footer';
import AccountSidebar from '@/component/account/AccountSidebar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function ClientLayout({ children, title, subtitle, }: LayoutProps) {

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-md text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
          <AccountSidebar />
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
