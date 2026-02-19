
import { AuthProvider } from '@/domain/application/providers/Authproviders';
import ClientLayout from './_layout/client-layout';
import { Toaster } from "react-hot-toast";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider><ClientLayout>{children}<Toaster position="top-right" /></ClientLayout></AuthProvider>;
}