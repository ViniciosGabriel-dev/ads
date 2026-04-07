"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "Quais tipos de campanhas do Google Ads posso veicular?",
    answer: "O Google Ads oferece vários tipos de campanha para atender aos seus objetivos de marketing: Campanhas de Pesquisa (anúncios de texto na Pesquisa Google), Campanhas de Display (anúncios visuais em toda a web), Campanhas de Shopping (listagens de produtos no Google), Campanhas de Vídeo (anúncios no YouTube), Campanhas de App (promova seu aplicativo mobile) e Campanhas Performance Max (campanhas com IA em todos os canais do Google). Cada tipo atende a objetivos de negócios diferentes e alcança clientes em diferentes estágios da jornada.",
  },
  {
    question: "O Google Ads é adequado para o meu negócio?",
    answer: "O Google Ads funciona para empresas de todos os tamanhos — de prestadores de serviços locais a lojas globais de e-commerce. Se seus clientes buscam produtos ou serviços como os seus online, o Google Ads pode ajudá-lo a alcançá-los. Você controla seu orçamento (a partir de qualquer valor), paga apenas quando alguém clica no seu anúncio e pode pausar ou interromper campanhas a qualquer momento. Mais de 1 milhão de empresas no mundo usam o Google Ads para crescer.",
  },
  {
    question: "Como a IA do Google ajuda a melhorar meus anúncios?",
    answer: "A IA do Google alimenta muitos recursos no Google Ads para ajudá-lo a obter melhores resultados automaticamente. O Smart Bidding usa machine learning para otimizar seus lances em tempo real em cada leilão. O Performance Max encontra automaticamente as melhores combinações de anúncios em todos os canais do Google. Os Anúncios de Pesquisa Responsivos testam diferentes títulos e descrições para descobrir o que ressoa melhor com seu público. A IA do Google aprende com os dados da sua campanha para melhorar continuamente o desempenho ao longo do tempo.",
  },
  {
    question: "Como segmento o público certo com o Google Ads?",
    answer: "O Google Ads oferece poderosas opções de segmentação para alcançar seus clientes ideais: Palavras-chave (exiba anúncios quando pessoas buscam termos específicos), Segmentação geográfica (local, regional ou global), Dados demográficos (idade, gênero, renda familiar), Interesses e intenção (pessoas interessadas ou pesquisando ativamente sua categoria), Remarketing (reengaje visitantes anteriores do site), Customer Match (segmente clientes existentes por lista de e-mail) e Públicos semelhantes (alcance novas pessoas que se assemelham aos seus melhores clientes).",
  },
  {
    question: "Quanto custa o Google Ads?",
    answer: "O Google Ads funciona no modelo de custo por clique (CPC) — você paga apenas quando alguém clica no seu anúncio. Não há orçamento mínimo obrigatório. Você define um limite de orçamento diário para controlar os gastos e pode ajustar ou pausar suas campanhas a qualquer momento. O custo por clique varia por setor, concorrência e palavra-chave. Em média, as empresas faturam R$ 2 para cada R$ 1 investido no Google Ads. Novos anunciantes também podem receber créditos de anúncio de até R$ 1.200 ao começar.",
  },
  {
    question: "Quanto tempo leva para ver resultados?",
    answer: "Muitos anunciantes veem resultados em poucas horas após lançar sua primeira campanha — uma vez aprovados, os anúncios podem começar a ser exibidos imediatamente. No entanto, o Google recomenda aguardar pelo menos 30 a 90 dias para que as estratégias de Smart Bidding coletem dados e otimizem. Para a maioria das empresas, você começará a ver dados relevantes e resultados iniciais nas primeiras 2 semanas. A otimização contínua geralmente leva a melhorias constantes ao longo do tempo.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>
            Perguntas frequentes
          </h2>
          <p className="text-lg" style={{ color: "#5f6368", fontWeight: 400 }}>
            Tem mais dúvidas?{" "}
            <Link href="/support" className="underline" style={{ color: "#1a73e8" }}>
              Visite nossa Central de Ajuda
            </Link>
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #dadce0" }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                style={{ background: open === i ? "#f8f9fa" : "#fff" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="pr-4" style={{ color: "#202124", fontSize: 16, fontWeight: 500 }}>
                  {faq.question}
                </span>
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: open === i ? "#1a73e8" : "#f1f3f4" }}>
                  {open === i
                    ? <Minus size={16} color="#fff" />
                    : <Plus size={16} color="#5f6368" />
                  }
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-6 pb-5 pt-1 text-sm leading-relaxed" style={{ color: "#5f6368", borderTop: "1px solid #dadce0", fontWeight: 400 }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
