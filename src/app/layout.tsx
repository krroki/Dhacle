import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "쇼츠 스튜디오 - AI 크리에이터 허브",
  description: "YouTube Shorts 크리에이터를 위한 AI 기반 올인원 플랫폼. 자막 생성부터 수익화 전략까지.",
  keywords: "YouTube Shorts, 쇼츠, AI 자막, 크리에이터, 수익화",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <ThemeProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
