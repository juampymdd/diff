import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visor de Diferencias",
  description: "Compara dos textos o fragmentos de código lado a lado o en línea.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
