import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth/AuthProvider";

export const metadata: Metadata = {
  title: "디하클 - 유튜브 수익화 교육 플랫폼",
  description: "유튜브로 월 1000만원 달성! 매주 2개의 신규 강의, 10,000명의 수강생과 함께하는 성장 플랫폼",
  keywords: "디하클, YouTube, 유튜브, 수익화, 크리에이터, 교육, 강의, TTS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
