"use client";
import { useEffect, useState } from "react";

const EXPLOSION = Array.from({ length: 32 }, (_, i) => {
  const angle = (360 / 32) * i + (Math.random() * 8 - 4);
  const dist = 140 + Math.random() * 260;
  const size = 14 + Math.random() * 24;
  const delay = Math.random() * 0.12;
  const rad = (angle * Math.PI) / 180;
  return {
    tx: Math.cos(rad) * dist,
    ty: Math.sin(rad) * dist,
    size,
    delay,
    duration: 0.5 + Math.random() * 0.5,
    rotate: Math.random() * 720 - 360,
    emoji: ["❤️", "💕", "🩷", "💗"][i % 4],
  };
});

type Phase = "idle" | "flying" | "impact" | "exploding" | "fading" | "done";

export default function HeartIntro() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("flying"),    80);
    const t1 = setTimeout(() => setPhase("impact"),    950);
    const t2 = setTimeout(() => setPhase("exploding"), 1040);
    const t3 = setTimeout(() => setPhase("fading"),    1900);
    const t4 = setTimeout(() => setPhase("done"),      2700);
    return () => [t0, t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      style={{
        background: phase === "fading" ? "transparent" : "rgba(0,0,0,0.9)",
        transition: "background 0.7s ease",
      }}
    >
      {/* ── METEOR ── */}
      {(phase === "flying" || phase === "impact") && (
        <div
          style={{
            position: "absolute",
            animation:
              phase === "flying"
                ? "meteorMove 0.85s cubic-bezier(0.4,0,0.8,1) forwards"
                : "meteorImpact 0.13s ease-out forwards",
          }}
        >
          {/* Tail — long gradient streak behind the heart */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "50%",
              transform: "translateY(-50%)",
              width: phase === "flying" ? "220px" : "80px",
              height: "28px",
              borderRadius: "50%",
              background:
                "linear-gradient(to left, rgba(232,24,90,0.9) 0%, rgba(255,100,0,0.7) 25%, rgba(255,200,0,0.3) 65%, transparent 100%)",
              filter: "blur(6px)",
              transition: "width 0.1s",
            }}
          />
          {/* Spark particles along the tail */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `calc(50% + ${(Math.random() * 20 - 10)}px)`,
                right: `calc(50% + ${30 + i * 30}px)`,
                width: `${6 - i * 0.5}px`,
                height: `${6 - i * 0.5}px`,
                borderRadius: "50%",
                background: i < 2 ? "#ff6600" : i < 4 ? "#ffaa00" : "#ffffff",
                boxShadow: `0 0 ${8 - i}px ${i < 2 ? "#ff4400" : "#ffcc00"}`,
                opacity: 1 - i * 0.12,
              }}
            />
          ))}
          {/* Core — glowing heart */}
          <div
            style={{
              position: "relative",
              fontSize: "52px",
              lineHeight: 1,
              filter:
                "drop-shadow(0 0 12px #ff4400) drop-shadow(0 0 30px #E8185A) drop-shadow(0 0 60px #ff6600)",
            }}
          >
            ❤️
          </div>
        </div>
      )}

      {/* ── SHOCKWAVE ── */}
      {(phase === "exploding" || phase === "fading") && (
        <>
          <div style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", border: "5px solid #ff6600", animation: "shock1 0.5s ease-out forwards" }} />
          <div style={{ position: "absolute", width: 20, height: 20, borderRadius: "50%", border: "3px solid #E8185A", animation: "shock1 0.5s ease-out 0.08s forwards" }} />
        </>
      )}

      {/* ── EXPLOSION HEARTS ── */}
      {(phase === "exploding" || phase === "fading") &&
        EXPLOSION.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              fontSize: p.size,
              opacity: phase === "fading" ? 0 : 1,
              transition: `opacity 0.5s ease ${p.delay}s`,
              animation: `heartExplode ${p.duration}s cubic-bezier(0.15,0.85,0.35,1) ${p.delay}s both`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rotate}deg`,
              filter: "drop-shadow(0 0 4px #E8185A)",
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))}

      <style>{`
        @keyframes meteorMove {
          0%   { transform: translate(-58vw, 18vh) scale(0.5); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes meteorImpact {
          0%   { transform: scale(1); }
          45%  { transform: scale(2.2) rotate(-5deg); filter: brightness(3); }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes shock1 {
          0%   { transform: scale(0.3); opacity: 1; }
          100% { transform: scale(22); opacity: 0; }
        }
        @keyframes heartExplode {
          0%   { transform: translate(0,0) scale(0.1) rotate(0deg); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--tx),var(--ty)) scale(1) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
