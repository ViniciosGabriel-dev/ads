"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Monitor, ShoppingBag, Play, Smartphone, ArrowRight } from "lucide-react";

const campaigns = [
  {
    icon: Search,
    color: "#4285F4",
    bg: "#e8f0fe",
    title: "Anúncios de Pesquisa",
    subtitle: "Alcance quem está buscando ativamente",
    description: "Exiba seus anúncios para pessoas que já estão buscando produtos ou serviços como os seus na Pesquisa Google. Você paga apenas quando alguém clica no seu anúncio.",
    href: "/campaign-types/search",
    stats: "O Google processa 8,5 bilhões de pesquisas por dia",
  },
  {
    icon: Monitor,
    color: "#EA4335",
    bg: "#fce8e6",
    title: "Anúncios de Display",
    subtitle: "Capture atenção visualmente",
    description: "Alcance pessoas enquanto navegam na web, assistem ao YouTube, verificam o Gmail ou usam dispositivos móveis. Crie anúncios visualmente impactantes.",
    href: "/campaign-types/display",
    stats: "Alcance 90% dos usuários de internet no mundo",
  },
  {
    icon: ShoppingBag,
    color: "#FBBC05",
    bg: "#fef9e0",
    title: "Anúncios de Shopping",
    subtitle: "Destaque seus produtos",
    description: "Promova seus produtos para pessoas comprando online. Os Anúncios de Shopping aparecem no topo da Pesquisa Google com imagens, preços e nomes de lojas.",
    href: "/campaign-types/shopping",
    stats: "Impulsione mais vendas com listagens de produtos",
  },
  {
    icon: Play,
    color: "#EA4335",
    bg: "#fce8e6",
    title: "Anúncios de Vídeo",
    subtitle: "Conte sua história com vídeo",
    description: "Engaje seu público com anúncios de vídeo no YouTube e em sites parceiros de vídeo do Google. Alcance pessoas onde elas passam o tempo assistindo conteúdo.",
    href: "/campaign-types/video",
    stats: "O YouTube tem mais de 2 bilhões de usuários ativos mensais",
  },
  {
    icon: Smartphone,
    color: "#34A853",
    bg: "#e6f4ea",
    title: "Anúncios de App",
    subtitle: "Expanda a base de usuários do seu app",
    description: "Promova seu aplicativo nas maiores propriedades do Google — Pesquisa, Play, YouTube, Discover e a Rede de Display — tudo em uma única campanha.",
    href: "/campaign-types/app",
    stats: "Alcance pessoas prontas para baixar aplicativos",
  },
];

export default function CampaignTypes() {
  return (
    <section className="py-20" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>
            O anúncio certo para cada objetivo
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6368", fontWeight: 400 }}>
            O Google Ads oferece uma variedade de tipos de campanha para ajudá-lo a alcançar seus objetivos de marketing — onde quer que seus clientes estejam.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="rounded-xl p-6 flex flex-col"
                style={{
                  border: "1px solid #dadce0",
                  background: "#fff",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: c.bg }}>
                  <Icon size={22} color={c.color} />
                </div>

                <h3 className="text-xl mb-1" style={{ color: "#202124", fontWeight: 500 }}>{c.title}</h3>
                <p className="text-sm mb-3" style={{ color: c.color, fontWeight: 500 }}>{c.subtitle}</p>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "#5f6368", fontWeight: 400 }}>{c.description}</p>

                <div className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: c.bg, color: c.color, fontWeight: 400 }}>
                  {c.stats}
                </div>

                <Link
                  href={c.href}
                  className="flex items-center gap-1 text-sm"
                  style={{ color: c.color, fontWeight: 500 }}
                >
                  Explorar {c.title.toLowerCase()} <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}

          {/* Performance Max card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-xl p-6 md:col-span-2 lg:col-span-1"
            style={{
              background: "linear-gradient(135deg, #1a73e8 0%, #174ea6 100%)",
              color: "#fff",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.2)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="text-xl mb-1 text-white" style={{ fontWeight: 500 }}>Performance Max</h3>
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Campanhas completas com IA</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>
              Deixe a IA do Google encontrar seus anúncios de melhor desempenho em todos os canais — Pesquisa, Display, YouTube, Gmail, Maps e Discover — em uma única campanha.
            </p>
            <Link
              href="/campaign-types/performance-max"
              className="flex items-center gap-1 text-sm"
              style={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
            >
              Saiba mais sobre Performance Max <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
