"use client";
import { useEffect, useState } from "react";

type Tempo = {
  anos: number;
  meses: number;
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

function calcTempo(dataInicio: string, horarioInicio?: string): Tempo {
  const dateStr = horarioInicio
    ? `${dataInicio}T${horarioInicio}:00`
    : `${dataInicio}T00:00:00`;
  const start = new Date(dateStr);
  const now = new Date();

  let anos = now.getFullYear() - start.getFullYear();
  let meses = now.getMonth() - start.getMonth();
  let dias = now.getDate() - start.getDate();
  let horas = now.getHours() - start.getHours();
  let minutos = now.getMinutes() - start.getMinutes();
  let segundos = now.getSeconds() - start.getSeconds();

  if (segundos < 0) { minutos--; segundos += 60; }
  if (minutos < 0)  { horas--;   minutos += 60; }
  if (horas < 0)    { dias--;    horas += 24; }
  if (dias < 0) {
    meses--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    dias += prevMonth.getDate();
  }
  if (meses < 0) { anos--; meses += 12; }

  return { anos, meses, dias, horas, minutos, segundos };
}

const UNITS = [
  { key: "anos",     label: "Anos" },
  { key: "meses",    label: "Meses" },
  { key: "dias",     label: "Dias" },
  { key: "horas",    label: "Horas" },
  { key: "minutos",  label: "Min" },
  { key: "segundos", label: "Seg" },
] as const;

const HEARTS = [
  { left: "10%", delay: "0s",    dur: "3.2s", size: 14, drift: 18 },
  { left: "25%", delay: "0.7s",  dur: "3.8s", size: 10, drift: -14 },
  { left: "40%", delay: "1.4s",  dur: "3.0s", size: 16, drift: 20 },
  { left: "55%", delay: "0.3s",  dur: "4.0s", size: 11, drift: -16 },
  { left: "70%", delay: "1.1s",  dur: "3.5s", size: 13, drift: 12 },
  { left: "85%", delay: "0.5s",  dur: "2.9s", size: 9,  drift: -10 },
  { left: "18%", delay: "1.9s",  dur: "3.6s", size: 10, drift: 15 },
  { left: "63%", delay: "2.3s",  dur: "3.3s", size: 12, drift: -18 },
];

type Props = {
  dataInicio: string;
  horarioInicio?: string;
  nome1?: string;
  nome2?: string;
  foto?: string;
};

export default function ContadorTempo({ dataInicio, horarioInicio, nome1, nome2, foto }: Props) {
  const [tempo, setTempo] = useState<Tempo>(() => calcTempo(dataInicio, horarioInicio));

  useEffect(() => {
    const id = setInterval(() => setTempo(calcTempo(dataInicio, horarioInicio)), 1000);
    return () => clearInterval(id);
  }, [dataInicio, horarioInicio]);

  const anoInicio = new Date(dataInicio).getFullYear();

  return (
    <div className="bg-[#1a1a1a] rounded-2xl overflow-visible border border-white/5 relative" style={{ maxWidth: 460 }}>

      {/* Balões de coração */}
      <div className="absolute inset-x-0 bottom-full pointer-events-none" style={{ height: 120 }}>
        {HEARTS.map((h, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: h.left,
              bottom: 0,
              fontSize: h.size,
              animation: `heartFloat ${h.dur} ${h.delay} ease-in infinite`,
              opacity: 0,
              ["--drift" as string]: `${h.drift}px`,
            }}
          >
            ❤️
          </span>
        ))}
      </div>

      {/* Foto do casal */}
      <div className="relative bg-[#111] rounded-t-2xl overflow-hidden" style={{ height: 200 }}>
        {/* Fundo borrado para preencher espaços vazios */}
        <img
          src={foto || "https://picsum.photos/seed/couple2/600/300"}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
          style={{ filter: "blur(14px) brightness(0.45)" }}
        />
        {/* Foto real sem corte */}
        <img
          src={foto || "https://picsum.photos/seed/couple2/600/300"}
          alt="Casal"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "contain" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
        <div className="absolute top-3 left-0 right-0 flex justify-center">
          <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">
            Sobre o casal
          </span>
        </div>
      </div>

      {/* Nomes e contador */}
      <div className="px-4 pt-3 pb-4">
        {(nome1 || nome2) && (
          <h3 className="text-white font-black text-base mb-0">
            {nome1}{nome1 && nome2 ? " & " : ""}{nome2}
          </h3>
        )}
        <p className="text-gray-500 text-xs mb-3">Juntos desde {anoInicio} ❤️</p>

        <div className="grid grid-cols-6 gap-1.5">
          {UNITS.map(({ key, label }) => (
            <div key={key} className="bg-[#242424] rounded-lg py-2.5 flex flex-col items-center justify-center gap-1 border border-white/5 min-w-0">
              <span className="text-white font-black text-lg tabular-nums leading-none">
                {String(tempo[key]).padStart(2, "0")}
              </span>
              <span className="text-gray-500 text-[8px] text-center w-full truncate px-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes heartFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.9; }
          80%  { opacity: 0.5; }
          100% { transform: translateY(-110px) translateX(var(--drift)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
