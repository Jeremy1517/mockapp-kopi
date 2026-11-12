import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: "Kopi Counter", template: "%s · Kopi Counter" },
  description: "Stock, recipes and a bar log for a small coffee shop. A mock app.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6">{children}</main>
        <footer className="border-t border-tile">
          <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-soft sm:px-6">
            A mock app. Stock and the bar log are saved on this computer only.
          </p>
        </footer>
      </body>
    </html>
  );
}
