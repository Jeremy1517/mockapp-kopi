import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-script";
import { LocaleProvider } from "@/i18n/client";
import { HTML_LANG, LOCALES } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import "../globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const { locale, t } = await getI18n();
  return (
    // The theme script sets data-theme on <html> before React hydrates.
    <html
      lang={HTML_LANG[locale]}
      className={`${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        <LocaleProvider locale={locale}>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6">{children}</main>
          <footer className="border-t border-tile">
            <p className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-soft sm:px-6">{t.footer}</p>
          </footer>
        </LocaleProvider>
      </body>
    </html>
  );
}
