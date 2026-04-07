"use client";

import { motion } from "framer-motion";
import { Globe, BarChart3, DollarSign } from "lucide-react";

const benefits = [
  {
    icon: Globe,
    color: "#1a73e8",
    title: "Alcance os clientes certos",
    description: "Exiba seus anúncios para as pessoas certas na hora certa. O Google Ads dá a você controle sobre quem vê seus anúncios — por localização, idioma, interesses, dispositivo e muito mais.",
    points: [
      "Segmente por palavra-chave, localização e dados demográficos",
      "Alcance pessoas na Pesquisa Google, YouTube, Gmail e muito mais",
      "Anuncie globalmente ou apenas na sua vizinhança",
    ],
  },
  {
    icon: BarChart3,
    color: "#34a853",
    title: "Meça e otimize os resultados",
    description: "Saiba exatamente o que está funcionando. Acompanhe cliques, chamadas, visitas ao site e vendas — depois use a IA do Google para otimizar automaticamente suas campanhas.",
    points: [
      "Relatórios de desempenho em tempo real",
      "Lances inteligentes com tecnologia de IA do Google",
      "Rastreamento de conversões para chamadas, compras e muito mais",
    ],
  },
  {
    icon: DollarSign,
    color: "#fbbc05",
    title: "Controle seu orçamento",
    description: "Comece com qualquer orçamento e pague apenas quando alguém clica no seu anúncio. Defina um limite de orçamento diário para nunca gastar mais do que o planejado — e ajuste quando quiser.",
    points: [
      "Sem gasto mínimo obrigatório",
      "Pague apenas por clique (CPC) ou impressão",
      "Defina e altere orçamentos a qualquer momento",
    ],
  },
];

export default function Benefits() {
  return (
    <section className="py-20" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>
            Por que o Google Ads?
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6368", fontWeight: 400 }}>
            O Google Ads oferece às empresas de todos os tamanhos as ferramentas para crescer — de lojas locais a marcas globais.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="flex justify-center lg:justify-start mb-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${b.color}15` }}>
                    <Icon size={30} color={b.color} />
                  </div>
                </div>
                <h3 className="text-2xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>{b.title}</h3>
                <p className="text-base mb-5 leading-relaxed" style={{ color: "#5f6368", fontWeight: 400 }}>{b.description}</p>
                <ul className="space-y-2">
                  {b.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "#5f6368", fontWeight: 400 }}>
                      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill={b.color}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom graphic strip */}
        <motion.div
          className="mt-20 rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ background: "linear-gradient(135deg, #1a73e8 0%, #174ea6 50%, #0d47a1 100%)" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between px-10 py-10 gap-6">
            <div className="text-white">
              <h3 className="text-2xl mb-2" style={{ fontWeight: 400 }}>A IA do Google trabalha para você</h3>
              <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 480, fontSize: 15, fontWeight: 400 }}>
                O Smart Bidding usa machine learning para otimizar automaticamente os lances em cada leilão — ajudando você a obter mais conversões pelo preço certo.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-center shrink-0">
              <div className="text-white">
                <div className="text-5xl" style={{ fontWeight: 300 }}>70%</div>
                <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>dos anunciantes veem mais conversões com o Smart Bidding</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
