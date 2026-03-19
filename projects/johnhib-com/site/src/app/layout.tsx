import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "John Hibionada — AI Systems & Creative Production",
  description: "Building AI-native workflows for video, music, and emerging creative formats. Based in Los Angeles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "John Hibionada",
              "jobTitle": "Creative Technologist",
              "url": "https://johnhib.com",
              "sameAs": [
                "https://twitter.com/johnhib_",
                "https://www.linkedin.com/in/johnhib",
                "https://johnhib.tech"
              ]
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        {children}
      </body>
    </html>
  );
}
