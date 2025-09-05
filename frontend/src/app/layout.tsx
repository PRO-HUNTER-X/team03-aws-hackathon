import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CS 챗봇 플랫폼",
  description: "AI 기반 고객 서비스 자동화 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <nav className="border-b bg-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">CS 챗봇 플랫폼</h1>
              <div className="flex gap-4">
                <Link href="/" className="text-sm hover:underline">
                  홈
                </Link>
                <Link href="/inquiry" className="text-sm hover:underline">
                  문의하기
                </Link>
                <Link href="/demo" className="text-sm hover:underline">
                  데모
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
