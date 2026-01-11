import type { Metadata } from "next";
import { IBM_Plex_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "Melkia 2.0 - Laksour Real Estate Investment | Marrakech Medina",
    template: "%s | Melkia 2.0",
  },
  description: "Premier Medina investment platform. Verified riads and historic properties in Laksour, Mouassine, and Kasbah. World Cup 2030 certified opportunities.",
  keywords: [
    "Laksour real estate",
    "Medina investment",
    "Marrakech riad",
    "Morocco property",
    "World Cup 2030 investment",
    "Riad Laksour",
    "Mouassine property",
    "Kasbah investment",
    "Marrakech Medina",
    "Morocco real estate",
  ],
  openGraph: {
    title: "Melkia 2.0 - The Future of Historic Investment in Marrakech",
    description: "Premier Medina investment platform. Verified riads in Laksour, Mouassine, and Kasbah. World Cup 2030 certified.",
    url: "https://melkia.vercel.app",
    siteName: "Melkia 2.0",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melkia 2.0 - Laksour Real Estate Investment",
    description: "Premier Medina investment platform. World Cup 2030 certified opportunities.",
  },
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    canonical: "https://melkia.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlex.variable} ${playfair.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
