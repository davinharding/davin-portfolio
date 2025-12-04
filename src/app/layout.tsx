import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Davin Harding",
  description: "A portfolio site by Davin Harding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ? (
            <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS} />
          ) : null}
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
