"use client";
import { useState } from "react";

const faqs = [
  { q: "O que é a BMM Love?", a: "A BMM Love é uma plataforma para criar páginas românticas personalizadas estilo streaming. Com fotos, músicas, mensagens e uma retrospectiva animada — como se a história de vocês fosse uma série original." },
  { q: "Para quem posso criar?", a: "Para qualquer pessoa especial: namorado(a), esposo(a), crush, amigos ou família. Você personaliza tudo com a história de vocês." },
  { q: "Preciso saber editar ou programar?", a: "Não precisa nada! É simples como preencher um formulário. Você insere as informações, escolhe as fotos e músicas, e nós geramos a página automaticamente." },
  { q: "A página fica no ar para sempre?", a: "No plano Vitalício, sim! Sua página fica online para sempre, acessível de qualquer lugar. No plano de 7 dias, fica disponível por uma semana." },
  { q: "Como funciona a personalização?", a: "Após o pagamento, você tem acesso a uma área exclusiva para personalizar tudo: escolha a foto de capa, adicione vídeos e álbuns de fotos dos momentos de vocês, escreva uma mensagem especial, coloque a música do casal e muito mais. Tudo pelo celular mesmo, sem precisar instalar nada." },
  { q: "Como entrego a surpresa?", a: "Após o pagamento você recebe instantaneamente o link e um QR Code. Envie pelo WhatsApp, e-mail, ou imprima o QR Code." },
  { q: "O acesso é imediato após o pagamento?", a: "Sim! Assim que o pagamento é confirmado, você recebe tudo na hora. Sem espera." },
  { q: "O que tem na Retrospectiva?", a: "A retrospectiva mostra os melhores momentos do casal em cards animados, com a música favorita tocando no fundo — igual ao Spotify Wrapped mas para o amor de vocês." },
  { q: "Se eu errar algo, posso editar depois?", a: "Sim! Com qualquer plano você tem edições ilimitadas. Pode alterar fotos, textos e músicas quando quiser." },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-[#181818]">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-200 hover:bg-white/5 transition-colors text-sm"
          >
            {faq.q}
            <span
              className="text-gray-500 flex-shrink-0 ml-4 transition-transform duration-200 text-xs"
              style={{ transform: open === i ? "rotate(180deg)" : "none" }}
            >
              ▼
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
