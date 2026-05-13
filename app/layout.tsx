import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BMM Love — Transforme sua história em streaming",
  description: "Crie uma página romântica personalizada com fotos, música e momentos especiais. Estilo Netflix para a história de vocês.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="antialiased bg-[#0d0d0d] text-white">
        {children}
      </body>
    </html>
  );
}
