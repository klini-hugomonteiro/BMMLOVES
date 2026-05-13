"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type SavedData = {
  pageId: string;
  nome1: string;
  nome2: string;
  tituloFilme: string;
  email: string;
};

export default function ProntoPage() {
  const [data, setData] = useState<SavedData | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);
  const qrRef = useRef<HTMLImageElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL params come from Mercado Pago redirect via /api/payment/success
    const pageId = searchParams.get("pageId");
    if (pageId) {
      const fromUrl: SavedData = {
        pageId,
        nome1: searchParams.get("nome1") || "",
        nome2: searchParams.get("nome2") || "",
        tituloFilme: searchParams.get("tituloFilme") || "",
        email: searchParams.get("email") || "",
      };
      setData(fromUrl);
      return;
    }
    // Fallback: localStorage (manual flow without payment)
    try {
      const raw = localStorage.getItem("bmmLoveData");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, [searchParams]);

  const pageUrl = data
    ? `${typeof window !== "undefined" ? window.location.origin : "https://bmmmlove.com"}/casal/${data.pageId}`
    : "";

  const qrUrl = pageUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(pageUrl)}&size=300x300&bgcolor=141414&color=ffffff&margin=20`
    : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = async () => {
    if (!qrUrl) return;
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${data?.nome1}-${data?.nome2}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Nenhuma página encontrada.</p>
          <Link href="/criar" className="text-[#E8185A] font-bold hover:underline">Criar agora</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center px-4 py-16">

      {/* Ícone de sucesso */}
      <div className="w-16 h-16 rounded-full bg-[#E8185A]/15 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#E8185A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <p className="text-[#E8185A] text-[11px] font-black uppercase tracking-widest mb-2">Página criada!</p>
      <h1 className="font-black text-3xl sm:text-4xl text-center mb-2">
        {data.tituloFilme}
      </h1>
      <p className="text-gray-400 text-sm mb-8 text-center">
        A história de <span className="text-white font-bold">{data.nome1} & {data.nome2}</span> está no ar.
      </p>

      {/* Card principal */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-6">

        {/* Link */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Link da página</p>
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3">
            <p className="text-[#E8185A] text-xs font-mono flex-1 truncate">{pageUrl}</p>
            <button
              onClick={copyLink}
              className="flex-shrink-0 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">QR Code</p>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-[#141414] rounded-2xl p-4 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={qrRef}
                src={qrUrl}
                alt="QR Code"
                width={200}
                height={200}
                className={`rounded-xl transition-opacity duration-300 ${qrLoaded ? "opacity-100" : "opacity-0"}`}
                onLoad={() => setQrLoaded(true)}
              />
              {!qrLoaded && (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <button
              onClick={downloadQr}
              className="flex items-center gap-2 bg-[#E8185A] hover:bg-[#c91450] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm w-full justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar QR Code
            </button>
          </div>
        </div>

        {/* Notificação */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-[#E8185A] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <p className="text-gray-400 text-xs leading-relaxed">
            Enviamos o link para <span className="text-white font-bold">{data.email}</span>.
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
        <Link
          href={data ? `/casal/${data.pageId}` : "/demo"}
          className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl text-sm text-center transition-colors border border-white/10"
        >
          Ver página
        </Link>
        <Link
          href="/criar"
          className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-xl text-sm text-center transition-colors border border-white/5"
        >
          Criar outra
        </Link>
      </div>


      <p className="text-gray-700 text-xs mt-8">
        <span className="text-[#E8185A] font-black">BMM</span>LOVE · Feito com ❤️
      </p>
    </div>
  );
}
