import type { Metadata } from "next";
import { Inter, Poppins, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import CartSyncProvider from "@/domain/application/providers/CartSyncProvider";
import { AuthProvider } from "@/domain/application/providers/Authproviders";
import RazorpayScript from "@/component/common/RazorpayScript";


export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Feet by Foot - Joy in Every Step",
  description: "2026 SEASON SALE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>

        <AuthProvider>
          <RazorpayScript />
          <ReduxProvider>
            <CartSyncProvider>
              {children}
            </CartSyncProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
