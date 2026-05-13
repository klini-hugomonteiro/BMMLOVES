"use client";
import { useState } from "react";

const links = [
  { href: "#inicio", label: "Início" },
  { href: "#modelos", label: "Modelos" },
  { href: "#personalizar", label: "Personalizar" },
  { href: "#exemplo", label: "Exemplo" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-sm">BL</div>
          <span className="font-bold text-lg tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg">
            Entrar
          </a>
          <button className="md:hidden p-1.5 text-gray-400" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#111] border-t border-white/5 px-4 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-gray-300 py-1 font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="/login" className="mt-2 border border-white/20 text-white font-bold py-3 rounded-lg text-center">
            Entrar
          </a>
        </div>
      )}
    </nav>
  );
}
