"use client";
import { useState } from "react";

const MAX_ERROS = 6;
const TECLADO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function normalizar(w: string) {
  return w.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

type Entrada = { palavra: string; dica: string };
type Props = { entradas: Entrada[] };

function HangmanSVG({ erros }: { erros: number }) {
  return (
    <svg width="140" height="150" viewBox="0 0 140 150" fill="none" className="mx-auto">
      {/* Forca */}
      <line x1="10" y1="145" x2="130" y2="145" stroke="#444" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="145" x2="40" y2="10" stroke="#444" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="10" x2="90" y2="10" stroke="#444" strokeWidth="3" strokeLinecap="round" />
      <line x1="90" y1="10" x2="90" y2="28" stroke="#444" strokeWidth="3" strokeLinecap="round" />

      {/* Cabeça */}
      {erros >= 1 && <circle cx="90" cy="38" r="10" stroke="#E8185A" strokeWidth="2.5" />}
      {/* Corpo */}
      {erros >= 2 && <line x1="90" y1="48" x2="90" y2="95" stroke="#E8185A" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Braço esq */}
      {erros >= 3 && <line x1="90" y1="62" x2="68" y2="80" stroke="#E8185A" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Braço dir */}
      {erros >= 4 && <line x1="90" y1="62" x2="112" y2="80" stroke="#E8185A" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Perna esq */}
      {erros >= 5 && <line x1="90" y1="95" x2="70" y2="120" stroke="#E8185A" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Perna dir */}
      {erros >= 6 && <line x1="90" y1="95" x2="110" y2="120" stroke="#E8185A" strokeWidth="2.5" strokeLinecap="round" />}
    </svg>
  );
}

export default function Forca({ entradas }: Props) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * entradas.length));
  const [chutadas, setChutadas] = useState<Set<string>>(new Set());

  const entrada = entradas[idx];
  const norm = normalizar(entrada.palavra);

  const letrasUnicas = [...new Set(norm.split("").filter(c => /[A-Z]/.test(c)))];
  const erros = [...chutadas].filter(l => !norm.includes(l)).length;
  const ganhou = letrasUnicas.every(l => chutadas.has(l));
  const perdeu = erros >= MAX_ERROS;

  const chutar = (letra: string) => {
    if (chutadas.has(letra) || ganhou || perdeu) return;
    setChutadas(prev => new Set(prev).add(letra));
  };

  const proxima = () => {
    setIdx(i => (i + 1) % entradas.length);
    setChutadas(new Set());
  };

  const display = norm.split("").map((c, i) => {
    if (c === " ") return { char: " ", key: `sp-${i}` };
    if (!/[A-Z]/.test(c)) return { char: c, key: `pt-${i}` };
    return { char: chutadas.has(c) || perdeu ? c : "_", key: `l-${i}`, isBlank: !chutadas.has(c) && !perdeu };
  });

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Forca SVG */}
      <HangmanSVG erros={erros} />

      {/* Palavra */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
        {display.map(({ char, key, isBlank }) =>
          char === " " ? (
            <div key={key} className="w-4" />
          ) : (
            <div
              key={key}
              className={`w-8 h-10 flex items-end justify-center pb-1 border-b-2 transition-colors ${
                isBlank ? "border-white/30" : "border-[#E8185A]"
              }`}
            >
              <span className={`font-black text-sm ${isBlank ? "text-transparent" : perdeu && !chutadas.has(char) ? "text-red-500" : "text-white"}`}>
                {char}
              </span>
            </div>
          )
        )}
      </div>

      {/* Erros */}
      <div className="flex gap-1">
        {Array.from({ length: MAX_ERROS }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < erros ? "bg-[#E8185A]" : "bg-white/15"}`} />
        ))}
      </div>

      {/* Status */}
      {ganhou && (
        <div className="text-center">
          <p className="text-green-400 font-black text-base mb-3">❤️ Acertaram!</p>
          <button onClick={proxima} className="bg-[#E8185A] text-white font-black px-6 py-2.5 rounded-xl text-sm hover:bg-[#c91450] transition-colors">
            Próxima palavra
          </button>
        </div>
      )}
      {perdeu && (
        <div className="text-center">
          <p className="text-red-400 font-black text-base mb-3">💔 Era: {entrada.palavra}</p>
          <button onClick={proxima} className="bg-[#1e1e1e] text-white font-bold px-6 py-2.5 rounded-xl text-sm border border-white/10 hover:bg-[#2a2a2a] transition-colors">
            Tentar outra
          </button>
        </div>
      )}

      {/* Teclado */}
      {!ganhou && !perdeu && (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
          {TECLADO.map(letra => (
            <button
              key={letra}
              onClick={() => chutar(letra)}
              disabled={chutadas.has(letra)}
              className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                chutadas.has(letra)
                  ? norm.includes(letra)
                    ? "bg-[#E8185A]/30 text-[#E8185A] cursor-default"
                    : "bg-white/5 text-white/20 cursor-default"
                  : "bg-[#1e1e1e] text-white hover:bg-[#E8185A] hover:text-white border border-white/10"
              }`}
            >
              {letra}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
