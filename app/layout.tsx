import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mod-technologie.com"),

  title: "MOD-TECHNOLOGIE | Sécurité, Réseaux & Domotique en Algérie",

  description:
    "MOD-TECHNOLOGIE est spécialisée dans l'installation de systèmes de sécurité, caméras de surveillance, réseaux informatiques, domotique, contrôle d'accès et sonorisation professionnelle en Algérie.",

  keywords: [
    "sécurité électronique Algérie",
    "caméra surveillance",
    "système alarme",
    "réseau informatique",
    "domotique",
    "contrôle accès",
    "sonorisation",
    "MOD-TECHNOLOGIE",
    "installation sécurité",
    "Laghouat",
  ],

  authors: [{ name: "MOD-TECHNOLOGIE" }],
  creator: "MOD-TECHNOLOGIE",

  alternates: {
    canonical: "https://mod-technologie.com",
  },

  openGraph: {
    title: "MOD-TECHNOLOGIE | Sécurité, Réseaux & Domotique",
    description:
      "Solutions professionnelles en sécurité, réseaux, domotique et sonorisation. Livraison et installation dans toute l'Algérie.",
    url: "https://mod-technologie.com",
    siteName: "MOD-TECHNOLOGIE",
    locale: "fr_DZ",
    type: "website",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "MOD-TECHNOLOGIE",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "MOD-TECHNOLOGIE | Sécurité & Innovation Technologique",
    description:
      "Spécialistes en systèmes de sécurité, réseaux informatiques, domotique et sonorisation en Algérie.",
    images: ["/og-image.jpeg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  verification: {
    google: "9KmR2som7RGKGmG2bOND4ZBvsCrWmpL9HH7LSaV4F_o",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Logo Schema for Google */}
        <Script
          id="logo-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "MOD-TECHNOLOGIE",
              url: "https://mod-technologie.com",
              logo: "https://mod-technologie.com/logo.png",
            }),
          }}
        />
      </head>

      <body
        className={`${inter.variable} font-sans antialiased bg-white text-slate-900`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}