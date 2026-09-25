import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Trace · Understand every interaction",
  description:
    "Explore how a website responds. Capture interactions, compare before and after, and turn observed changes into a clear report.",
  icons: { icon: "/trace.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${mono.variable}`}>
        <a className="skip-link" data-trace-ignore href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
