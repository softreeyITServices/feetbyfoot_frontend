'use client';
import { useEffect, useRef, useState } from 'react';
import ClientLayout from './_layout/client-layout';
import { Toaster } from 'react-hot-toast';
import { signOut, useSession } from 'next-auth/react';
// import { AuthProvider } from '@/domain/application/providers/Authproviders';
import { LayoutContext } from '@/domain/application/context/LayoutContext';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const { data: session, status } = useSession();
  const signingOutRef = useRef(false);

  useEffect(() => {
    const isInvalidSession =
      status === 'unauthenticated' ||
      Boolean(session?.error) ||
      (status === 'authenticated' && session.user?.role !== 'admin');

    if (!isInvalidSession || signingOutRef.current) return;

    signingOutRef.current = true;
    void signOut({
      redirect: true,
      callbackUrl: '/',
    });
  }, [session, status]);

  if (
    status === 'loading' ||
    status === 'unauthenticated' ||
    Boolean(session?.error) ||
    (status === 'authenticated' && session.user?.role !== 'admin')
  ) {
    return null;
  }

  return (
    // <AuthProvider>
      <LayoutContext.Provider value={{ title, setTitle, subtitle, setSubtitle }}>
        <ClientLayout>
          {children}
          <Toaster position="top-right" />
        </ClientLayout>
      </LayoutContext.Provider>
    // </AuthProvider>
  );
}
