"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "email" | "code";

export default function EntrarPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar código.");
      setTempToken(data.tempToken);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Código inválido.");
      router.push(data.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at top, #1a0a14 0%, #08080f 60%)" }}>

      <div className="w-full max-w-sm">
        {/* Voltar ao site */}
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors w-fit">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar ao site
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-9 h-9 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-sm">BL</div>
            <span className="font-bold text-2xl tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
          </div>
          <p className="text-white/30 text-sm mt-2">Acesse sua conta</p>
        </div>

        <div className="bg-[#111118] border border-white/8 rounded-2xl p-7">

          {step === "email" ? (
            <>
              <h1 className="text-lg font-bold mb-1">Entrar</h1>
              <p className="text-sm text-white/40 mb-6">
                Digite seu e-mail para receber o código de acesso.
              </p>

              <form onSubmit={handleEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#E8185A] text-white font-bold text-sm hover:bg-[#c91450] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </form>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep("email"); setError(""); setCode(""); }}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs mb-5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>

              <h1 className="text-lg font-bold mb-1">Verifique seu e-mail</h1>
              <p className="text-sm text-white/40 mb-6">
                Enviamos um código de 6 dígitos para <span className="text-white/70">{email}</span>.
              </p>

              <form onSubmit={handleCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-bold text-center tracking-[0.5em] placeholder-white/20 focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="w-full py-3 rounded-xl bg-[#E8185A] text-white font-bold text-sm hover:bg-[#c91450] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {loading ? "Verificando..." : "Entrar"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setCode(""); }}
                  className="w-full text-sm text-white/30 hover:text-white/50 transition-colors"
                >
                  Reenviar código
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
