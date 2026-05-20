import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Translator | English ↔ Chinese",
  description: "Real-time voice translation between English and Chinese powered by DeepSeek AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
