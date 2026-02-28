import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "./providers";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-thai",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Reflect — Mental Health AI Web App",
  description: "เข้าใจตัวเองมากขึ้นจากแนวโน้มของภาษาและประสบการณ์ AI สะท้อน ไม่ตัดสิน",
  keywords: ["mental health", "journal", "reflection", "AI", "wellness"],
  authors: [{ name: "Reflect Team" }],
  openGraph: {
    title: "Reflect — Mental Health AI Web App",
    description: "เข้าใจตัวเองมากขึ้นจากแนวโน้มของภาษาและประสบการณ์",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased`}
      >
        <Providers>
          <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}

