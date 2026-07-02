import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신정개발 경영지원 대시보드",
  description:
    "(주)신정개발 매출·매입·자금 현황 대시보드. 데이터는 브라우저에서만 처리되며 서버로 전송되지 않습니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="bg-brand-bg text-slate-800 font-sans antialiased">{children}</body>
    </html>
  );
}
