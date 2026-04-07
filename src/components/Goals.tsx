"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, ShoppingCart, MapPin, Users, Download, ArrowRight } from "lucide-react";

const goals = [
  {
    icon: TrendingUp,
    color: "#1a73e8",
    bg: "#e8f0fe",
    title: "Aumente leads e conversões",
    description: "Conecte-se com clientes de alta intenção e transforme-os em compradores com campanhas de Pesquisa e Display segmentadas.",
    href: "/goals/leads",
  },
  {
    icon: ShoppingCart,
    color: "#34a853",
    bg: "#e6f4ea",
    title: "Impulsione as vendas online",
    description: "Gere mais compras no seu site com Anúncios de Shopping que exibem seus produtos no momento em que as pessoas estão prontas para comprar.",
    href: "/goals/sales",
  },
  {
    icon: MapPin,
    color: "#ea4335",
    bg: "#fce8e6",
    title: "Aumente o tráfego para sua loja",
    description: "Leve clientes até suas lojas físicas com campanhas locais que exibem anúncios para pessoas próximas.",
    href: "/goals/store-visits",
  },
  {
    icon: Users,
    color: "#fbbc05",
    bg: "#fef9e0",
    title: "Construa reconhecimento de marca",
    description: "Expanda seu alcance e cause uma impressão duradoura com campanhas de Vídeo e Display que colocam sua marca diante das pessoas certas.",
    href: "/goals/awareness",
  },
  {
    icon: Download,
    color: "#9c27b0",
    bg: "#f3e5f5",
    title: "Obtenha mais instalações do app",
    description: "Expanda a base de usuários do seu app com campanhas de App que o promovem na Pesquisa, Play, YouTube e muito mais.",
    href: "/goals/app-installs",
  },
];

export default function Goals() {
  return (
    <section className="py-20" style={{ background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>
            Alcance seus objetivos de negócio
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6368", fontWeight: 400 }}>
            Seja mais visitas ao site, chamadas telefônicas ou visitas à loja — o Google Ads pode ajudá-lo a chegar lá.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-xl p-6 flex flex-col items-start bg-white"
                style={{ border: "1px solid #dadce0" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: g.bg }}>
                  <Icon size={26} color={g.color} />
                </div>
                <h3 className="text-lg mb-3" style={{ color: "#202124", fontWeight: 500 }}>{g.title}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "#5f6368", fontWeight: 400 }}>{g.description}</p>
                <Link href={g.href} className="flex items-center gap-1 text-sm" style={{ color: g.color, fontWeight: 500 }}>
                  Saiba mais <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-6 flex flex-col justify-between"
            style={{ background: "#202124", color: "#fff" }}
          >
            <div>
              <h3 className="text-lg mb-3 text-white" style={{ fontWeight: 500 }}>Não sabe por onde começar?</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>
                Nossos especialistas do Google Ads podem ajudá-lo a escolher o tipo de campanha certo para seus objetivos de negócio — sem custo adicional.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/start"
                className="text-center py-2.5 text-sm"
                style={{ background: "#1a73e8", color: "#fff", borderRadius: 24, fontWeight: 500 }}
              >
                Começar agora
              </Link>
              <Link
                href="/expert"
                className="text-center py-2.5 text-sm"
                style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 24, fontWeight: 400 }}
              >
                Falar com um especialista
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
