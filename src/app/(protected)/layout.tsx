'use client';
import { useState } from 'react';
import ClientLayout from './_layout/client-layout';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/domain/application/providers/Authproviders';
import { LayoutContext } from '@/domain/application/context/LayoutContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  return (
    <AuthProvider>
      <LayoutContext.Provider value={{ title, setTitle, subtitle, setSubtitle }}>
        <ClientLayout title={title} subtitle={subtitle}>
          {children}
          <Toaster position="top-right" />
        </ClientLayout>
      </LayoutContext.Provider>
    </AuthProvider>
  );
}