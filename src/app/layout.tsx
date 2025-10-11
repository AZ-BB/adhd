import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { createSupabaseServerClient } from "@/lib/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ADHD App",
  description: "Personalized ADHD companion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personalized ADHD companion" />
        <link rel="icon" href="/favicon.ico" />
        <title>ADHD App</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}
