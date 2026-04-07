"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Gift } from "lucide-react";

const offers = [
  {
    id: "A",
    spend: "R$ 500",
    credit: "R$ 500",
    description: "Gaste R$ 500 nos seus primeiros 60 dias e receba R$ 500 em crédito publicitário.",
    popular: false,
  },
  {
    id: "B",
    spend: "R$ 1.000",
    credit: "R$ 1.000",
    description: "Gaste R$ 1.000 nos seus primeiros 60 dias e receba R$ 1.000 em crédito publicitário.",
    popular: true,
  },
  {
    id: "C",
    spend: "R$ 1.500",
    credit: "R$ 1.500",
    description: "Gaste R$ 1.500 nos seus primeiros 60 dias e receba R$ 1.500 em crédito publicitário.",
    popular: false,
  },
];

export default function PromoOffer() {
  const [selected, setSelected] = useState("B");

  return (
    <section className="py-20" style={{ background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "#e8f0fe", color: "#1a73e8" }}>
            <Gift size={16} />
            <span className="text-sm" style={{ fontWeight: 500 }}>Oferta por tempo limitado para novos anunciantes</span>
          </div>
          <h2 className="text-4xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>
            Ganhe até R$ 1.500 em crédito publicitário gratuito
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#5f6368", fontWeight: 400 }}>
            Novo no Google Ads? Escolha sua oferta e igualamos seu investimento com crédito gratuito para ajudá-lo a começar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          {offers.map((offer, i) => (
            <motion.button
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(offer.id)}
              className="relative rounded-xl p-6 text-left transition-all"
              style={{
                border: selected === offer.id ? "2px solid #1a73e8" : "2px solid #dadce0",
                background: selected === offer.id ? "#e8f0fe" : "#fff",
              }}
            >
              {offer.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs text-white" style={{ background: "#1a73e8", fontWeight: 500 }}>
                  Mais popular
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl" style={{ color: "#1a73e8", fontWeight: 300 }}>
                  {offer.credit}
                </span>
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: selected === offer.id ? "#1a73e8" : "#dadce0",
                    background: selected === offer.id ? "#1a73e8" : "transparent",
                  }}
                >
                  {selected === offer.id && <Check size={12} color="#fff" strokeWidth={3} />}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: "#202124", fontWeight: 500 }}>em crédito gratuito</p>
              <p className="text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>
                Ao gastar {offer.spend}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-8 py-4 text-white"
              style={{ background: "#1a73e8", fontSize: 16, borderRadius: 24, fontWeight: 500 }}
            >
              <Gift size={18} />
              Resgatar oferta agora
            </Link>
            <p className="mt-4 text-xs" style={{ color: "#9aa0a6", fontWeight: 400 }}>
              Oferta disponível apenas para novas contas do Google Ads. Termos e condições se aplicam.{" "}
              <Link href="/terms" style={{ color: "#1a73e8" }}>Saiba mais</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
