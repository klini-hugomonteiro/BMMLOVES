export const dynamic = "force-dynamic";
import Navbar from "./components/Navbar";
import Typewriter from "./components/Typewriter";
import FaqAccordion from "./components/FaqAccordion";
import { getCount } from "./lib/counter";

const steps = [
  { n: "01", title: "Crie o roteiro", desc: "Preencha a história de vocês: data de início, momentos marcantes, frases especiais." },
  { n: "02", title: "Monte os episódios", desc: "Adicione fotos, músicas e mensagens. Cada seção vira um episódio único." },
  { n: "03", title: "Receba o link", desc: "Sua página vai ao ar na hora com link e QR Code exclusivos." },
  { n: "04", title: "Surpreenda", desc: "Compartilhe e prepare-se para a emoção. Experiência que não esquece." },
];

const features = [
  { icon: "🎬", title: "Estilo streaming", desc: "Interface inspirada nos grandes apps de streaming. Sua história com uma produção única." },
  { icon: "🎵", title: "Trilha sonora", desc: "Adicione a música que marca a história de vocês. Toca em loop enquanto assistem." },
  { icon: "📸", title: "Galeria de fotos", desc: "Seus melhores momentos em uma galeria cinematográfica." },
  { icon: "✨", title: "Retrospectiva animada", desc: "Um recap animado dos melhores momentos — estilo Spotify Wrapped do casal." },
  { icon: "🔗", title: "Link + QR Code", desc: "Compartilhe pelo WhatsApp ou imprima o QR Code para a surpresa presencial." },
  { icon: "♾️", title: "Para sempre online", desc: "No plano vitalício sua página fica no ar para sempre, acessível de qualquer lugar." },
];

const testimonials = [
  { name: "Lucas M.", text: '"Minha namorada chorou quando abriu. Colocou a música que era a nossa e ficou travada na tela por 10 minutos."', stars: 5 },
  { name: "Camila R.", text: '"Fiz pra minha mãe no Dia das Mães. Ela nunca tinha recebido algo tão personalizado. Ficou impressionada."', stars: 5 },
  { name: "Rafael T.", text: '"Surpresa no aniversário de 2 anos. Ela achou que era só uma mensagem, quando abriu teve toda a nossa história lá."', stars: 5 },
  { name: "Beatriz F.", text: '"A interface é linda demais. Parece um Netflix do nosso relacionamento. Muito criativo."', stars: 5 },
];

export default function Home() {
  const count = getCount();
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section
        id="inicio"
        className="relative min-h-screen flex items-center"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1a0e14",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.92) 45%, rgba(0,0,0,0.60) 70%, rgba(0,0,0,0.20) 100%)",
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 pt-24 pb-24 sm:pb-28">

          {/* copy */}
          <div className="max-w-[520px]">
            <p className="text-[#E8185A] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] mb-4">
              Presente Digital Romântico
            </p>

            <h1 className="text-[2.4rem] sm:text-5xl lg:text-6xl font-black leading-[1.08] text-white mb-4 sm:mb-5">
              Transforme sua<br />
              história de <span className="text-[#E8185A]">amor</span><br />
              <span className="text-[#E8185A]">em</span><br />
              uma experiência<br />
              estilo <span className="text-[#E8185A]">streaming</span>
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-[380px]">
              Crie uma página romântica personalizada com fotos, música, mensagens
              e momentos especiais para surpreender quem você ama.
            </p>

            <div className="flex flex-wrap gap-3 mb-5 sm:mb-7">
              <a
                href="/criar"
                className="bg-[#E8185A] hover:bg-[#c9154e] text-white font-bold px-5 sm:px-6 py-3 rounded-lg text-sm transition-colors w-full sm:w-auto text-center"
                style={{ boxShadow: "0 0 20px rgba(232,24,90,0.4)" }}
              >
                Criar meu presente agora
              </a>
              <a
                href="#exemplo"
                className="border border-white/30 hover:border-white/60 text-white font-semibold px-5 sm:px-6 py-3 rounded-lg text-sm transition-colors bg-white/5 hover:bg-white/10 w-full sm:w-auto text-center"
              >
                Ver exemplo
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Entrega rápida", "Abre no celular", "Personalização premium"].map((t) => (
                <span key={t} className="text-xs text-gray-300 border border-white/15 bg-white/5 rounded-full px-3 py-1.5">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Netflix card — desktop only, absolute positioned */}
          <div
            className="hidden lg:block absolute top-1/2"
            style={{ right: "6%", transform: "translateY(-50%) rotate(-4deg)" }}
          >
            <div className="w-[300px] rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)]" style={{ background: "#141414" }}>
              <div
                className="relative h-[172px] flex flex-col justify-end p-4"
                style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center top", backgroundColor: "#2a1520" }}
              >
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.08) 55%)" }} />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/30" />)}
                </div>
                <div className="relative z-10">
                  <p className="text-[#E8185A] text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1">Original do Casal</p>
                  <h3 className="text-white font-black text-[22px] leading-tight">A nossa<br />história</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-xs mb-3 leading-relaxed">Fotos, música, episódios e motivos para amar.</p>
                <div className="flex gap-2 mb-3">
                  <button className="flex-1 bg-white text-black text-xs font-bold py-2 rounded-md">▶ Assistir</button>
                  <button className="flex-1 bg-white/10 text-white text-xs font-medium py-2 rounded-md">+ Mais infos</button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="aspect-video rounded-md" style={{ background: "linear-gradient(135deg,#c0185a,#8b0d3e)" }} />
                  <div className="aspect-video rounded-md" style={{ background: "linear-gradient(135deg,#b01550,#7a0c36)" }} />
                  <div className="aspect-video rounded-md" style={{ background: "linear-gradient(135deg,#9e1246,#620929)" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom CTA — hidden on mobile */}
        <div className="hidden sm:flex absolute bottom-0 left-0 right-0 justify-end p-6 z-10">
          <a href="/criar" className="bg-[#E8185A] hover:bg-[#c9154e] text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors shadow-lg">
            Criar meu presente agora
          </a>
        </div>
      </section>

      {/* ── COUNTER STRIP ── */}
      <div className="bg-[#E8185A] py-3">
        <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-white text-xs sm:text-sm font-medium">
          <span>❤️ <strong>+{count.toLocaleString("pt-BR")}</strong> presentes criados</span>
          <span className="hidden sm:block w-px h-4 bg-white/30" />
          <span>⭐ <strong>4.9/5</strong> avaliação média</span>
          <span className="hidden sm:block w-px h-4 bg-white/30" />
          <span>⚡ <strong>5 minutos</strong> para criar</span>
          <span className="hidden sm:block w-px h-4 bg-white/30" />
          <span>🔒 <strong>Pagamento</strong> 100% seguro</span>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="personalizar" className="py-14 sm:py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[#E8185A] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">Como funciona</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Do roteiro à estreia em{" "}
              <span className="text-[#E8185A]">4 passos</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {steps.map((s) => (
              <div key={s.n} className="bg-[#181818] border border-white/5 rounded-2xl p-6 hover:border-[#E8185A]/30 transition-all duration-200 hover:-translate-y-1 group">
                <div className="text-[#E8185A]/25 font-black text-4xl sm:text-5xl mb-4 group-hover:text-[#E8185A]/50 transition-colors select-none">{s.n}</div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="modelos" className="py-14 sm:py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[#E8185A] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">Recursos</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Uma produção completa{" "}
              <span className="text-[#E8185A]">para o amor de vocês</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-[#181818] border border-white/5 rounded-2xl p-6 hover:border-[#E8185A]/20 transition-all duration-200">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ── */}
      <section id="exemplo" className="py-14 sm:py-24 bg-[#0d0d0d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ background: "radial-gradient(circle at 50% 50%, #E8185A 0%, transparent 60%)" }} />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative z-10">
          <p className="text-[#E8185A] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">Demo</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Veja como fica antes de criar</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">Experimente a demo interativa completa. Sem cadastro, sem pagamento.</p>
          <a
            href="/demo"
            className="inline-flex items-center gap-3 bg-[#E8185A] hover:bg-[#c9154e] text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02]"
            style={{ boxShadow: "0 0 30px rgba(232,24,90,0.35)" }}
          >
            ▶ Explorar a Demo
          </a>
          <p className="text-gray-600 text-xs mt-4">Não é necessário cadastro.</p>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 sm:py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-[#E8185A] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">Depoimentos</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              O que dizem quem{" "}
              <span className="text-[#E8185A]">já emocionou</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#181818] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                <div className="text-[#E8185A] text-sm mb-3">{"★".repeat(t.stars)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E8185A]/15 border border-[#E8185A]/25 flex items-center justify-center text-xs font-bold text-[#E8185A]">
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="criar" className="py-14 sm:py-24 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <p className="text-[#E8185A] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">Planos</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Escolha o plano <span className="text-[#E8185A]">ideal</span></h2>
          <p className="text-gray-500 text-sm mb-8 sm:mb-12">Pagamento único. Sem mensalidade. Acesso imediato.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
            <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 sm:p-7 text-left">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-4">ECONÔMICO</p>
              <h3 className="text-xl font-black text-white mb-1">7 Dias</h3>
              <p className="text-gray-600 line-through text-sm mb-1">R$ 39,90</p>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-gray-400 text-sm mb-2">R$</span>
                <span className="text-5xl font-black text-white">19</span>
                <span className="text-2xl font-black text-white mb-1">,90</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-gray-400">
                {["Acesso por 7 dias", "Edições ilimitadas", "Fotos e seções ilimitadas"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5"><span className="text-[#E8185A] font-bold">✓</span>{i}</li>
                ))}
              </ul>
              <a href="/criar" className="block w-full border border-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-center">
                Quero meu presente
              </a>
            </div>

            <div className="bg-[#1a0a10] border-2 border-[#E8185A] rounded-2xl p-6 sm:p-7 text-left relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E8185A] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                Mais Popular
              </div>
              <p className="text-[#E8185A] text-[10px] font-bold uppercase tracking-wider mb-4 mt-1">VITALÍCIO</p>
              <h3 className="text-xl font-black text-white mb-1">Para Sempre</h3>
              <p className="text-gray-600 line-through text-sm mb-1">R$ 69,90</p>
              <div className="flex items-end gap-1 mb-5">
                <span className="text-gray-400 text-sm mb-2">R$</span>
                <span className="text-5xl font-black text-[#E8185A]">29</span>
                <span className="text-2xl font-black text-[#E8185A] mb-1">,90</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-gray-400">
                {["Acesso para sempre", "Edições ilimitadas", "Fotos e seções ilimitadas"].map((i) => (
                  <li key={i} className="flex items-center gap-2.5"><span className="text-[#E8185A] font-bold">✓</span>{i}</li>
                ))}
              </ul>
              <a href="/criar" className="block w-full bg-[#E8185A] hover:bg-[#c9154e] text-white font-bold py-3 rounded-xl transition-colors text-sm text-center" style={{ boxShadow: "0 0 20px rgba(232,24,90,0.3)" }}>
                Quero meu presente
              </a>
            </div>
          </div>

          <p className="text-gray-600 text-xs">Pagamento único · Sem assinatura · Acesso imediato · Pix, cartão e boleto</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-14 sm:py-24 bg-[#111]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div>
            <p className="text-[#E8185A] text-[10px] font-extrabold uppercase tracking-[0.22em] mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Dúvidas<br /><span className="text-[#E8185A]">frequentes</span></h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">Se a sua dúvida não estiver aqui, fale com a gente.</p>
            <div className="space-y-3 mb-6">
              {[
                { icon: "📸", label: "Instagram", sub: "@bmmlove_", href: "https://instagram.com/bmmtech_" },
                { icon: "✉️", label: "E-mail", sub: "suporte@bmmtech.com.br", href: "mailto:suporte@bmmtech.com.br" },
                { icon: "📱", label: "WhatsApp", sub: " (21) 98101-2299", href: "https://api.whatsapp.com/send?phone=5521981012299" },
              ].map((c) => (
                <a key={c.label} href={c.href} className="flex items-center justify-between bg-[#181818] border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#E8185A]/10 border border-[#E8185A]/20 rounded-lg flex items-center justify-center">{c.icon}</div>
                    <div>
                      <div className="font-medium text-sm text-white">{c.label}</div>
                      <div className="text-xs text-gray-500">{c.sub}</div>
                    </div>
                  </div>
                  <span className="text-gray-600 group-hover:text-white transition-colors text-xs">→</span>
                </a>
              ))}
            </div>
            <a href="/criar" className="flex items-center justify-center w-full bg-[#E8185A] hover:bg-[#c9154e] text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
              Criar meu presente ↗
            </a>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-7 h-7 bg-[#E8185A] rounded-md flex items-center justify-center font-black text-white text-xs">BL</div>
            <span className="font-bold">BMM Love</span>
          </div>
          <p className="text-gray-600 text-sm mb-5">O presente digital que faz chorar de emoção.</p>
          <div className="flex justify-center gap-6 text-xs text-gray-600 flex-wrap">
            {["Termos de Uso", "Privacidade", "Contato"].map((l) => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-gray-700 text-xs mt-5">© 2025 BMM Love. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}
