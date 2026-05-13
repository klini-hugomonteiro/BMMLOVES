"use client";
import { useState } from "react";

function ProfileFace({ color, faceColor, size = 120 }: { color: string; faceColor: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="8" fill={color} />
      {/* Left eye */}
      <ellipse cx="42" cy="52" rx="7" ry="7" fill={faceColor} />
      {/* Right eye */}
      <ellipse cx="78" cy="52" rx="7" ry="7" fill={faceColor} />
      {/* Smile */}
      <path
        d="M36 74 Q60 96 84 74"
        stroke={faceColor}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

type Props = {
  nome: string;
  tituloFilme: string;
  onSelect: () => void;
};

export default function ProfileSelector({ nome, tituloFilme, onSelect }: Props) {
  const [selected, setSelected] = useState(false);

  const handleSelect = () => {
    if (selected) return;
    setSelected(true);
    setTimeout(() => onSelect(), 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "#141414",
        animation: selected ? "profileFadeOut 0.9s ease forwards" : undefined,
      }}
    >
      {/* BMM Love logo top */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-7 h-7 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-xs">BL</div>
        <span className="font-bold text-lg tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
      </div>

      <h1
        className="text-white font-light text-3xl sm:text-4xl mb-10 text-center px-4"
        style={{ letterSpacing: "0.01em" }}
      >
        Quem está assistindo?
      </h1>

      <button
        onClick={handleSelect}
        className="flex flex-col items-center gap-3 outline-none"
      >
        <div
          className="rounded-md overflow-hidden"
          style={{
            outline: selected ? "3px solid #fff" : "3px solid transparent",
            transform: selected ? "scale(1.08)" : "scale(1)",
            transition: "outline 0.15s, transform 0.2s",
          }}
        >
          <ProfileFace color="#1565C0" faceColor="#90CAF9" size={130} />
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: selected ? "#fff" : "#808080", transition: "color 0.15s" }}
        >
          {nome}
        </span>
      </button>

      {tituloFilme && (
        <p className="text-gray-600 text-xs mt-14 text-center px-4">
          {tituloFilme}
        </p>
      )}

      <style>{`
        @keyframes profileFadeOut {
          0%   { opacity: 1; transform: scale(1); }
          60%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 0; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
