import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Parallax — See Your Words Through Their Eyes",
  description:
    "AI-powered communication pre-flight. Test how your message lands with different audiences before you send it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-[#09090b] text-[#fafafa]`}
      >
        {children}
      </body>
    </html>
  );
}
