import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProvider from "@/components/auth/ClientProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PostgreSQL Manager",
  description: "Gerenciador de bancos de dados PostgreSQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
