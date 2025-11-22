import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@rainbow-me/rainbowkit/styles.css';
import "./globals.css";
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: "TrustMarket - AI Speed + Economic Security",
  description: "The ONLY prediction market with AI speed + UMA economic security. 5-minute AI resolution with $1M+ UMA backstop.",
  keywords: ["prediction markets", "UMA", "AI oracle", "BNB Chain", "DeFi", "economic security"],
  authors: [{ name: "TrustMarket Team" }],
  openGraph: {
    title: "TrustMarket - AI Speed + Economic Security",
    description: "5-minute AI resolution with $1M+ UMA backstop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustMarket - AI Speed + Economic Security",
    description: "The ONLY prediction market with UMA integration",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AntdRegistry>
          <ClientProviders>{children}</ClientProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
