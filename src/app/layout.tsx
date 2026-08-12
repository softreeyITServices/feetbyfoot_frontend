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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://laviors.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Feet by Foot - Joy in Every Step",
    template: "%s | Feet by Foot",
  },
  description: "Discover premium footwear at Feet by Foot. Joy in every step.",
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Feet by Foot",
    title: "Feet by Foot - Joy in Every Step",
    description: "Discover premium footwear at Feet by Foot. Joy in every step.",
  },
  verification: {
    google: "RYh0vSVgD6y7O5A3cSc1xpUa_6_UFjkM3g35601pSW0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Feet by Foot",
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.ico`,
  };

  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="RYh0vSVgD6y7O5A3cSc1xpUa_6_UFjkM3g35601pSW0" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
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
