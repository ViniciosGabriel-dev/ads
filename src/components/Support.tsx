"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Calendar, MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <section className="py-20" style={{ background: "#202124" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left text */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl mb-4 text-white" style={{ fontWeight: 400 }}>
              Deixe-nos ajudá-lo a começar
            </h2>
            <p className="text-lg max-w-lg" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>
              Nossos especialistas do Google Ads estão disponíveis para ajudá-lo a configurar sua primeira campanha, otimizar o desempenho e alcançar seus objetivos de negócio — sem custo adicional.
            </p>
          </motion.div>

          {/* Right cards */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Phone,
                title: "Ligue para nós",
                desc: "Fale diretamente com um especialista do Google Ads",
                href: "tel:08007248349",
                cta: "0800 724 8349",
                color: "#34a853",
              },
              {
                icon: Calendar,
                title: "Agendar reunião",
                desc: "Reserve uma sessão gratuita 1 a 1 com um especialista",
                href: "/schedule",
                cta: "Agendar agora",
                color: "#1a73e8",
              },
              {
                icon: MessageCircle,
                title: "Chat com a gente",
                desc: "Obtenha ajuda imediata da nossa equipe de suporte",
                href: "/chat",
                cta: "Iniciar chat",
                color: "#fbbc05",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="flex flex-col p-6 rounded-xl transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", minWidth: 180 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: `${item.color}22` }}>
                    <Icon size={20} color={item.color} />
                  </div>
                  <p className="text-white mb-1 text-sm" style={{ fontWeight: 500 }}>{item.title}</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{item.desc}</p>
                  <span className="text-sm" style={{ color: item.color, fontWeight: 500 }}>{item.cta} →</span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
