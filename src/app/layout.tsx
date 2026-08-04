import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import LoadingAnimation from "@/components/LoadingAnimation";
import SilenceScriptWarning from "@/components/SilenceScriptWarning";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = "https://www.davin.io";
const SITE_NAME = "Davin Harding";
const SITE_TITLE = "Davin Harding — Senior Full-Stack AI Engineer";
const SITE_DESCRIPTION =
  "I design, build, and ship production-grade AI and SaaS products. 8+ years of full-stack experience across agentic systems, Next.js, TypeScript, enterprise SaaS, and Web3.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Davin Harding",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Davin Harding", url: SITE_URL }],
  creator: "Davin Harding",
  keywords: [
    "Davin Harding",
    "Full-Stack Engineer",
    "AI Engineer",
    "Next.js",
    "TypeScript",
    "React",
    "AI Product Development",
    "Web3",
    "SaaS",
    "Portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/new_profile_pic.png",
        width: 1200,
        height: 630,
        alt: "Davin Harding",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/new_profile_pic.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Davin Harding",
  url: SITE_URL,
  image: `${SITE_URL}/new_profile_pic.png`,
  jobTitle: "Senior Full-Stack AI Engineer",
  description: SITE_DESCRIPTION,
  worksFor: {
    "@type": "Organization",
    name: "Harding Labs",
    url: "https://hardinglabs.io",
  },
  sameAs: [
    "https://github.com/davinharding",
    "https://www.linkedin.com/in/davinharding/",
  ],
};

// Inline boot script: applies the persisted theme + skips the splash overlay
// for repeat visits BEFORE the first paint, so there is no FOUC and no flash.
const themeBootScript = `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme');if(s==='light'){d.classList.add('light')}else{d.classList.remove('light')}if(sessionStorage.getItem('davinLoaderShown')==='true'){d.classList.add('loader-done')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* React 19 logs a dev-only "Encountered a script tag" warning for these,
            but the scripts execute correctly from the SSR HTML. The warning is
            filtered in dev by `SilenceScriptWarning` mounted below. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <SilenceScriptWarning />
        <ThemeProvider>
          <LoadingAnimation />
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
