import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
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
      <body className={`${pretendard.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
                  AI 데모
                </Link>
                <Link href="/status-demo" className="text-sm hover:underline">
                  상태 데모
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
