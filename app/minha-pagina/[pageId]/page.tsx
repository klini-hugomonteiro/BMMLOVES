"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type PageInfo = {
  pageId: string;
  nome1: string;
  nome2: string;
  tituloFilme: string;
  email: string;
  plan: "7dias" | "vitalicio";
  createdAt: number;
  expiresAt: number | null;
  canEdit: boolean;
  editFree: boolean;
  editUnlocked: boolean;
};

function fmt(ts: number) {
  return new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function MinhaPaginaPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const [info, setInfo] = useState<PageInfo | null>(null);
  const [error, setError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const justUnlocked = searchParams.get("editUnlocked") === "1";
  const justSaved = searchParams.get("saved") === "1";

  useEffect(() => {
    fetch(`/api/minha-pagina/${pageId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setInfo(data);
      })
      .catch(() => setError("Erro ao carregar sua página."));
  }, [pageId]);

  async function handlePaidEdit() {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/editar-checkout/${pageId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/pagamento/${data.tempId}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao iniciar edição.");
    } finally {
      setEditLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/50 mb-4">{error}</p>
          <button onClick={() => router.push("/login")} className="text-[#E8185A] text-sm font-bold">
            Voltar ao login
          </button>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/casal/${info.pageId}`;
  const expired = info.expiresAt !== null && Date.now() > info.expiresAt;
  const hoursLeft = info.expiresAt ? Math.max(0, Math.ceil((info.expiresAt - Date.now()) / (1000 * 60 * 60))) : null;

  return (
    <div className="min-h-screen bg-[#08080f] text-white" style={{ background: "radial-gradient(ellipse at top, #1a0a14 0%, #08080f 60%)" }}>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-xs">BL</div>
            <span className="font-bold text-base tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
          </div>
          <button onClick={logout} className="text-xs text-white/30 hover:text-white/60 transition-colors">Sair</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-4">

        {/* Salvo com sucesso */}
        {justSaved && (
          <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-green-400 font-medium">Página atualizada com sucesso!</p>
          </div>
        )}

        {/* Aviso de edição desbloqueada */}
        {(justUnlocked || info.editUnlocked) && (
          <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-green-400 font-medium">Edição desbloqueada! Você já pode personalizar sua página.</p>
          </div>
        )}

        {/* Card principal */}
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Sua página</p>
              <h1 className="text-xl font-black leading-tight">{info.tituloFilme || `${info.nome1} & ${info.nome2}`}</h1>
              <p className="text-sm text-white/50 mt-0.5">{info.nome1} <span className="text-[#E8185A]">♥</span> {info.nome2}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
              expired ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
            }`}>
              {expired ? "Expirada" : "Ativa"}
            </span>
          </div>

          <div className="space-y-2 text-sm border-t border-white/8 pt-4">
            <div className="flex justify-between">
              <span className="text-white/40">Plano</span>
              <span className="font-semibold">{info.plan === "vitalicio" ? "Vitalício" : "7 Dias"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Criada em</span>
              <span className="font-semibold">{fmt(info.createdAt)}</span>
            </div>
            {hoursLeft !== null && !expired && (
              <div className="flex justify-between">
                <span className="text-white/40">Expira em</span>
                <span className="font-semibold text-yellow-400">{hoursLeft}h restantes</span>
              </div>
            )}
          </div>
        </div>

        {/* Link */}
        <div className="bg-[#111118] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-[#E8185A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
          </svg>
          <p className="text-xs text-[#E8185A] font-mono flex-1 truncate">{pageUrl}</p>
          <button
            onClick={() => navigator.clipboard.writeText(pageUrl)}
            className="text-xs text-white/40 hover:text-white/70 font-semibold flex-shrink-0 transition-colors"
          >
            Copiar
          </button>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <Link
            href={`/casal/${info.pageId}`}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white text-sm font-semibold transition-colors border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Ver minha página
          </Link>

          {/* Edição — 7 dias */}
          {info.plan === "7dias" && (
            <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-4">
              <svg className="w-4 h-4 text-white/25 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-white/40">Edição não disponível</p>
                <p className="text-xs text-white/25">O plano 7 dias não permite alterações na página.</p>
              </div>
            </div>
          )}

          {/* Edição — vitalício grátis (dentro de 24h) */}
          {info.plan === "vitalicio" && info.editFree && (
            <Link
              href={`/criar?editId=${info.pageId}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#E8185A] hover:bg-[#c91450] text-white text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar gratuitamente
            </Link>
          )}

          {/* Edição — vitalício pago (após 24h) */}
          {info.plan === "vitalicio" && !info.editFree && (info.editUnlocked || justUnlocked) && (
            <Link
              href={`/criar?editId=${info.pageId}`}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#E8185A] hover:bg-[#c91450] text-white text-sm font-bold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Editar página
            </Link>
          )}

          {info.plan === "vitalicio" && !info.editFree && !info.editUnlocked && !justUnlocked && (
            <button
              onClick={handlePaidEdit}
              disabled={editLoading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#E8185A] hover:bg-[#c91450] text-white text-sm font-bold transition-colors disabled:opacity-50"
            >
              {editLoading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
              }
              Editar página · R$ 4,90
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MinhaPaginaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MinhaPaginaPageInner />
    </Suspense>
  );
}
