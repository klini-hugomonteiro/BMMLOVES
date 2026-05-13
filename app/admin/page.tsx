"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PageOrder = {
  pageId: string; nome1: string; nome2: string; tituloFilme: string;
  email: string; plan: string; createdAt: number; expiresAt: number | null; status: "active" | "expired";
};
type PendingOrder = {
  tempId: string; nome1: string; nome2: string; tituloFilme: string;
  email: string; plan: string; createdAt: number;
};
type Coupon = {
  code: string; type: "percent" | "fixed"; discount: number;
  maxUses: number | null; uses: number; active: boolean; createdAt: number;
};

type Tab = "pedidos" | "pendentes" | "cupons";

function fmt(ts: number) {
  return new Date(ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pedidos");
  const [pages, setPages] = useState<PageOrder[]>([]);
  const [pending, setPending] = useState<PendingOrder[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);

  // New coupon form
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newDiscount, setNewDiscount] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [savingCoupon, setSavingCoupon] = useState(false);

  async function load() {
    setLoading(true);
    const [ordersRes, couponsRes] = await Promise.all([
      fetch("/api/admin/orders"),
      fetch("/api/admin/coupons"),
    ]);
    if (ordersRes.status === 401 || couponsRes.status === 401) { router.push("/login"); return; }
    const orders = await ordersRes.json();
    setPages(orders.pages || []);
    setPending(orders.pending || []);
    setCoupons(await couponsRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function release(tempId: string) {
    setReleasing(tempId);
    await fetch(`/api/admin/release/${tempId}`, { method: "POST" });
    await load();
    setReleasing(null);
  }

  async function toggleCoupon(code: string, active: boolean) {
    await fetch(`/api/admin/coupons/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    await load();
  }

  async function removeCoupon(code: string) {
    if (!confirm(`Remover cupom ${code}?`)) return;
    await fetch(`/api/admin/coupons/${code}`, { method: "DELETE" });
    await load();
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSavingCoupon(true);
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newCode, type: newType, discount: newDiscount, maxUses: newMaxUses || null }),
    });
    setNewCode(""); setNewDiscount(""); setNewMaxUses("");
    await load();
    setSavingCoupon(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pedidos", label: "Pedidos ativos", count: pages.length },
    { key: "pendentes", label: "Aguardando pagamento", count: pending.length },
    { key: "cupons", label: "Cupons", count: coupons.length },
  ];

  return (
    <div className="min-h-screen bg-[#08080f] text-white">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-xs">BL</div>
            <span className="font-bold text-base tracking-tight"><span className="text-[#E8185A]">BMM</span> Love</span>
            <span className="text-white/30 font-normal text-sm">Admin</span>
          </div>
          <button onClick={logout} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white/4 rounded-xl p-1 mb-6 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                tab === t.key ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === t.key ? "bg-[#E8185A] text-white" : "bg-white/10 text-white/50"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Pedidos ativos ── */}
            {tab === "pedidos" && (
              <div className="space-y-3">
                {pages.length === 0 && (
                  <div className="text-center py-16 text-white/25 text-sm">Nenhum pedido ainda.</div>
                )}
                {pages.map(p => (
                  <div key={p.pageId} className="bg-[#111118] border border-white/8 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${p.status === "active" ? "bg-green-400" : "bg-red-400"}`} />
                        <span className="font-bold text-sm truncate">{p.tituloFilme || `${p.nome1} & ${p.nome2}`}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                          {p.status === "active" ? "Ativo" : "Expirado"}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 pl-4">{p.email} · {p.nome1} & {p.nome2}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 flex-shrink-0">
                      <span className="bg-white/5 px-2.5 py-1 rounded-lg capitalize">{p.plan === "vitalicio" ? "Vitalício" : "7 dias"}</span>
                      <span>{fmt(p.createdAt)}</span>
                      <a
                        href={`/casal/${p.pageId}`}
                        target="_blank"
                        className="text-[#E8185A] hover:underline font-semibold"
                      >
                        Ver →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Pendentes ── */}
            {tab === "pendentes" && (
              <div className="space-y-3">
                {pending.length === 0 && (
                  <div className="text-center py-16 text-white/25 text-sm">Nenhum pagamento pendente.</div>
                )}
                {pending.map(p => (
                  <div key={p.tempId} className="bg-[#111118] border border-yellow-500/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{p.tituloFilme || `${p.nome1} & ${p.nome2}`}</p>
                      <p className="text-xs text-white/40">{p.email} · {p.nome1} & {p.nome2}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-white/40">{fmt(p.createdAt)}</span>
                      <span className="bg-white/5 text-xs px-2.5 py-1 rounded-lg capitalize">{p.plan === "vitalicio" ? "Vitalício" : "7 dias"}</span>
                      <button
                        onClick={() => release(p.tempId)}
                        disabled={releasing === p.tempId}
                        className="px-4 py-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1.5"
                      >
                        {releasing === p.tempId && <span className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />}
                        Liberar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Cupons ── */}
            {tab === "cupons" && (
              <div className="space-y-5">
                {/* Criar cupom */}
                <div className="bg-[#111118] border border-white/8 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Novo cupom</h3>
                  <form onSubmit={createCoupon} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs text-white/40 mb-1.5">Código</label>
                      <input
                        required value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())}
                        placeholder="LOVE10"
                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Tipo</label>
                      <select
                        value={newType} onChange={e => setNewType(e.target.value as "percent" | "fixed")}
                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                      >
                        <option value="percent">% desconto</option>
                        <option value="fixed">R$ fixo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Desconto</label>
                      <input
                        required type="number" min="0.01" step={newType === "fixed" ? "0.01" : "1"} value={newDiscount} onChange={e => setNewDiscount(e.target.value)}
                        placeholder={newType === "percent" ? "10" : "5,00"}
                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Usos máx.</label>
                      <input
                        type="number" min="1" value={newMaxUses} onChange={e => setNewMaxUses(e.target.value)}
                        placeholder="∞"
                        className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                      <button
                        type="submit" disabled={savingCoupon}
                        className="px-6 py-2.5 rounded-lg bg-[#E8185A] text-white text-sm font-bold hover:bg-[#c91450] transition-colors disabled:opacity-40"
                      >
                        {savingCoupon ? "Salvando..." : "Criar cupom"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de cupons */}
                {coupons.length === 0 && (
                  <div className="text-center py-10 text-white/25 text-sm">Nenhum cupom criado.</div>
                )}
                {coupons.map(c => (
                  <div key={c.code} className="bg-[#111118] border border-white/8 rounded-xl p-4 flex flex-wrap items-center gap-4">
                    <span className="font-mono font-black text-base text-[#E8185A]">{c.code}</span>
                    <span className="text-sm text-white/70 font-semibold">
                      {c.type === "percent" ? `${c.discount}% off` : `R$ ${c.discount.toFixed(2)} off`}
                    </span>
                    <span className="text-xs text-white/40">
                      {c.uses} / {c.maxUses ?? "∞"} usos
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => toggleCoupon(c.code, !c.active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          c.active ? "bg-green-500/15 text-green-400 hover:bg-green-500/25" : "bg-white/8 text-white/40 hover:bg-white/12"
                        }`}
                      >
                        {c.active ? "Ativo" : "Inativo"}
                      </button>
                      <button
                        onClick={() => removeCoupon(c.code)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
