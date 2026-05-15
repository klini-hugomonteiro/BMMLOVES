"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ContadorTempo from "../components/ContadorTempo";

type FotoMomento = { id: string; file: File | null; preview: string; legenda: string };

type Momento = {
  id: string;
  titulo: string;
  fotos: FotoMomento[];
};

type Episodio = {
  id: string;
  titulo: string;
  descricao: string;
  videoTipo: "arquivo" | "youtube";
  videoUrl: string;
  videoArquivo: File | null;
  videoNome: string;
  capaPreview: string;
  videoErro: string;
  videoUploading: boolean;
};

type FormData = {
  nome1: string;
  nome2: string;
  tituloFilme: string;
  dataInicio: string;
  horarioInicio: string;
  cidade: string;
  musicaUrl: string;
  fotoCapa: File | null;
  fotoCapaPreview: string;
  episodios: Episodio[];
  momentos: Momento[];
  mensagem: string;
  palavras: string[];
  palavrasForca: string[];
  fotoSobreCasal: string;
  email: string;
  plano: "7dias" | "vitalicio" | "";
};

function novoEpisodio(): Episodio {
  return { id: crypto.randomUUID(), titulo: "", descricao: "", videoTipo: "youtube", videoUrl: "", videoArquivo: null, videoNome: "", capaPreview: "", videoErro: "", videoUploading: false };
}
function novoMomento(): Momento {
  return { id: crypto.randomUUID(), titulo: "", fotos: [] };
}

const STEPS = [
  { num: 1, ep: "EP 1", title: "O Casal",           sub: "Quem são os protagonistas?" },
  { num: 2, ep: "EP 2", title: "A História",         sub: "Quando tudo começou?" },
  { num: 3, ep: "EP 3", title: "Trilha Sonora",      sub: "A música de vocês" },
  { num: 4, ep: "EP 4", title: "Foto de Capa",       sub: "A thumbnail da série" },
  { num: 5, ep: "EP 5", title: "Episódios",          sub: "Os momentos de vocês em vídeo" },
  { num: 6, ep: "EP 6", title: "Nossos Momentos",    sub: "Álbuns de fotos por tema" },
  { num: 7, ep: "EP 7", title: "Mensagem Especial",  sub: "O que você quer dizer?" },
  { num: 8, ep: "EP 8", title: "Jogo de Palavras",   sub: "8 palavras sobre vocês" },
  { num: 9, ep: "EP 9", title: "Finalizar",          sub: "Para onde enviamos o link?" },
];

const WORD_PLACEHOLDERS = ["amor", "feliz", "viagem", "risos", "sorte", "juntos", "sempre", "você"];

const MUSICAS_RECOMENDADAS = [
  { titulo: "Perfect",                  artista: "Ed Sheeran" },
  { titulo: "All of Me",                artista: "John Legend" },
  { titulo: "Thinking Out Loud",        artista: "Ed Sheeran" },
  { titulo: "A Thousand Years",         artista: "Christina Perri" },
  { titulo: "Can't Help Falling in Love", artista: "Elvis Presley" },
  { titulo: "Make You Feel My Love",    artista: "Adele" },
  { titulo: "Eu Te Amo Tanto",          artista: "Zé Neto & Cristiano" },
  { titulo: "Evidências",               artista: "Chitãozinho & Xororó" },
  { titulo: "Tudo Pra Mim",             artista: "Henrique & Juliano" },
  { titulo: "Por Você",                 artista: "Luan Santana" },
  { titulo: "Photograph",               artista: "Ed Sheeran" },
  { titulo: "Die With A Smile",         artista: "Lady Gaga & Bruno Mars" },
];

const CIDADES_BR = [
  "Acre, AC","Rio Branco, AC","Cruzeiro do Sul, AC","Sena Madureira, AC",
  "Maceió, AL","Arapiraca, AL","Palmeira dos Índios, AL","União dos Palmares, AL",
  "Macapá, AP","Santana, AP","Laranjal do Jari, AP",
  "Manaus, AM","Parintins, AM","Itacoatiara, AM","Manacapuru, AM","Tefé, AM",
  "Salvador, BA","Feira de Santana, BA","Vitória da Conquista, BA","Camaçari, BA","Juazeiro, BA","Ilhéus, BA","Barreiras, BA","Lauro de Freitas, BA",
  "Fortaleza, CE","Caucaia, CE","Juazeiro do Norte, CE","Maracanaú, CE","Sobral, CE","Crato, CE","Itapipoca, CE",
  "Brasília, DF",
  "Vitória, ES","Serra, ES","Vila Velha, ES","Cariacica, ES","Cachoeiro de Itapemirim, ES","Linhares, ES",
  "Goiânia, GO","Aparecida de Goiânia, GO","Anápolis, GO","Rio Verde, GO","Luziânia, GO","Águas Lindas de Goiás, GO",
  "São Luís, MA","Imperatriz, MA","São José de Ribamar, MA","Timon, MA","Caxias, MA","Codó, MA",
  "Cuiabá, MT","Várzea Grande, MT","Rondonópolis, MT","Sinop, MT","Tangará da Serra, MT",
  "Campo Grande, MS","Dourados, MS","Três Lagoas, MS","Corumbá, MS","Grande Dourados, MS",
  "Belo Horizonte, MG","Uberlândia, MG","Contagem, MG","Juiz de Fora, MG","Betim, MG","Montes Claros, MG","Ribeirão das Neves, MG","Uberaba, MG","Governador Valadares, MG","Ipatinga, MG","Sete Lagoas, MG","Divinópolis, MG",
  "Belém, PA","Ananindeua, PA","Santarém, PA","Marabá, PA","Castanhal, PA","Parauapebas, PA",
  "João Pessoa, PB","Campina Grande, PB","Santa Rita, PB","Patos, PB","Bayeux, PB",
  "Curitiba, PR","Londrina, PR","Maringá, PR","Ponta Grossa, PR","Cascavel, PR","São José dos Pinhais, PR","Foz do Iguaçu, PR","Colombo, PR","Guarapuava, PR","Paranaguá, PR",
  "Recife, PE","Caruaru, PE","Olinda, PE","Petrolina, PE","Paulista, PE","Jaboatão dos Guararapes, PE","Camarajibe, PE",
  "Teresina, PI","Parnaíba, PI","Picos, PI","Floriano, PI",
  "Rio de Janeiro, RJ","São Gonçalo, RJ","Duque de Caxias, RJ","Nova Iguaçu, RJ","Niterói, RJ","Campos dos Goytacazes, RJ","Belford Roxo, RJ","São João de Meriti, RJ","Macaé, RJ","Volta Redonda, RJ","Petrópolis, RJ","Angra dos Reis, RJ",
  "Natal, RN","Mossoró, RN","Parnamirim, RN","São Gonçalo do Amarante, RN","Caicó, RN",
  "Porto Alegre, RS","Caxias do Sul, RS","Pelotas, RS","Canoas, RS","Santa Maria, RS","Gravataí, RS","Viamão, RS","Novo Hamburgo, RS","São Leopoldo, RS","Rio Grande, RS","Alvorada, RS","Passo Fundo, RS",
  "Porto Velho, RO","Ji-Paraná, RO","Ariquemes, RO","Vilhena, RO",
  "Boa Vista, RR","Caracaraí, RR",
  "Florianópolis, SC","Joinville, SC","Blumenau, SC","São José, SC","Criciúma, SC","Chapecó, SC","Itajaí, SC","Lages, SC","Jaraguá do Sul, SC","Palhoça, SC",
  "São Paulo, SP","Guarulhos, SP","Campinas, SP","São Bernardo do Campo, SP","Santo André, SP","São José dos Campos, SP","Osasco, SP","Ribeirão Preto, SP","Sorocaba, SP","Mauá, SP","São José do Rio Preto, SP","Santos, SP","Mogi das Cruzes, SP","Diadema, SP","Jundiaí, SP","Piracicaba, SP","Barueri, SP","Carapicuíba, SP","São Vicente, SP","Guarujá, SP","Franca, SP","Praia Grande, SP","Limeira, SP","Bauru, SP","Americana, SP","Marília, SP","Presidente Prudente, SP","Itaquaquecetuba, SP","Cotia, SP","Araraquara, SP","Taboão da Serra, SP",
  "Aracaju, SE","Feira Nova, SE","Lagarto, SE","Itabaiana, SE",
  "Palmas, TO","Araguaína, TO","Gurupi, TO","Porto Nacional, TO",
];

const inp = "w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#E8185A] transition-colors text-sm";
const lbl = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2";

function CriarPageInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditing = !!editId;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitErro, setSubmitErro] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(isEditing);
  const [draftRestaurado, setDraftRestaurado] = useState(false);
  const [pagamentoPendente, setPagamentoPendente] = useState<string | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState<FormData>({
    nome1: "",
    nome2: "",
    tituloFilme: "",
    dataInicio: "",
    horarioInicio: "",
    cidade: "",
    musicaUrl: "",
    fotoCapa: null,
    fotoCapaPreview: "",
    episodios: [novoEpisodio()],
    momentos: [novoMomento()],
    mensagem: "",
    palavras: Array(8).fill(""),
    palavrasForca: Array(5).fill(""),
    fotoSobreCasal: "",
    email: "",
    plano: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Carrega dados existentes quando está editando
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/editar/${editId}`)
      .then(r => r.json())
      .then(({ data: d }) => {
        if (!d) return;
        setData(prev => ({
          ...prev,
          nome1: d.nome1 || "",
          nome2: d.nome2 || "",
          tituloFilme: d.tituloFilme || "",
          dataInicio: d.dataInicio || "",
          horarioInicio: d.horarioInicio || "",
          cidade: d.cidade || "",
          musicaUrl: d.musicaUrl || "",
          fotoCapaPreview: d.fotoCapaPreview || "",
          fotoCapa: null,
          fotoSobreCasal: d.fotoSobreCasal || "",
          mensagem: d.mensagem || "",
          palavras: d.palavras?.length ? [...d.palavras, ...Array(8).fill("")].slice(0, 8) : prev.palavras,
          palavrasForca: d.palavrasForca?.length ? [...d.palavrasForca, ...Array(5).fill("")].slice(0, 5) : prev.palavrasForca,
          email: d.email || "",
          plano: d.plano || prev.plano,
          episodios: d.episodios?.length ? d.episodios.map((ep: Record<string, string>) => ({
            id: ep.id,
            titulo: ep.titulo || "",
            descricao: ep.descricao || "",
            videoTipo: ep.videoTipo || "youtube",
            videoUrl: ep.videoUrl || "",
            videoArquivo: null,
            videoNome: ep.videoNome || "",
            capaPreview: ep.capaPreview || "",
            videoErro: "",
            videoUploading: false,
          })) : prev.episodios,
          momentos: d.momentos?.length ? d.momentos.map((m: Record<string, unknown>) => ({
            id: m.id,
            titulo: m.titulo || "",
            fotos: ((m.fotos as Record<string, string>[]) || []).map((f) => ({
              id: f.id,
              file: null,
              preview: f.preview || "",
              legenda: f.legenda || "",
            })),
          })) : prev.momentos,
        }));
        setLoadingEdit(false);
      })
      .catch(() => setLoadingEdit(false));
  }, [editId]);

  // Restaura rascunho do localStorage ao entrar (só para criação nova)
  useEffect(() => {
    if (isEditing) return;

    const pendingId = localStorage.getItem("bmm_payment_pending");
    if (pendingId) {
      fetch(`/api/checkout/${pendingId}`)
        .then(r => r.json())
        .then(d => { if (!d.error) setPagamentoPendente(pendingId); })
        .catch(() => {});
    }

    try {
      const saved = localStorage.getItem("bmm_draft");
      if (!saved) return;
      const draft = JSON.parse(saved);
      setData(prev => ({
        ...prev,
        ...draft,
        fotoCapa: null,
        episodios: (draft.episodios || [prev.episodios[0]]).map((ep: Episodio) => ({
          ...ep,
          videoArquivo: null,
          videoErro: "",
          videoUploading: false,
        })),
        momentos: (draft.momentos || [prev.momentos[0]]).map((m: Momento) => ({
          ...m,
          fotos: (m.fotos || []).map((f: FotoMomento) => ({ ...f, file: null })),
        })),
      }));
      setDraftRestaurado(true);
      setTimeout(() => setDraftRestaurado(false), 3000);
    } catch { /* ignora */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salva rascunho no localStorage a cada mudança
  useEffect(() => {
    if (isEditing) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try {
        const draft = {
          ...data,
          fotoCapa: null,
          episodios: data.episodios.map(ep => ({ ...ep, videoArquivo: null, videoUploading: false })),
          momentos: data.momentos.map(m => ({ ...m, fotos: m.fotos.map(f => ({ ...f, file: null })) })),
        };
        localStorage.setItem("bmm_draft", JSON.stringify(draft));
      } catch { /* ignora quota exceeded */ }
    }, 1000);
  }, [data, isEditing]);

  // cidade autocomplete
  const [cidadeSugestoes, setCidadeSugestoes] = useState<string[]>([]);
  const [cidadeFocus, setCidadeFocus] = useState(false);

  // música search
  type MusicaResult = { nome: string; artista: string; capa: string };
  const [musicaResultados, setMusicaResultados] = useState<MusicaResult[]>([]);
  const [musicaLoading, setMusicaLoading] = useState(false);
  const [musicaFocus, setMusicaFocus] = useState(false);
  const musicaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscarMusica = async (query: string) => {
    if (!query.trim() || query.includes("spotify") || query.includes("youtu")) {
      setMusicaResultados([]);
      return;
    }
    setMusicaLoading(true);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=6&country=BR`
      );
      const json = await res.json();
      setMusicaResultados(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        json.results.map((r: any) => ({
          nome: r.trackName,
          artista: r.artistName,
          capa: r.artworkUrl60,
        }))
      );
    } catch {
      setMusicaResultados([]);
    } finally {
      setMusicaLoading(false);
    }
  };

  const handleMusicaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setData(prev => ({ ...prev, musicaUrl: val }));
    if (musicaTimer.current) clearTimeout(musicaTimer.current);
    musicaTimer.current = setTimeout(() => buscarMusica(val), 400);
  };

  const handleCidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setData(prev => ({ ...prev, cidade: val }));
    if (val.length >= 2) {
      setCidadeSugestoes(
        CIDADES_BR.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
      );
    } else {
      setCidadeSugestoes([]);
    }
  };

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData(prev => ({ ...prev, [field]: e.target.value }));

  const setWord = (i: number, val: string) =>
    setData(prev => {
      const palavras = [...prev.palavras];
      palavras[i] = val;
      return { ...prev, palavras };
    });

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e =>
      setData(prev => ({ ...prev, fotoCapaPreview: e.target?.result as string, fotoCapa: file }));
    reader.readAsDataURL(file);
  };

  const setEpisodio = (id: string, field: keyof Episodio, value: string | File | null | boolean) =>
    setData(prev => ({
      ...prev,
      episodios: prev.episodios.map(ep => ep.id === id ? { ...ep, [field]: value } : ep),
    }));

  const addEpisodio = () =>
    setData(prev => ({ ...prev, episodios: [...prev.episodios, novoEpisodio()] }));

  const removeEpisodio = (id: string) =>
    setData(prev => ({ ...prev, episodios: prev.episodios.filter(ep => ep.id !== id) }));

  const handleVideoArquivo = (id: string, file: File) => {
    const MAX_MB = 60 * 1024 * 1024;
    if (file.size > MAX_MB) {
      setEpisodio(id, "videoErro", "Arquivo muito grande. Máximo 60 MB.");
      return;
    }
    const objUrl = URL.createObjectURL(file);
    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.onloadedmetadata = async () => {
      URL.revokeObjectURL(objUrl);
      if (vid.duration > 60) {
        setEpisodio(id, "videoErro", "Vídeo muito longo. Máximo 60 segundos.");
        return;
      }
      setEpisodio(id, "videoErro", "");
      setEpisodio(id, "videoUploading", true);
      setEpisodio(id, "videoNome", file.name);
      try {
        const res = await fetch("/api/r2-upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, contentType: file.type || "video/mp4" }),
        });
        const { uploadUrl, publicUrl } = await res.json();
        await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "video/mp4" } });
        setEpisodio(id, "videoUrl", publicUrl);
        setEpisodio(id, "videoTipo", "arquivo");
      } catch {
        setEpisodio(id, "videoErro", "Erro ao enviar vídeo. Tente novamente.");
        setEpisodio(id, "videoNome", "");
      } finally {
        setEpisodio(id, "videoUploading", false);
      }
    };
    vid.src = objUrl;
  };

  const setMomentoTitulo = (id: string, titulo: string) =>
    setData(prev => ({
      ...prev,
      momentos: prev.momentos.map(m => m.id === id ? { ...m, titulo } : m),
    }));

  const addMomento = () =>
    setData(prev => ({ ...prev, momentos: [...prev.momentos, novoMomento()] }));

  const removeMomento = (id: string) =>
    setData(prev => ({ ...prev, momentos: prev.momentos.filter(m => m.id !== id) }));

  const addFotosMomento = (id: string, files: FileList) => {
    const novos: FotoMomento[] = [];
    let loaded = 0;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        novos.push({ id: crypto.randomUUID(), file, preview: e.target?.result as string, legenda: "" });
        loaded++;
        if (loaded === files.length) {
          setData(prev => ({
            ...prev,
            momentos: prev.momentos.map(m =>
              m.id === id ? { ...m, fotos: [...m.fotos, ...novos] } : m
            ),
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFotoMomento = (momentoId: string, fotoId: string) =>
    setData(prev => ({
      ...prev,
      momentos: prev.momentos.map(m =>
        m.id === momentoId ? { ...m, fotos: m.fotos.filter(f => f.id !== fotoId) } : m
      ),
    }));

  const setLegendaFoto = (momentoId: string, fotoId: string, legenda: string) =>
    setData(prev => ({
      ...prev,
      momentos: prev.momentos.map(m =>
        m.id === momentoId
          ? { ...m, fotos: m.fotos.map(f => f.id === fotoId ? { ...f, legenda } : f) }
          : m
      ),
    }));

  const canNext = (): boolean => {
    switch (step) {
      case 1: return !!data.nome1.trim() && !!data.nome2.trim() && !!data.tituloFilme.trim();
      case 2: return !!data.dataInicio;
      case 3: return !!data.musicaUrl.trim();
      case 4: return !!data.fotoCapa || !!data.fotoCapaPreview;
      case 5: return data.episodios.length > 0 && data.episodios.every(ep =>
        ep.titulo.trim() && !ep.videoUploading && (ep.videoTipo === "arquivo" ? !!ep.videoUrl.trim() : !!ep.videoUrl.trim())
      );
      case 6: return data.momentos.length > 0 && data.momentos.every(m => m.titulo.trim() && m.fotos.length > 0);
      case 7: return data.mensagem.trim().length > 0;
      case 8: return data.palavras.every(p => p.trim().length > 0) && data.palavrasForca.every(p => p.trim().length > 0);
      case 9: return /\S+@\S+\.\S+/.test(data.email) && (isEditing || !!data.plano);
      default: return true;
    }
  };

  const musicSource = data.musicaUrl.includes("spotify")
    ? "spotify"
    : data.musicaUrl.includes("youtu")
    ? "youtube"
    : null;

  const cur = STEPS[step - 1];

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Carregando sua página...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="font-black text-lg tracking-tight">
          <span className="text-[#E8185A]">BMM</span>LOVE
        </Link>
        <span className="text-gray-600 text-xs tracking-wide">Criando sua série</span>
      </header>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6 py-8">
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {STEPS.map(s => (
            <div key={s.num} className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#E8185A] transition-all duration-500"
                style={{ width: step > s.num ? "100%" : step === s.num ? "60%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Aviso de rascunho restaurado */}
        {draftRestaurado && (
          <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-green-400 text-xs">✓ Rascunho restaurado — continue de onde parou</span>
          </div>
        )}

        {/* Aviso de pagamento pendente */}
        {pagamentoPendente && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-yellow-300 text-xs">Você tem um pagamento em aberto.</span>
            <button
              onClick={() => router.push(`/pagamento/${pagamentoPendente}`)}
              className="text-xs font-bold text-yellow-300 underline underline-offset-2 flex-shrink-0"
            >
              Retomar pagamento →
            </button>
          </div>
        )}

        {/* Step header */}
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="bg-[#E8185A] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
              {cur.ep}
            </span>
            <span className="text-gray-600 text-xs">{step} de {STEPS.length}</span>
          </div>
          <h1 className="text-2xl font-black">{cur.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{cur.sub}</p>
        </div>

        {/* Step content */}
        <div className="flex-1">

          {/* ── STEP 1: O Casal ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Seu nome</label>
                  <input
                    className={inp}
                    placeholder="ex: Hugo"
                    value={data.nome1}
                    onChange={set("nome1")}
                    autoFocus
                  />
                </div>
                <div>
                  <label className={lbl}>Nome da pessoa</label>
                  <input
                    className={inp}
                    placeholder="ex: Ana"
                    value={data.nome2}
                    onChange={set("nome2")}
                  />
                </div>
              </div>
              <div>
                <label className={lbl}>Título da série</label>
                <input
                  className={inp}
                  placeholder="ex: Uma história de amor"
                  value={data.tituloFilme}
                  onChange={set("tituloFilme")}
                />
                <p className="text-gray-600 text-xs mt-1.5">Esse é o nome da série de vocês na Netflix</p>
              </div>

              {/* Preview card */}
              {(data.nome1 || data.nome2 || data.tituloFilme) && (
                <div className="mt-2 bg-[#181818] rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Preview</p>
                  <p className="text-[#E8185A] text-xs font-bold uppercase tracking-widest">Série Original BMM Love</p>
                  <p className="text-white font-black text-lg leading-tight mt-0.5">
                    {data.tituloFilme || "Título da série"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {[data.nome1, data.nome2].filter(Boolean).join(" & ") || "Casal"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: A História ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className={lbl}>Data que começaram</label>
                <input
                  type="date"
                  className={inp + " [color-scheme:dark]"}
                  value={data.dataInicio}
                  onChange={set("dataInicio")}
                />
              </div>
              <div>
                <label className={lbl}>
                  Horário{" "}
                  <span className="text-gray-600 normal-case tracking-normal font-normal">(opcional)</span>
                </label>
                <input
                  type="time"
                  className={inp + " [color-scheme:dark]"}
                  value={data.horarioInicio}
                  onChange={set("horarioInicio")}
                />
              </div>
              <div className="relative">
                <label className={lbl}>
                  Cidade{" "}
                  <span className="text-gray-600 normal-case tracking-normal font-normal">(opcional)</span>
                </label>
                <input
                  className={inp}
                  placeholder="ex: São Paulo"
                  value={data.cidade}
                  onChange={handleCidadeChange}
                  onFocus={() => setCidadeFocus(true)}
                  onBlur={() => setTimeout(() => setCidadeFocus(false), 150)}
                  autoComplete="off"
                />
                {cidadeFocus && cidadeSugestoes.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[#242424] border border-white/10 rounded-lg overflow-hidden shadow-xl">
                    {cidadeSugestoes.map((cidade, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => {
                          setData(prev => ({ ...prev, cidade }));
                          setCidadeSugestoes([]);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>{cidade.split(", ")[0]}</span>
                        <span className="text-[#E8185A] text-xs font-bold">{cidade.split(", ")[1]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Foto "Sobre o casal" */}
              <div>
                <label className={lbl}>
                  Foto do casal{" "}
                  <span className="text-gray-600 normal-case tracking-normal font-normal">(para o card "Sobre o casal")</span>
                </label>
                {data.fotoSobreCasal ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height: 140 }}>
                    <img src={data.fotoSobreCasal} alt="Foto do casal" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setData(prev => ({ ...prev, fotoSobreCasal: "" }))}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-[#E8185A]/40 hover:bg-[#E8185A]/5 transition-all py-8">
                    <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.25V19.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25" />
                    </svg>
                    <span className="text-gray-500 text-sm">Clique para escolher uma foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setData(prev => ({ ...prev, fotoSobreCasal: ev.target?.result as string }));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {data.dataInicio && (
                <ContadorTempo
                  dataInicio={data.dataInicio}
                  horarioInicio={data.horarioInicio || undefined}
                  nome1={data.nome1 || undefined}
                  nome2={data.nome2 || undefined}
                  foto={data.fotoSobreCasal || undefined}
                />
              )}
            </div>
          )}

          {/* ── STEP 3: Trilha Sonora ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="relative">
                <label className={lbl}>Nome da música ou link</label>
                <div className="relative">
                  <input
                    className={inp + " pr-10"}
                    placeholder="ex: Perfect, Evidências, All of Me..."
                    value={data.musicaUrl}
                    onChange={handleMusicaChange}
                    onFocus={() => setMusicaFocus(true)}
                    onBlur={() => setTimeout(() => setMusicaFocus(false), 300)}
                    autoFocus
                    autoComplete="off"
                  />
                  {musicaLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Dropdown resultados */}
                {musicaFocus && musicaResultados.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-[#242424] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                    {musicaResultados.map((m, i) => (
                      <button
                        key={i}
                        type="button"
                        onPointerDown={() => {
                          setData(prev => ({ ...prev, musicaUrl: `${m.nome} — ${m.artista}` }));
                          setMusicaResultados([]);
                          setMusicaFocus(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      >
                        {m.capa && (
                          <img src={m.capa} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{m.nome}</p>
                          <p className="text-gray-500 text-xs truncate">{m.artista}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {musicSource === "spotify" && (
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Spotify detectado
                  </p>
                )}
                {musicSource === "youtube" && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube detectado
                  </p>
                )}
              </div>

              {/* Recomendações */}
              <div>
                <p className={lbl}>Recomendações</p>
                <div className="grid grid-cols-2 gap-2">
                  {MUSICAS_RECOMENDADAS.map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setData(prev => ({ ...prev, musicaUrl: `${m.titulo} — ${m.artista}` }))}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-all text-xs ${
                        data.musicaUrl === `${m.titulo} — ${m.artista}`
                          ? "border-[#E8185A] bg-[#E8185A]/10 text-white"
                          : "border-white/8 bg-[#1a1a1a] text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <p className="font-semibold truncate">{m.titulo}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{m.artista}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dica link */}
              <div className="bg-[#181818] rounded-xl px-4 py-3 border border-white/5">
                <p className="text-gray-500 text-xs leading-relaxed">
                  💡 Pode escrever o nome da música <span className="text-gray-300">ou colar um link</span> do Spotify / YouTube
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Foto de Capa ── */}
          {step === 4 && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {!data.fotoCapaPreview ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-[#E8185A]/40 hover:bg-white/[0.02] transition-all group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#E8185A]/10 transition-colors">
                    <svg className="w-7 h-7 text-gray-500 group-hover:text-[#E8185A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                      Clique ou arraste a foto
                    </p>
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG ou WEBP · Até 10MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden aspect-video">
                  <img src={data.fotoCapaPreview} alt="Capa" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <button
                    onClick={() => {
                      setData(p => ({ ...p, fotoCapa: null, fotoCapaPreview: "" }));
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs transition-colors"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-[#E8185A] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#c91450] transition-colors"
                  >
                    Trocar foto
                  </button>
                  <p className="absolute bottom-3 left-3 text-white/60 text-xs">
                    {data.fotoCapa?.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 5: Episódios ── */}
          {step === 5 && (
            <div className="space-y-3">
              {data.episodios.map((ep, idx) => (
                <EpisodioCard
                  key={ep.id}
                  ep={ep}
                  idx={idx}
                  total={data.episodios.length}
                  onChange={(field, val) => setEpisodio(ep.id, field, val)}
                  onVideoArquivo={(file) => handleVideoArquivo(ep.id, file)}
                  onCapaChange={(preview) => setEpisodio(ep.id, "capaPreview", preview)}
                  onRemove={() => removeEpisodio(ep.id)}
                  inp={inp}
                  lbl={lbl}
                />
              ))}

              {data.episodios.length < 5 && (
                <button
                  type="button"
                  onClick={addEpisodio}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-500 text-sm hover:border-[#E8185A]/40 hover:text-[#E8185A] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span> Adicionar episódio
                </button>
              )}
              {data.episodios.length >= 5 && (
                <p className="text-center text-gray-600 text-xs py-2">Limite de 5 episódios atingido</p>
              )}
            </div>
          )}

          {/* ── STEP 6: Nossos Momentos ── */}
          {step === 6 && (
            <div className="space-y-3">
              {data.momentos.map((m, idx) => (
                <MomentoCard
                  key={m.id}
                  momento={m}
                  idx={idx}
                  total={data.momentos.length}
                  onTituloChange={t => setMomentoTitulo(m.id, t)}
                  onAddFotos={files => addFotosMomento(m.id, files)}
                  onRemoveFoto={fotoId => removeFotoMomento(m.id, fotoId)}
                  onLegenda={(fotoId, leg) => setLegendaFoto(m.id, fotoId, leg)}
                  onRemove={() => removeMomento(m.id)}
                  inp={inp}
                  lbl={lbl}
                />
              ))}
              {data.momentos.length < 5 && (
                <button
                  type="button"
                  onClick={addMomento}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-500 text-sm hover:border-[#E8185A]/40 hover:text-[#E8185A] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-lg leading-none">+</span> Adicionar álbum
                </button>
              )}
              {data.momentos.length >= 5 && (
                <p className="text-center text-gray-600 text-xs py-2">Limite de 5 álbuns atingido</p>
              )}
            </div>
          )}

          {/* ── STEP 7: Mensagem Especial ── */}
          {step === 7 && (
            <div>
              <label className={lbl}>Sua mensagem</label>
              <textarea
                className={inp + " min-h-[200px] resize-none leading-relaxed"}
                placeholder="Escreva uma mensagem especial para essa pessoa... o que você sente, o que viveram juntos, o que ela significa pra você."
                value={data.mensagem}
                onChange={set("mensagem")}
                maxLength={500}
                autoFocus
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-gray-600 text-xs">Seja honesto(a), isso vai aparecer na página ❤️</p>
                <p className={`text-xs ${data.mensagem.length > 450 ? "text-yellow-500" : "text-gray-600"}`}>
                  {data.mensagem.length}/500
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 8: Jogo de Palavras ── */}
          {step === 8 && (
            <div className="space-y-6">

              {/* Caça-palavras */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Caça-Palavras</p>
                    <p className="text-gray-500 text-xs">8 palavras que descrevem vocês dois</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const pool = ["amor","saudade","beijo","abraço","feliz","risos","sonhos","viagem","juntos","sempre","sorte","café","cinema","música","dança","olhos","mãos","lar","paz","vida","festa","praia","estrela","coração","eterno","doce","luz","alma","força","sorte"];
                      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
                      setData(prev => ({ ...prev, palavras: shuffled }));
                    }}
                    className="flex items-center gap-1.5 text-[#E8185A] text-xs font-bold hover:text-white transition-colors border border-[#E8185A]/30 hover:border-[#E8185A] px-3 py-1.5 rounded-lg"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Aleatório
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {data.palavras.map((w, i) => (
                    <div key={i} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E8185A] text-xs font-black w-4 text-center">
                        {i + 1}
                      </span>
                      <input
                        className={inp + " pl-8"}
                        placeholder={WORD_PLACEHOLDERS[i]}
                        value={w}
                        onChange={e => setWord(i, e.target.value)}
                        maxLength={20}
                      />
                    </div>
                  ))}
                </div>
                {data.palavras.every(p => p.trim()) && (
                  <p className="text-green-400 text-xs">✓ Todas preenchidas!</p>
                )}
              </div>

              <div className="border-t border-white/5" />

              {/* Forca */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Forca</p>
                    <p className="text-gray-500 text-xs">5 momentos ou palavras para adivinhar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const pool = ["Nossa primeira viagem","Dia que se conheceram","Lugar favorito","Primeiro beijo","Música do casal","Filme favorito","Comida preferida","Apelido especial","Melhor memória","Onde se conheceram","Data especial","Sonho do casal"];
                      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
                      setData(prev => ({ ...prev, palavrasForca: shuffled }));
                    }}
                    className="flex items-center gap-1.5 text-[#E8185A] text-xs font-bold hover:text-white transition-colors border border-[#E8185A]/30 hover:border-[#E8185A] px-3 py-1.5 rounded-lg"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Aleatório
                  </button>
                </div>
                <div className="space-y-2">
                  {data.palavrasForca.map((w, i) => (
                    <div key={i} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E8185A] text-xs font-black w-4 text-center">
                        {i + 1}
                      </span>
                      <input
                        className={inp + " pl-8"}
                        placeholder={["Nossa primeira viagem", "Dia que se conheceram", "Lugar favorito", "Nome do pet", "Apelido especial"][i]}
                        value={w}
                        onChange={e => setData(prev => {
                          const pf = [...prev.palavrasForca];
                          pf[i] = e.target.value;
                          return { ...prev, palavrasForca: pf };
                        })}
                        maxLength={30}
                      />
                    </div>
                  ))}
                </div>
                {data.palavrasForca.every(p => p.trim()) && (
                  <p className="text-green-400 text-xs">✓ Todas preenchidas!</p>
                )}
              </div>

            </div>
          )}

          {/* ── STEP 9: Finalizar ── */}
          {step === 9 && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm leading-relaxed">
                {isEditing
                  ? "Revise as informações e salve as alterações da sua página."
                  : "Escolha o plano e informe seu e-mail para receber o link da página."}
              </p>

              {/* Plano — só aparece para quem ainda não comprou */}
              {!isEditing && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Escolha o plano <span className="text-[#E8185A]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setData(p => ({ ...p, plano: "7dias" }))}
                      className={`relative rounded-xl p-4 text-left border-2 transition-all ${data.plano === "7dias" ? "border-[#E8185A] bg-[#E8185A]/10" : "border-white/10 bg-[#1a1a1a] hover:border-white/20"}`}
                    >
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">7 Dias</p>
                      <div className="flex items-end gap-0.5 mb-1">
                        <span className="text-white font-black text-2xl">R$ 19</span>
                        <span className="text-white font-black text-sm mb-0.5">,90</span>
                      </div>
                      <p className="text-gray-500 text-xs line-through mb-2">R$ 39,90</p>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li className="flex items-center gap-1.5"><span className="text-[#E8185A]">✓</span>Acesso por 7 dias</li>
                        <li className="flex items-center gap-1.5"><span className="text-[#E8185A]">✓</span>Edições ilimitadas</li>
                      </ul>
                      {data.plano === "7dias" && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E8185A] flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>}
                    </button>

                    <button
                      type="button"
                      onClick={() => setData(p => ({ ...p, plano: "vitalicio" }))}
                      className={`relative rounded-xl p-4 text-left border-2 transition-all ${data.plano === "vitalicio" ? "border-[#E8185A] bg-[#E8185A]/10" : "border-white/10 bg-[#1a1a1a] hover:border-white/20"}`}
                    >
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#E8185A] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                        Popular
                      </div>
                      <p className="text-[#E8185A] text-[10px] font-bold uppercase tracking-wider mb-2">Vitalício</p>
                      <div className="flex items-end gap-0.5 mb-1">
                        <span className="text-[#E8185A] font-black text-2xl">R$ 29</span>
                        <span className="text-[#E8185A] font-black text-sm mb-0.5">,90</span>
                      </div>
                      <p className="text-gray-500 text-xs line-through mb-2">R$ 69,90</p>
                      <ul className="space-y-1 text-xs text-gray-400">
                        <li className="flex items-center gap-1.5"><span className="text-[#E8185A]">✓</span>Acesso para sempre</li>
                        <li className="flex items-center gap-1.5"><span className="text-[#E8185A]">✓</span>Edições ilimitadas</li>
                      </ul>
                      {data.plano === "vitalicio" && <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#E8185A] flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg></div>}
                    </button>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  E-mail <span className="text-[#E8185A]">*</span>
                </label>
                <input
                  type="email"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8185A]/50 transition-colors"
                  placeholder="seu@email.com"
                  value={data.email}
                  onChange={e => setData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>


              {/* Preview resumo */}
              <div className="bg-[#111] border border-white/5 rounded-xl p-4 space-y-2">
                <p className="text-[#E8185A] text-[10px] font-black uppercase tracking-widest mb-3">Resumo da página</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Casal</span>
                  <span className="text-white font-bold">{data.nome1} & {data.nome2}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Título</span>
                  <span className="text-white font-bold">{data.tituloFilme}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Episódios</span>
                  <span className="text-white font-bold">{data.episodios.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Álbuns de fotos</span>
                  <span className="text-white font-bold">{data.momentos.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 text-sm transition-colors"
            >
              ← Voltar
            </button>
          )}

          {step < STEPS.length ? (
            <button
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-3 rounded-lg bg-[#E8185A] text-white font-bold text-sm hover:bg-[#c91450] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continuar →
            </button>
          ) : (
            <>
            <button
              disabled={!canNext() || submitting}
              onClick={async () => {
                setSubmitting(true);
                setSubmitErro("");
                try {
                  const fd = new FormData();
                  const payload = {
                    nome1: data.nome1,
                    nome2: data.nome2,
                    tituloFilme: data.tituloFilme,
                    dataInicio: data.dataInicio,
                    horarioInicio: data.horarioInicio,
                    cidade: data.cidade,
                    musicaUrl: data.musicaUrl,
                    fotoCapaPreview: data.fotoCapaPreview,
                    fotoSobreCasal: data.fotoSobreCasal,
                    mensagem: data.mensagem,
                    palavras: data.palavras.filter(p => p.trim()),
                    palavrasForca: data.palavrasForca.filter(p => p.trim()),
                    plano: data.plano,
                    email: data.email,
                    episodios: data.episodios.map(ep => ({
                      id: ep.id,
                      titulo: ep.titulo,
                      descricao: ep.descricao,
                      videoTipo: ep.videoTipo,
                      videoUrl: ep.videoUrl,
                      videoNome: ep.videoNome,
                      capaPreview: ep.capaPreview,
                    })),
                    momentos: data.momentos.map(m => ({
                      id: m.id,
                      titulo: m.titulo,
                      fotos: m.fotos.map(f => ({ id: f.id, preview: f.preview, legenda: f.legenda })),
                    })),
                  };
                  fd.append("data", JSON.stringify(payload));
                  for (const ep of data.episodios) {
                    if (ep.videoTipo === "arquivo" && ep.videoArquivo) {
                      fd.append(`video_${ep.id}`, ep.videoArquivo, ep.videoNome || "video.mp4");
                    }
                  }

                  const controller = new AbortController();
                  const timeout = setTimeout(() => controller.abort(), 120_000);
                  try {
                    if (isEditing) {
                      const res = await fetch(`/api/editar/${editId}`, { method: "POST", body: fd, signal: controller.signal });
                      if (!res.ok) throw new Error("Erro ao salvar alterações");
                      router.push(`/minha-pagina/${editId}?saved=1`);
                    } else {
                      const res = await fetch("/api/checkout", { method: "POST", body: fd, signal: controller.signal });
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body?.error || "Erro ao iniciar pagamento. Verifique sua conexão e tente novamente.");
                      }
                      const { tempId } = await res.json();
                      localStorage.removeItem("bmm_draft");
                      router.push(`/pagamento/${tempId}`);
                    }
                  } finally {
                    clearTimeout(timeout);
                  }
                } catch (err) {
                  setSubmitting(false);
                  setSubmitErro(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
                }
              }}
              className="flex-1 py-3 rounded-lg bg-[#E8185A] text-white font-bold text-sm hover:bg-[#c91450] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
              ) : isEditing ? "Salvar alterações ❤️" : "Ir para pagamento ❤️"}
            </button>
            {submitErro && (
              <p className="text-red-400 text-xs text-center mt-2">{submitErro}</p>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MomentoCard({
  momento, idx, total, onTituloChange, onAddFotos, onRemoveFoto, onLegenda, onRemove, inp, lbl,
}: {
  momento: Momento;
  idx: number;
  total: number;
  onTituloChange: (t: string) => void;
  onAddFotos: (files: FileList) => void;
  onRemoveFoto: (fotoId: string) => void;
  onLegenda: (fotoId: string, leg: string) => void;
  onRemove: () => void;
  inp: string;
  lbl: string;
}) {
  const [open, setOpen] = useState(idx === 0);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-[#181818] rounded-xl border border-white/8 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-[#E8185A]/15 text-[#E8185A] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            #{idx + 1}
          </span>
          <span className="text-sm font-medium text-gray-300 truncate max-w-[160px]">
            {momento.titulo || "Sem título"}
          </span>
          {momento.fotos.length > 0 && (
            <span className="text-gray-600 text-xs">{momento.fotos.length} foto{momento.fotos.length > 1 ? "s" : ""}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="text-gray-600 hover:text-red-400 transition-colors text-xs px-1"
            >
              Remover
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5">
          {/* Título */}
          <div>
            <label className={lbl}>Nome do álbum</label>
            <input
              className={inp}
              placeholder="ex: Praia, Festa, Nossa Viagem..."
              value={momento.titulo}
              onChange={e => onTituloChange(e.target.value)}
            />
          </div>

          {/* Fotos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lbl + " mb-0"}>Fotos</label>
              {momento.fotos.length > 0 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-[#E8185A] text-xs hover:underline"
                >
                  + Adicionar mais
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && onAddFotos(e.target.files)}
            />

            {momento.fotos.length === 0 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files && onAddFotos(e.dataTransfer.files); }}
                className="w-full py-8 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center gap-2 hover:border-[#E8185A]/40 hover:bg-white/[0.02] transition-all cursor-pointer group"
              >
                <svg className="w-8 h-8 text-gray-600 group-hover:text-[#E8185A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12h.008v.008H13.5V12zm-7.5 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0020.25 4.5h-15A2.25 2.25 0 003 6.75v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <p className="text-xs text-gray-500 group-hover:text-white transition-colors">
                  Clique ou arraste as fotos
                </p>
                <p className="text-[10px] text-gray-600">Pode selecionar várias de uma vez</p>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {momento.fotos.map(foto => (
                  <div key={foto.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]">
                      <img src={foto.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Remover */}
                    <button
                      type="button"
                      onClick={() => onRemoveFoto(foto.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                    {/* Legenda */}
                    <input
                      className="mt-1 w-full bg-transparent border-b border-white/10 text-[10px] text-gray-500 placeholder-gray-700 focus:outline-none focus:border-[#E8185A] pb-0.5 transition-colors"
                      placeholder="Legenda..."
                      value={foto.legenda}
                      onChange={e => onLegenda(foto.id, e.target.value)}
                      maxLength={50}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EpisodioCard({
  ep, idx, total, onChange, onVideoArquivo, onCapaChange, onRemove, inp, lbl,
}: {
  ep: Episodio;
  idx: number;
  total: number;
  onChange: (field: keyof Episodio, val: string) => void;
  onVideoArquivo: (file: File) => void;
  onCapaChange: (preview: string) => void;
  onRemove: () => void;
  inp: string;
  lbl: string;
}) {
  const [open, setOpen] = useState(idx === 0);
  const fileRef = useRef<HTMLInputElement>(null);
  const capaRef = useRef<HTMLInputElement>(null);
  const isYt = ep.videoUrl.includes("youtu");

  return (
    <div className="bg-[#181818] rounded-xl border border-white/8 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="bg-[#E8185A]/15 text-[#E8185A] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            EP {idx + 1}
          </span>
          <span className="text-sm font-medium text-gray-300 truncate max-w-[180px]">
            {ep.titulo || "Sem título"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); onRemove(); }}
              className="text-gray-600 hover:text-red-400 transition-colors text-xs px-1"
            >
              Remover
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-white/5">
          {/* Título */}
          <div>
            <label className={lbl}>Título do episódio</label>
            <input
              className={inp}
              placeholder="ex: Nossa primeira viagem"
              value={ep.titulo}
              onChange={e => onChange("titulo", e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className={lbl}>
              Descrição{" "}
              <span className="text-gray-600 normal-case tracking-normal font-normal">(opcional)</span>
            </label>
            <textarea
              className={inp + " resize-none min-h-[80px] leading-relaxed"}
              placeholder="Uma descrição curta sobre esse momento..."
              value={ep.descricao}
              onChange={e => onChange("descricao", e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Capa do episódio */}
          <div>
            <label className={lbl}>
              Capa{" "}
              <span className="text-gray-600 normal-case tracking-normal font-normal">(opcional)</span>
            </label>
            <input
              ref={capaRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => onCapaChange(ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
            {ep.capaPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#111]">
                <img src={ep.capaPreview} alt="Capa" className="w-full h-auto block" />
                <button
                  type="button"
                  onClick={() => onCapaChange("")}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => capaRef.current?.click()}
                className="w-full py-5 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center gap-2 hover:border-[#E8185A]/40 hover:bg-[#E8185A]/5 transition-all text-gray-500 hover:text-[#E8185A] text-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.25V19.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 19.5V8.25" />
                </svg>
                Adicionar capa do episódio
              </button>
            )}
          </div>

          {/* Tipo de vídeo */}
          <div>
            <label className={lbl}>Vídeo</label>
            <div className="flex gap-2 mb-3">
              {(["youtube", "arquivo"] as const).map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => onChange("videoTipo", tipo)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                    ep.videoTipo === tipo
                      ? "border-[#E8185A] bg-[#E8185A]/10 text-white"
                      : "border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  {tipo === "youtube" ? "▶ Link YouTube" : "📁 Arquivo de Vídeo"}
                </button>
              ))}
            </div>

            {ep.videoTipo === "youtube" ? (
              <div>
                <input
                  className={inp}
                  placeholder="Cole o link do YouTube"
                  value={ep.videoUrl}
                  onChange={e => onChange("videoUrl", e.target.value)}
                />
                {isYt && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    YouTube detectado
                  </p>
                )}
              </div>
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && onVideoArquivo(e.target.files[0])}
                />
                {ep.videoUploading && (
                  <div className="w-full py-5 rounded-xl border border-white/10 flex flex-col items-center gap-2 bg-white/[0.02]">
                    <div className="w-5 h-5 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500">Enviando vídeo para o servidor...</p>
                  </div>
                )}
                {!ep.videoNome && !ep.videoUploading && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && onVideoArquivo(e.dataTransfer.files[0]); }}
                    className="w-full py-6 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center gap-2 hover:border-[#E8185A]/40 hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <svg className="w-8 h-8 text-gray-600 group-hover:text-[#E8185A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <p className="text-xs text-gray-500 group-hover:text-white transition-colors">Clique ou arraste o vídeo (MP4, MOV, AVI...)</p>
                    <p className="text-[10px] text-gray-600">Máx. 60 segundos · 60 MB</p>
                  </button>
                )}
                {ep.videoErro && (
                  <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <p className="text-red-400 text-xs">⚠️ {ep.videoErro}</p>
                  </div>
                )}
                {ep.videoNome && !ep.videoUploading && (
                  <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-4 py-3 border border-green-500/20">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400 text-xs truncate flex-1">{ep.videoNome}</span>
                    <button
                      type="button"
                      onClick={() => { onChange("videoArquivo", ""); onChange("videoNome", ""); onChange("videoUrl", ""); onChange("videoErro", ""); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors flex-shrink-0"
                    >
                      Trocar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CriarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8185A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CriarPageInner />
    </Suspense>
  );
}
