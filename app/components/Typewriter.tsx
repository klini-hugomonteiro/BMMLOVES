"use client";
import { useEffect, useState } from "react";

const phrases = ["sua namorada.", "seu namorado.", "sua esposa.", "seu marido.", "sua crush.", "sua mãe."];

export default function Typewriter() {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const current = phrases[phraseIdx];
    const speed = deleting ? 50 : 90;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setText(current.slice(0, charIdx + 1));
          setCharIdx((c) => c + 1);
        } else {
          setPaused(true);
          setTimeout(() => { setPaused(false); setDeleting(true); }, 2200);
        }
      } else {
        if (charIdx > 0) {
          setText(current.slice(0, charIdx - 1));
          setCharIdx((c) => c - 1);
        } else {
          setDeleting(false);
          setPhraseIdx((i) => (i + 1) % phrases.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIdx, deleting, phraseIdx, paused]);

  return (
    <span className="text-[#E8185A]">
      {text}
      <span className="typewriter-cursor text-[#E8185A]">|</span>
    </span>
  );
}
