import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clare 的私人弹药库",
  description: "Clare 的私人 AI 工具收藏。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="palette-pop">{children}</body>
    </html>
  );
}
