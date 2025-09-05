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
  title: "헌터스 고객지원센터",
  description: "헌터스 고객님들을 위한 24시간 AI 고객지원 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">H</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-slate-600 transition-all duration-300">
                  헌터스 고객지원센터
                </h1>
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  홈
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  내 문의 보기
                </Link>
                <Link
                  href="/inquiry"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition-all duration-200"
                >
                  문의하기
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
