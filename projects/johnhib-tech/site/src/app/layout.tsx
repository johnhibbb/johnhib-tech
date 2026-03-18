import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ContactButton from "@/components/ContactButton";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "johnhib.tech",
    template: "%s — johnhib.tech",
  },
  description: "Building with AI, documented as it happens.",
  metadataBase: new URL("https://johnhib.tech"),
  openGraph: {
    type: "website",
    siteName: "johnhib.tech",
    title: "johnhib.tech",
    description: "Building with AI, documented as it happens.",
    url: "https://johnhib.tech",
  },
  twitter: {
    card: "summary",
    title: "johnhib.tech",
    description: "Building with AI, documented as it happens.",
    creator: "@johnhib_",
  },
  alternates: {
    canonical: "https://johnhib.tech",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}>
        {children}
        <ContactButton />
      </body>
    </html>
  );
}
