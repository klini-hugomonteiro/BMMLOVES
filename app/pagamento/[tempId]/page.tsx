"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type PendingInfo = {
  plan: "7dias" | "vitalicio";
  amount: number;
  email: string;
  nome1: string;
  nome2: string;
  tituloFilme: string;
  isEdit?: boolean;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MercadoPago: any;
  }
}

function maskCpf(digits: string) {
  if (digits.length > 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
  if (digits.length > 6) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  if (digits.length > 3) return `${digits.slice(0,3)}.${digits.slice(3)}`;
  return digits;
}

function detectBrand(bin: string): string {
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6516|6550)/.test(bin)) return "elo";
  if (/^(606282|3841)/.test(bin)) return "hipercard";
  if (/^3[47]/.test(bin)) return "amex";
  if (/^(5[0-5]|2[2-7])/.test(bin)) return "master";
  if (/^4/.test(bin)) return "visa";
  return "";
}

function isValidCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const calc = (n: number) => {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += parseInt(d[i]) * (n + 1 - i);
    const r = (sum * 10) % 11;
    return r >= 10 ? 0 : r;
  };
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
}

export default function PagamentoPage() {
  const params = useParams();
  const router = useRouter();
  const tempId = params.tempId as string;

  const [info, setInfo] = useState<PendingInfo | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [tab, setTab] = useState<"pix" | "card">("pix");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; paymentId?: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [copied, setCopied] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Card form state
  const [cardholderName, setCardholderName] = useState("");
  const [cpf, setCpf] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mpInstanceRef = useRef<any>(null);
  const fieldsInitialized = useRef(false);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    fetch(`/api/checkout/${tempId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError("Link expirado ou inválido."); return; }
        setInfo(data);
        setAmount(data.amount);
      })
      .catch(() => setError("Erro ao carregar sessão."));
  }, [tempId]);

  // Inicializa campos Core SDK quando tab === "card"
  useEffect(() => {
    if (!info || tab !== "card") return;
    if (fieldsInitialized.current) return;

    const pubKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (!pubKey) return;

    function mountFields() {
      if (fieldsInitialized.current) return;
      fieldsInitialized.current = true;

      const mp = new window.MercadoPago(pubKey, { locale: "pt-BR" });
      mpInstanceRef.current = mp;

      const fieldStyle = {
        color: "rgba(255,255,255,0.9)",
        fontSize: "14px",
        placeholderColor: "rgba(255,255,255,0.3)",
      };

      const cardNumberField = mp.fields
        .create("cardNumber", { placeholder: "0000 0000 0000 0000", style: fieldStyle })
        .mount("mp-cardNumber");

      mp.fields
        .create("expirationDate", { placeholder: "MM/AAAA", style: fieldStyle })
        .mount("mp-expirationDate");

      mp.fields
        .create("securityCode", { placeholder: "CVV", style: fieldStyle })
        .mount("mp-securityCode");

      // Detecta bandeira pelo BIN via API do MP com fallback local
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cardNumberField.on("binChange", ({ bin }: { bin: string }) => {
        if (!bin || bin.length < 6) { setPaymentMethodId(""); return; }
        mp.getPaymentMethods({ bin })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .then((methods: any) => {
            const id = methods?.results?.[0]?.id;
            setPaymentMethodId(id || detectBrand(bin));
          })
          .catch(() => setPaymentMethodId(detectBrand(bin)));
      });
    }

    if (window.MercadoPago) {
      mountFields();
    } else {
      const existing = document.getElementById("mp-sdk");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "mp-sdk";
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = mountFields;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", mountFields);
      }
    }

    return () => {
      fieldsInitialized.current = false;
      mpInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info, tab]);

  async function handlePix() {
    if (!info || amount === null) return;
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempId,
          payment_method_id: "pix",
          transaction_amount: amount,
          payer: { email: info.email },
          ...(couponApplied ? { couponCode: couponCode.trim() } : {}),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao gerar PIX");
      if (result.status === "pending") {
        setPixData({ qrCode: result.qrCode, qrCodeBase64: result.qrCodeBase64, paymentId: String(result.paymentId) });
        // Inicia polling a cada 5s
        pollRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/api/payment/check?paymentId=${result.paymentId}&tempId=${tempId}`);
            const d = await r.json();
            if (d.status === "approved" && d.redirectUrl) {
              if (pollRef.current) clearInterval(pollRef.current);
              window.location.href = d.redirectUrl;
            }
          } catch { /* ignora erros de rede */ }
        }, 5000);
        return;
      }
      setError("Erro ao gerar QR Code PIX.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCardSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!info || !mpInstanceRef.current || amount === null) return;

    if (!cardholderName.trim()) { setError("Informe o nome no cartão."); return; }
    const cleanCpf = cpf.replace(/\D/g, "");
    if (!isValidCPF(cleanCpf)) { setError("CPF inválido. Verifique o número informado."); return; }
    setProcessing(true);
    setError("");

    try {
      const token = await mpInstanceRef.current.fields.createCardToken({
        cardholderName: cardholderName.trim().toUpperCase(),
        identificationType: "CPF",
        identificationNumber: cleanCpf,
      });

      if (!token?.id) throw new Error("Não foi possível tokenizar o cartão.");

      // Pega payment_method_id pelo BIN real do token
      let methodId = paymentMethodId || detectBrand(token.first_six_digits || "");
      if (token.first_six_digits) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const methods = await mpInstanceRef.current.getPaymentMethods({ bin: token.first_six_digits });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const id = (methods as any)?.results?.[0]?.id;
          if (id) methodId = id;
        } catch { /* usa fallback */ }
      }
      const res = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tempId,
          token: token.id,
          payment_method_id: methodId,
          installments: 1,
          transaction_amount: amount,
          payer: {
            email: info.email,
            identification: { type: "CPF", number: cleanCpf },
          },
          ...(couponApplied ? { couponCode: couponCode.trim() } : {}),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao processar");
      if (result.status === "approved" || result.status === "in_process") {
        window.location.href = result.redirectUrl;
        return;
      }
      setError(result.status === "rejected"
        ? "Pagamento recusado. Verifique os dados do cartão ou use PIX."
        : `Pagamento não processado (${result.status}). Tente novamente ou use PIX.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleApplyCoupon() {
    if (!info || !couponCode.trim()) return;
    setCouponError(""); setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), plan: info.plan }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || "Cupom inválido."); return; }
      setAmount(data.newAmount);
      setCouponApplied(true);
    } catch { setCouponError("Erro ao validar cupom."); }
    finally { setCouponLoading(false); }
  }

  function handleCopyPix() {
    navigator.clipboard.writeText(pixData!.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error && !info) {
    return (
      <div className="min-h-screen bg-[#0b0b16] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/60 mb-5">{error}</p>
          <button onClick={() => router.push("/criar")} className="px-6 py-2.5 rounded-full bg-[#E8185A] text-white text-sm font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  if (!info || amount === null) {
    return (
      <div className="min-h-screen bg-[#0b0b16] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planLabel = info.plan === "vitalicio" ? "Para Sempre (Vitalício)" : "7 Dias";

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      {/* Topo */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-xs">BL</div>
            <span className="font-bold text-base tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Compra segura
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">

          {/* ── Resumo ── */}
          <div className="space-y-3">
            <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Resumo do pedido</h2>
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-[#E8185A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
                    <span className="text-sm font-semibold">{info.isEdit ? "Taxa de edição" : `Plano: ${planLabel}`}</span>
                  </div>
                  <p className="text-xs text-white/40 pl-6">{info.tituloFilme || `${info.nome1} & ${info.nome2}`}</p>
                </div>
                <span className="text-sm font-bold flex-shrink-0">R$ {(couponApplied ? info.amount : amount).toFixed(2).replace(".", ",")}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between py-3 border-b border-white/8 text-sm">
                  <span className="text-green-400">Cupom <span className="font-mono font-bold">{couponCode.toUpperCase()}</span></span>
                  <span className="text-green-400 font-semibold">- R$ {(info.amount - amount).toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-bold">Total:</span>
                <div className="text-right">
                  {couponApplied && <span className="text-white/30 line-through text-xs block">R$ {info.amount.toFixed(2).replace(".", ",")}</span>}
                  <span className="text-2xl font-black">R$ {amount.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            {/* Cupom */}
            {!info.isEdit && (
              <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
                <button onClick={() => setCouponOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-4 text-sm text-white/50 hover:text-white/70 transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    Possui um cupom de desconto?
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${couponOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {couponOpen && !couponApplied && (
                  <div className="px-5 pb-4 space-y-2">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Digite o cupom" value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                        className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-white/25 focus:outline-none focus:border-[#E8185A]/50 transition-colors" />
                      <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#E8185A] text-white text-sm font-bold hover:bg-[#c91450] transition-colors disabled:opacity-40">
                        {couponLoading ? "..." : "Aplicar"}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Selos */}
            <div className="flex items-center justify-center gap-5 py-1">
              {[
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Compra segura" },
                { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", label: "Dados protegidos" },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", label: "Pagamento único" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5">
                  <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={icon}/></svg>
                  <span className="text-[10px] text-white/20 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Pagamento ── */}
          <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
            <div className="p-5 pb-0">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Forma de pagamento</p>

              {/* Tabs */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { key: "pix" as const, icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.06 11.57l-2.96-2.96c-.39-.39-1.03-.39-1.42 0L9.72 11.57c-.39.39-.39 1.02 0 1.41l2.96 2.96c.39.39 1.02.39 1.41 0l2.97-2.96c.39-.39.39-1.02 0-1.41zM11.5 2L4 9.5l2 2 5.5-5.5 5.5 5.5 2-2L11.5 2zm0 20l7.5-7.5-2-2-5.5 5.5L6 13l-2 2 7.5 7.5z"/></svg>, label: "PIX" },
                  { key: "card" as const, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>, label: "Cartão" },
                ].map(t => (
                  <button key={t.key} onClick={() => { setTab(t.key); setError(""); }}
                    className={`flex items-center justify-center gap-2.5 py-3 rounded-xl border font-semibold text-sm transition-all ${
                      tab === t.key
                        ? "bg-white/10 border-white/25 text-white"
                        : "bg-transparent border-white/8 text-white/40 hover:border-white/15 hover:text-white/60"
                    }`}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Erros */}
            <div className="px-5">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl p-3.5 mb-4">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* ── PIX ── */}
            {tab === "pix" && !pixData && (
              <div className="px-5 pb-5">
                <div className="bg-white/4 border border-white/8 rounded-xl p-4 flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.06 11.57l-2.96-2.96c-.39-.39-1.03-.39-1.42 0L9.72 11.57c-.39.39-.39 1.02 0 1.41l2.96 2.96c.39.39 1.02.39 1.41 0l2.97-2.96c.39-.39.39-1.02 0-1.41zM11.5 2L4 9.5l2 2 5.5-5.5 5.5 5.5 2-2L11.5 2zm0 20l7.5-7.5-2-2-5.5 5.5L6 13l-2 2 7.5 7.5z"/></svg>
                  <div>
                    <p className="text-sm font-semibold text-white">Pagamento via PIX</p>
                    <p className="text-xs text-white/40 mt-0.5">Instantâneo e seguro. Clique para gerar o QR Code.</p>
                  </div>
                </div>
                <button onClick={handlePix} disabled={processing}
                  className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
                  style={{ background: "#00b09b", color: "white" }}>
                  {processing
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.06 11.57l-2.96-2.96c-.39-.39-1.03-.39-1.42 0L9.72 11.57c-.39.39-.39 1.02 0 1.41l2.96 2.96c.39.39 1.02.39 1.41 0l2.97-2.96c.39-.39.39-1.02 0-1.41zM11.5 2L4 9.5l2 2 5.5-5.5 5.5 5.5 2-2L11.5 2zm0 20l7.5-7.5-2-2-5.5 5.5L6 13l-2 2 7.5 7.5z"/></svg>
                  }
                  {processing ? "Gerando..." : `Gerar QR Code PIX · R$ ${amount.toFixed(2).replace(".", ",")}`}
                </button>
              </div>
            )}

            {/* ── PIX QR Code ── */}
            {tab === "pix" && pixData && (
              <div className="px-5 pb-5 text-center">
                <p className="text-sm text-white/50 mb-4">Escaneie o QR Code ou copie o código abaixo.</p>
                {pixData.qrCodeBase64 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="QR Code PIX"
                    className="w-44 h-44 mx-auto mb-4 rounded-xl bg-white p-2" />
                )}
                <div className="bg-black/30 border border-white/8 rounded-xl p-3 text-xs text-white/40 break-all select-all mb-3 font-mono text-left">{pixData.qrCode}</div>
                <button onClick={handleCopyPix}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
                  style={{ background: copied ? "#00B894" : "rgba(255,255,255,0.07)", color: "white" }}>
                  {copied ? "✓ Copiado!" : "Copiar código PIX"}
                </button>
                <p className="text-xs text-white/30 mt-3">O link chegará no e-mail após confirmação do pagamento.</p>
              </div>
            )}

            {/* ── Cartão (Core SDK) ── */}
            {tab === "card" && (
              <form onSubmit={handleCardSubmit} className="px-5 pb-5 space-y-3">
                {/* Nome no cartão */}
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Nome no cartão</label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={e => setCardholderName(e.target.value.toUpperCase())}
                    placeholder="COMO APARECE NO CARTÃO"
                    autoComplete="cc-name"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E8185A]/40 transition-colors"
                  />
                </div>

                {/* Número do cartão */}
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Número do cartão</label>
                  <div
                    id="mp-cardNumber"
                    className="bg-[#0f0f1a] border border-white/10 rounded-xl px-4 h-12"
                    style={{ display: "flex", alignItems: "center" }}
                  />
                </div>

                {/* Validade e CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 font-medium">Validade</label>
                    <div
                      id="mp-expirationDate"
                      className="bg-[#0f0f1a] border border-white/10 rounded-xl px-4 h-12"
                      style={{ display: "flex", alignItems: "center" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 font-medium">CVV</label>
                    <div
                      id="mp-securityCode"
                      className="bg-[#0f0f1a] border border-white/10 rounded-xl px-4 h-12"
                      style={{ display: "flex", alignItems: "center" }}
                    />
                  </div>
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">CPF do titular</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cpf}
                    onChange={e => setCpf(maskCpf(e.target.value.replace(/\D/g, "").slice(0, 11)))}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E8185A]/40 transition-colors"
                  />
                </div>

                {processing && (
                  <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-3">
                    <div className="w-4 h-4 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-sm text-white/50">Processando pagamento...</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 rounded-xl bg-[#E8185A] hover:bg-[#c91450] text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2.5"
                >
                  {processing
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  }
                  {processing ? "Processando..." : `Pagar R$ ${amount.toFixed(2).replace(".", ",")} com cartão`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
