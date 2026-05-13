"use client";
import { useRef, useState, useEffect, useCallback } from "react";

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export type PlayerEp = {
  titulo: string;
  videoTipo: string;
  videoUrl: string;
  meta?: string;
};

export default function NetflixPlayer({ ep, onClose, onNext, nextLabel }: {
  ep: PlayerEp;
  onClose: () => void;
  onNext?: () => void;
  nextLabel?: string;
}) {
  if (ep.videoTipo === "youtube") {
    const m = ep.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    const ytId = m?.[1];
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-5 py-4 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors p-1">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-white font-bold text-sm">{ep.titulo}</p>
        </div>
        <div className="flex-1">
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&modestbranding=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500 text-sm">Link do YouTube inválido</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <LocalPlayer ep={ep} onClose={onClose} onNext={onNext} nextLabel={nextLabel} />;
}

function LocalPlayer({ ep, onClose, onNext, nextLabel }: { ep: PlayerEp; onClose: () => void; onNext?: () => void; nextLabel?: string }) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);
  const hideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging  = useRef(false);

  const [playing,  setPlaying]  = useState(true);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [muted,    setMuted]    = useState(false);
  const [visible,  setVisible]  = useState(true);
  const [isFs,     setIsFs]     = useState(false);
  const [barHover, setBarHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  /* ── hide controls after 3s ── */
  const resetHide = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isDragging.current) setVisible(false);
    }, 3000);
  }, []);

  useEffect(() => { resetHide(); return () => { if (hideTimer.current) clearTimeout(hideTimer.current); }; }, [resetHide]);

  /* ── seek helper ── */
  const seekTo = useCallback((clientX: number) => {
    const bar = barRef.current;
    const v   = videoRef.current;
    if (!bar || !v || !v.duration) return;
    const { left, width } = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - left) / width));
    v.currentTime = pct * v.duration;
    setCurrent(v.currentTime);
  }, []);

  /* ── global mouse events for drag ── */
  useEffect(() => {
    const move = (e: MouseEvent)  => { if (isDragging.current) seekTo(e.clientX); };
    const up   = ()               => { if (isDragging.current) { isDragging.current = false; setDragging(false); } };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup",   up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [seekTo]);

  /* ── fullscreen change ── */
  useEffect(() => {
    const fn = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  /* ── keyboard ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case "ArrowLeft":  e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); break;
        case "ArrowRight": e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 10); break;
        case "m": v.muted = !v.muted; setMuted(v.muted); break;
        case "f": toggleFs(); break;
        case "Escape": if (!document.fullscreenElement) onClose(); break;
      }
      resetHide();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, resetHide]);

  const toggleFs = async () => {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  };

  const pct  = duration > 0 ? (current  / duration) * 100 : 0;
  const bPct = duration > 0 ? (buffered / duration) * 100 : 0;
  const barH = barHover || dragging ? 5 : 4;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      style={{ cursor: visible ? "default" : "none" }}
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        src={ep.videoUrl}
        className="w-full h-full object-contain"
        autoPlay
        onClick={() => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); resetHide(); }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v || isDragging.current) return;
          setCurrent(v.currentTime);
          if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onLoadedMetadata={() => { const v = videoRef.current; if (v) setDuration(v.duration); }}
      />

      {/* CONTROLS */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* gradients */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/90 to-transparent" />

        {/* próximo episódio — floating right */}
        {onNext && (
          <button
            className="absolute right-5 pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white border border-white/20 hover:border-white text-white hover:text-black font-bold text-sm px-4 py-2.5 rounded-lg transition-all duration-200 backdrop-blur-sm"
            style={{ top: "50%", transform: "translateY(-50%)" }}
            onClick={onNext}
          >
            <span className="hidden sm:inline truncate max-w-[140px]">{nextLabel || "Próximo"}</span>
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
            </svg>
          </button>
        )}

        {/* ← back */}
        <button
          className="absolute top-5 left-5 p-2 text-white hover:text-gray-300 transition-colors pointer-events-auto"
          onClick={onClose}
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* title top */}
        <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
          <p className="text-white font-bold text-sm opacity-80">{ep.titulo}</p>
        </div>

        {/* bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pointer-events-auto">

          {/* progress bar */}
          <div
            ref={barRef}
            className="relative mb-3 cursor-pointer select-none"
            style={{ paddingTop: 10, paddingBottom: 10 }}
            onMouseEnter={() => setBarHover(true)}
            onMouseLeave={() => setBarHover(false)}
            onMouseDown={(e) => { isDragging.current = true; setDragging(true); seekTo(e.clientX); }}
            onTouchStart={(e) => { isDragging.current = true; setDragging(true); seekTo(e.touches[0].clientX); }}
            onTouchMove={(e)  => { if (isDragging.current) seekTo(e.touches[0].clientX); }}
            onTouchEnd={() => { isDragging.current = false; setDragging(false); }}
          >
            {/* track */}
            <div className="absolute inset-x-0 rounded-full bg-white/25" style={{ top: 10, height: barH }} />
            {/* buffered */}
            <div className="absolute left-0 rounded-full bg-white/20" style={{ top: 10, height: barH, width: `${bPct}%` }} />
            {/* fill */}
            <div className="absolute left-0 rounded-full bg-[#E8185A]" style={{ top: 10, height: barH, width: `${pct}%` }} />
            {/* dot */}
            <div
              className="absolute rounded-full bg-white shadow-md"
              style={{
                width:  barHover || dragging ? 16 : 13,
                height: barHover || dragging ? 16 : 13,
                top:    barHover || dragging ? 2  : 3.5,
                left:   `calc(${pct}% - ${barHover || dragging ? 8 : 6.5}px)`,
                transition: dragging ? "none" : "width .15s, height .15s, top .15s",
              }}
            />
          </div>

          {/* buttons row */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* play / pause */}
            <button
              className="text-white hover:scale-110 transition-transform flex-shrink-0"
              onClick={() => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); }}
            >
              {playing ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* skip -10 */}
            <button
              className="text-white hover:scale-110 transition-transform flex-shrink-0 relative"
              onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
              title="Voltar 10s (←)"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black" style={{ paddingTop: 2 }}>10</span>
            </button>

            {/* skip +10 */}
            <button
              className="text-white hover:scale-110 transition-transform flex-shrink-0 relative"
              onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }}
              title="Avançar 10s (→)"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black" style={{ paddingTop: 2 }}>10</span>
            </button>

            {/* volume */}
            <button
              className="text-white hover:scale-110 transition-transform flex-shrink-0"
              onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); }}
              title="Mudo (m)"
            >
              {muted ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>

            {/* time */}
            <span className="text-white text-sm font-medium tabular-nums flex-shrink-0">
              {fmt(current)} <span className="text-white/40">/</span> {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* episode info center */}
            <div className="hidden sm:block text-center flex-shrink-0">
              {ep.meta && <p className="text-white/50 text-xs">{ep.meta}</p>}
            </div>

            <div className="flex-1" />

            {/* fullscreen */}
            <button className="text-white hover:scale-110 transition-transform flex-shrink-0" onClick={toggleFs} title="Tela cheia (f)">
              {isFs ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
