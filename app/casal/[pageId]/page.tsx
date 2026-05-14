"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import ContadorTempo from "../../components/ContadorTempo";
import WordSearch from "../../components/WordSearch";
import Forca from "../../components/Forca";
import NetflixPlayer, { type PlayerEp } from "../../components/NetflixPlayer";
import ProfileSelector from "../../components/ProfileSelector";

type PageData = {
  nome1: string;
  nome2: string;
  tituloFilme?: string;
  titulo?: string;
  dataInicio: string;
  cidade: string;
  musicaUrl: string;
  fotoCapaPreview: string;
  fotoSobreCasal: string;
  mensagem: string;
  episodios: { id: string; titulo: string; descricao: string; videoTipo: string; videoUrl: string; videoNome: string; capaPreview?: string }[];
  momentos: { id: string; titulo: string; fotos: { id: string; preview: string; legenda: string }[] }[];
  palavras: string[];
  palavrasForca: string[];
};

type ApiResponse =
  | { data: PageData; plan: string; expiresAt: number | null }
  | { expired: true; plan: string; nome1: string; nome2: string; tituloFilme: string }
  | { error: string };

const SPOTIFY_MAP: Record<string, string> = {
  "Perfect — Ed Sheeran":                      "0tgVpDi06FyKpA1z0VMD4v",
  "All of Me — John Legend":                   "3U4isOIWM3VvDubwSI3y7a",
  "Thinking Out Loud — Ed Sheeran":            "34gCuhDGsG4bRPIf9bb02f",
  "A Thousand Years — Christina Perri":        "6lanRgr6wXibZr8KgzXxBl",
  "Can't Help Falling in Love — Elvis Presley":"44AyOl4qwyOqBVKqzbU6nF",
  "Make You Feel My Love — Adele":             "1TfqLAPs4K3s2rJMoCokcS",
  "Photograph — Ed Sheeran":                   "1HNkqx9Ahdgi1Ixy2xkykT",
  "Die With A Smile — Lady Gaga & Bruno Mars": "2plbrEY59IikOBgBGLjaoe",
};

export default function CasalPage() {
  const params = useParams();
  const pageId = params.pageId as string;

  const [state, setState] = useState<"loading" | "ok" | "expired" | "notfound">("loading");
  const [page, setPage] = useState<PageData | null>(null);
  const [expiredInfo, setExpiredInfo] = useState<{ nome1: string; nome2: string; tituloFilme: string } | null>(null);
  const [profileSelected, setProfileSelected] = useState(false);

  const [momentoAberto, setMomentoAberto] = useState<PageData["momentos"][0] | null>(null);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [barKey, setBarKey] = useState(0);
  const [mensagemAberta, setMensagemAberta] = useState(false);
  const [jogoAberto, setJogoAberto] = useState(false);
  const [forcaAberta, setForcaAberta] = useState(false);
  const [playerIdx, setPlayerIdx] = useState<number | null>(null);
  const playerEp = playerIdx !== null && page ? page.episodios[playerIdx] : null;
  const playerOpenedAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/pages/${pageId}`)
      .then(r => r.json())
      .then((res: ApiResponse) => {
        if ("error" in res) { setState("notfound"); return; }
        if ("expired" in res) { setState("expired"); setExpiredInfo({ nome1: res.nome1, nome2: res.nome2, tituloFilme: res.tituloFilme }); return; }
        setPage(res.data);
        setState("ok");
      })
      .catch(() => setState("notfound"));
  }, [pageId]);

  useEffect(() => {
    if (!momentoAberto) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (fotoIdx < momentoAberto.fotos.length - 1) { setFotoIdx(i => i + 1); setBarKey(k => k + 1); }
      else setMomentoAberto(null);
    }, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [momentoAberto, fotoIdx, barKey]);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "notfound") {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#E8185A] font-black text-4xl mb-4">404</p>
          <p className="text-gray-400 mb-6">Esta página não foi encontrada.</p>
          <a href="/" className="text-[#E8185A] font-bold hover:underline">Voltar ao início</a>
        </div>
      </div>
    );
  }

  if (state === "expired" && expiredInfo) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#E8185A]/15 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#E8185A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#E8185A] text-xs font-black uppercase tracking-widest mb-2">Plano expirado</p>
          <h1 className="text-2xl font-black mb-2">{expiredInfo.tituloFilme}</h1>
          <p className="text-gray-400 text-sm mb-8">
            A história de <span className="text-white font-bold">{expiredInfo.nome1} & {expiredInfo.nome2}</span> está com o acesso expirado.
          </p>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-white font-bold mb-1">Renovar acesso</p>
            <p className="text-gray-500 text-sm mb-4">Garanta que sua história continue acessível.</p>
            <a href="/criar" className="block w-full bg-[#E8185A] hover:bg-[#c9154e] text-white font-bold py-3 rounded-xl text-center text-sm transition-colors">
              Renovar agora
            </a>
          </div>
          <a href="/" className="text-gray-500 text-sm hover:text-white transition-colors">Voltar ao início</a>
        </div>
      </div>
    );
  }

  if (!page) return null;

  if (!profileSelected) {
    return (
      <ProfileSelector
        nome={page.nome2}
        tituloFilme={page.tituloFilme || page.titulo || "Nossa História"}
        onSelect={() => setProfileSelected(true)}
      />
    );
  }

  const D = page;
  const tituloExibido = D.tituloFilme || D.titulo || "Nossa História";
  const spotifyMatch = (D.musicaUrl || "").match(/spotify(?:\.com)?[:/](?:intl-[a-z]+\/)?track[/:]([a-zA-Z0-9]+)/);
  const spotifyId = spotifyMatch ? spotifyMatch[1] : (SPOTIFY_MAP[D.musicaUrl] ?? null);

  return (
    <div className="min-h-screen bg-[#141414] text-white">

      {/* HERO */}
      <div className="relative" style={{ height: "56vw", minHeight: 420, maxHeight: 720 }}>
        <div className="absolute inset-0 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${D.fotoCapaPreview || "https://picsum.photos/seed/couple/1600/900"})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent pointer-events-none" style={{ top: "40%" }} />
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#141414]/60 to-transparent pointer-events-none" />

        <div className="absolute top-0 left-0 right-0 px-8 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-xs">BL</div>
            <span className="font-bold text-base tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">{D.nome1} & {D.nome2}</span>
            <div className="w-8 h-8 rounded-full bg-[#E8185A] flex items-center justify-center font-black text-xs">
              {D.nome1?.[0]}{D.nome2?.[0]}
            </div>
          </div>
        </div>

        <div className="absolute left-0 right-0 px-8 sm:px-12 z-10" style={{ bottom: "28%" }}>
          <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-[0.3em] mb-2">Série Original BMM Love</p>
          <h1 className="font-black leading-none mb-3" style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}>
            {tituloExibido}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-green-400 text-xs font-bold">95% apaixonado</span>
            <span className="text-gray-400 text-xs">{new Date(D.dataInicio).getFullYear()}</span>
            <span className="border border-white/20 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">Para sempre</span>
            <span className="border border-white/20 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">❤</span>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setPlayerIdx(0)}
              className="flex items-center gap-2 bg-white text-black font-black px-6 py-2.5 rounded hover:bg-white/90 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Assistir
            </button>
            <button onClick={() => setMensagemAberta(true)} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-2.5 rounded hover:bg-white/30 transition-colors text-sm border border-white/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Mensagem
            </button>
          </div>
          <p className="text-gray-300 text-sm max-w-md leading-relaxed" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>
            Uma história que começou{D.cidade ? ` em ${D.cidade}` : ""} e virou a série favorita de dois corações.
          </p>
        </div>
      </div>

      {/* CONTENT ROWS */}
      <div className="space-y-2 relative z-10" style={{ marginTop: "-6rem" }}>

        {/* Episódios */}
        {D.episodios?.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-base mb-2 px-8 sm:px-12">Episódios</h2>
            <NetflixRow>
              {D.episodios.map((ep, i) => (
                <NetflixCard
                  key={ep.id}
                  thumb={ep.capaPreview || D.fotoCapaPreview || `https://picsum.photos/seed/ep${i + 1}/320/180`}
                  badge
                  titulo={ep.titulo}
                  descricao={ep.descricao}
                  meta={`Episódio ${i + 1}${ep.videoNome ? ` · ${ep.videoNome}` : ""}`}
                  playLabel="Assistir"
                  onPlay={() => { playerOpenedAt.current = Date.now(); setPlayerIdx(i); }}
                />
              ))}
            </NetflixRow>
          </div>
        )}

        {/* Nossos Momentos */}
        {D.momentos?.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-base px-8 sm:px-12 mb-2">Nossos Momentos</h2>
            <NetflixRow>
              {D.momentos.map(m => (
                <div key={m.id} className="flex-shrink-0 cursor-pointer group" style={{ width: 280 }}
                  onClick={() => { setMomentoAberto(m); setFotoIdx(0); }}>
                  <div className="relative rounded-sm overflow-hidden transition-transform duration-200 group-hover:scale-105" style={{ aspectRatio: "16/9" }}>
                    <img src={m.fotos[0]?.preview} alt={m.titulo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                    <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                      <p className="text-white font-black text-sm uppercase tracking-wide" style={{ textShadow: "0 1px 6px rgba(0,0,0,1)" }}>{m.titulo}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{m.fotos.length} fotos</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </NetflixRow>
          </div>
        )}

        {/* Contador */}
        <div className="px-8 sm:px-12 pt-6">
          <ContadorTempo
            dataInicio={D.dataInicio}
            nome1={D.nome1}
            nome2={D.nome2}
            foto={D.fotoSobreCasal || D.fotoCapaPreview || "https://picsum.photos/seed/couple2/600/300"}
          />
        </div>

        {/* Trilha Sonora */}
        <section className="px-8 sm:px-12 pt-8">
          <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-widest mb-1">Playlist do casal</p>
          <h2 className="text-white font-black text-xl mb-1">Nossa Trilha Sonora</h2>
          <p className="text-gray-500 text-sm mb-5">A música que acompanha essa história.</p>
          {spotifyId ? (
            <div style={{ maxWidth: 600 }}>
              <iframe
                src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
                width="100%" height="152" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" style={{ borderRadius: 12, display: "block" }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4" style={{ maxWidth: 600 }}>
              <div className="w-10 h-10 rounded-full bg-[#E8185A]/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#E8185A]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/></svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{D.musicaUrl}</p>
                <p className="text-gray-500 text-xs mt-0.5">Nossa música</p>
              </div>
            </div>
          )}
        </section>

        {/* Mini Games */}
        <section className="px-8 sm:px-12 pt-8 pb-4">
          <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-widest mb-1">Mini Games</p>
          <h2 className="text-white font-black text-xl mb-5">Joguinhos do Casal</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setJogoAberto(true)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#E8185A]/50 transition-all hover:scale-105"
              style={{ height: 200 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d0a3e] to-[#1a1a2e]" />
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="grid grid-cols-5 gap-1 p-4">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded bg-white/40 flex items-center justify-center text-[8px] font-black text-white">
                      {["A","M","O","R","S","J","U","N","T","O","V","I","D","A","C","E","F","L","I","Z","B","K","P","Q","X"][i]}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-[#E8185A]/0 group-hover:bg-[#E8185A]/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8">
                <p className="text-[#E8185A] text-[9px] font-black uppercase tracking-widest mb-0.5">Mini Game</p>
                <p className="text-white font-black text-sm leading-tight">Caça-Palavras</p>
              </div>
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#E8185A] flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </button>

            <button onClick={() => setForcaAberta(true)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-[#E8185A]/50 transition-all hover:scale-105"
              style={{ height: 200 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a2e] via-[#0a2a3e] to-[#1a1a2e]" />
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
                  <line x1="5" y1="85" x2="75" y2="85" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="20" y1="85" x2="20" y2="5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="20" y1="5" x2="50" y2="5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="50" y1="5" x2="50" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="50" cy="26" r="8" stroke="#E8185A" strokeWidth="2"/>
                  <line x1="50" y1="34" x2="50" y2="58" stroke="#E8185A" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="50" y1="44" x2="38" y2="54" stroke="#E8185A" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="50" y1="44" x2="62" y2="54" stroke="#E8185A" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="50" y1="58" x2="40" y2="72" stroke="#E8185A" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="50" y1="58" x2="60" y2="72" stroke="#E8185A" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="absolute inset-0 bg-[#E8185A]/0 group-hover:bg-[#E8185A]/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-8">
                <p className="text-[#E8185A] text-[9px] font-black uppercase tracking-widest mb-0.5">Mini Game</p>
                <p className="text-white font-black text-sm leading-tight">Forca</p>
              </div>
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 group-hover:bg-[#E8185A] flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </button>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/5 px-8 py-8 mt-8 text-center">
        <p className="text-[#E8185A] font-black text-sm mb-1">BMM LOVE</p>
        <p className="text-gray-600 text-xs">Feito com ❤️ para {D.nome1} & {D.nome2}</p>
      </footer>

      {/* MODAL MOMENTOS */}
      {momentoAberto && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setMomentoAberto(null)}>
          <div className="relative flex flex-col bg-black" style={{ width: 390, height: "85vh", maxHeight: 844 }} onClick={e => e.stopPropagation()}>
            {/* Fundo: mesma foto borrada para preencher sem cortar */}
            <img src={momentoAberto.fotos[fotoIdx]?.preview} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" style={{ filter: "blur(18px) brightness(0.5)" }} />
            {/* Foto real: tamanho certo, sem corte, sem esticamento */}
            <img src={momentoAberto.fotos[fotoIdx]?.preview} alt="" className="absolute inset-0 w-full h-full object-contain" />

            {/* Área de toque */}
            <div className="absolute inset-0" onClick={e => {
              const x = e.clientX / window.innerWidth;
              if (x > 0.5) { if (fotoIdx < momentoAberto.fotos.length - 1) { setFotoIdx(i => i + 1); setBarKey(k => k + 1); } else setMomentoAberto(null); }
              else { if (fotoIdx > 0) { setFotoIdx(i => i - 1); setBarKey(k => k + 1); } }
            }} />

            {/* Barras de progresso */}
            <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-10">
              {momentoAberto.fotos.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                  {i < fotoIdx && <div className="h-full w-full bg-white rounded-full" />}
                  {i === fotoIdx && <div key={barKey} className="h-full bg-white rounded-full" style={{ animation: "storyProgress 5s linear forwards" }} />}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-5 left-0 right-0 flex items-center justify-between px-4 z-10">
              <button onClick={() => setMomentoAberto(null)} className="text-white p-1">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <p className="text-white font-bold text-sm">{momentoAberto.titulo}</p>
              <div className="w-8" />
            </div>

            {/* Card inferior */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 z-10">
              <div className="bg-[#1e1e1e]/90 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={momentoAberto.fotos[0]?.preview} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{momentoAberto.titulo}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{D.nome1} & {D.nome2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NETFLIX PLAYER */}
      {playerEp && playerIdx !== null && (
        <NetflixPlayer
          ep={playerEp}
          onClose={() => setPlayerIdx(null)}
          onNext={playerIdx < D.episodios.length - 1 ? () => setPlayerIdx(playerIdx + 1) : undefined}
          nextLabel={playerIdx < D.episodios.length - 1 ? `EP ${playerIdx + 2}: ${D.episodios[playerIdx + 1].titulo}` : undefined}
        />
      )}

      {/* MODAL FORCA */}
      {forcaAberta && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setForcaAberta(false)}>
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl w-full p-6" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setForcaAberta(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-widest mb-1">Mini Game</p>
            <h3 className="text-white font-black text-lg mb-5">Forca dos Momentos</h3>
            <Forca entradas={(D.palavrasForca?.length ? D.palavrasForca : ["Momento 1", "Momento 2"]).map((p: string) => ({ palavra: p, dica: "Momento marcante de vocês" }))} />
          </div>
        </div>
      )}

      {/* MODAL JOGO */}
      {jogoAberto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setJogoAberto(false)}>
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl w-full p-6" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setJogoAberto(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-widest mb-1">Mini Game</p>
            <h3 className="text-white font-black text-lg mb-1">Caça-Palavras</h3>
            <p className="text-gray-500 text-xs mb-5">Arraste para encontrar as palavras escondidas.</p>
            <WordSearch words={D.palavras || []} />
          </div>
        </div>
      )}

      {/* MODAL MENSAGEM */}
      {mensagemAberta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setMensagemAberta(false)}>
          <div className="relative bg-[#141414] border border-white/10 rounded-2xl max-w-lg w-full p-8" onClick={e => e.stopPropagation()}>
            <button onClick={() => setMensagemAberta(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="w-12 h-12 rounded-full bg-[#E8185A]/15 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#E8185A]" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </div>
            <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-widest mb-2">Mensagem especial</p>
            <p className="text-white text-sm leading-relaxed">{D.mensagem}</p>
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E8185A] flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">{D.nome1?.[0]}</div>
              <p className="text-gray-500 text-xs">{D.nome1} para {D.nome2}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes storyProgress { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
}

function NetflixRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto px-8 sm:px-12 scrollbar-hide" style={{ paddingBottom: 40 }}>
      {children}
    </div>
  );
}

function NetflixCard({ thumb, badge, titulo, descricao, meta, playLabel, onPlay }: {
  thumb: string; badge?: boolean; titulo: string; descricao: string;
  meta: string; playLabel: string; onPlay?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="flex-shrink-0 relative cursor-pointer" style={{ width: 280, zIndex: hovered ? 20 : 1 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="rounded-sm overflow-hidden transition-all duration-200 origin-center"
        style={{ transform: hovered ? "scale(1.1)" : "scale(1)", boxShadow: hovered ? "0 8px 40px rgba(0,0,0,0.9)" : "none" }}>
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <img src={thumb} alt={titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          {badge && (
            <div className="absolute top-2 left-2 leading-tight">
              <span className="text-[#E8185A] font-black" style={{ fontSize: 8, letterSpacing: 1 }}>BMM LOVE </span>
              <span className="text-white font-black" style={{ fontSize: 8, letterSpacing: 1 }}>ORIGINAL</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
            <p className="text-white font-black leading-tight uppercase" style={{ fontSize: "clamp(11px, 1.4vw, 16px)", textShadow: "0 1px 6px rgba(0,0,0,1)", letterSpacing: "0.02em" }}>{titulo}</p>
            {descricao && <p className="text-gray-300 text-[9px] mt-0.5 line-clamp-1" style={{ textShadow: "0 1px 4px rgba(0,0,0,1)" }}>{descricao}</p>}
            {meta && <p className="text-gray-400 text-[9px] mt-0.5 truncate">{meta}</p>}
          </div>
          {onPlay && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button className={`w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-all duration-150 pointer-events-auto ${hovered ? "opacity-100 scale-110" : "opacity-0 scale-90"}`}
                onClick={e => { e.stopPropagation(); onPlay(); }}>
                <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          )}
        </div>
        {hovered && (
          <div className="bg-[#181818] px-3 py-2">
            <button onClick={e => { e.stopPropagation(); onPlay?.(); }}
              className="flex items-center gap-1 bg-white text-black text-[10px] font-black px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              {playLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
