import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
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
  metadataBase: new URL("https://mod-technologie.com"),
  openGraph: {
    title: "MOD-TECHNOLOGIE | Sécurité, Réseaux & Domotique",
    description:
      "Solutions professionnelles en sécurité, réseaux, domotique et sonorisation. Livraison et installation dans toute l'Algérie.",
    siteName: "MOD-TECHNOLOGIE",
    locale: "fr_DZ",
    type: "website",
    images: [
      {
        url: "https://fv5-2.files.fm/thumb_show.php?i=9ytmgdrgwp&view&v=1&PHPSESSID=1548229dd89828d397f0329fc169f4714310ffd6",
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
    images: ["https://fv5-2.files.fm/thumb_show.php?i=9ytmgdrgwp&view&v=1&PHPSESSID=1548229dd89828d397f0329fc169f4714310ffd6"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}