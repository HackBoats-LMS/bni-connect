import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Nearby",
    default: "Nearby - Discover Local Professionals",
  },
  description: "Connect with local professionals, discover businesses, and grow your network with Nearby.",
  keywords: ["networking", "local businesses", "professionals", "bni", "nearby", "connect"],
  authors: [{ name: "Nearby" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Nearby",
    title: "Nearby - Discover Local Professionals",
    description: "Connect with local professionals, discover businesses, and grow your network with Nearby.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
