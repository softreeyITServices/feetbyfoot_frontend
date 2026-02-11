
import { AuthProvider } from '@/domain/application/providers/Authproviders';
import ClientLayout from './_layout/client-layout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider><ClientLayout>{children}</ClientLayout></AuthProvider>;
}