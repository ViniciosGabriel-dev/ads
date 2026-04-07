"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote: "O Google Ads transformou completamente nosso negócio. Vimos um retorno de 23x sobre o investimento em anúncios nos primeiros três meses — algo que nunca achamos possível para uma pequena empresa como a nossa.",
    author: "Sarah Chen",
    role: "Fundadora e CEO",
    company: "BloomBotanics",
    result: "23x",
    resultLabel: "retorno sobre o investimento",
    industry: "E-commerce",
    color: "#1a73e8",
    initials: "BC",
  },
  {
    quote: "Ficamos céticos no início, mas os Anúncios de Pesquisa do Google nos trouxeram 400% de retorno sobre o investimento. Agora o Google Ads é a espinha dorsal da nossa estratégia de aquisição de clientes.",
    author: "Marcus Johnson",
    role: "Diretor de Marketing",
    company: "TechFlow Solutions",
    result: "400%",
    resultLabel: "retorno sobre o investimento",
    industry: "SaaS",
    color: "#34a853",
    initials: "TF",
  },
  {
    quote: "Com os Anúncios de Shopping, alcançamos 150% de crescimento anual na receita online. Nossos produtos agora chegam aos compradores no momento em que estão prontos para comprar.",
    author: "Isabella Rodriguez",
    role: "Head de Digital",
    company: "StyleHouse Fashion",
    result: "150%",
    resultLabel: "crescimento anual",
    industry: "Varejo",
    color: "#ea4335",
    initials: "SH",
  },
  {
    quote: "Os anúncios de vídeo no YouTube entregaram 675% de ROAS nas nossas campanhas sazonais. Conectamos com nosso público de uma forma que a publicidade tradicional nunca conseguiu.",
    author: "David Kim",
    role: "VP de Marketing",
    company: "FreshBite Foods",
    result: "675%",
    resultLabel: "retorno sobre o investimento em anúncios (ROAS)",
    industry: "Alimentação e Bebidas",
    color: "#fbbc05",
    initials: "FB",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-20" style={{ background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl mb-4" style={{ color: "#202124", fontWeight: 400 }}>
            Resultados reais de negócios reais
          </h2>
          <p className="text-lg" style={{ color: "#5f6368", fontWeight: 400 }}>
            Veja como empresas como a sua crescem com o Google Ads.
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1px solid #dadce0" }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left: quote */}
                <div className="flex-1 p-8 lg:p-12">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={t.color} color={t.color} />
                    ))}
                  </div>

                  <blockquote className="text-xl leading-relaxed mb-8" style={{ color: "#202124", fontWeight: 400 }}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm" style={{ background: t.color, fontWeight: 700 }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: "#202124", fontWeight: 500 }}>{t.author}</p>
                      <p className="text-sm" style={{ color: "#5f6368", fontWeight: 400 }}>{t.role}, {t.company}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${t.color}15`, color: t.color, fontWeight: 400 }}>
                        {t.industry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: stat */}
                <div className="lg:w-80 flex items-center justify-center p-8 lg:p-12" style={{ background: `${t.color}08`, borderLeft: "1px solid #dadce0" }}>
                  <div className="text-center">
                    <div className="text-7xl mb-2" style={{ color: t.color, fontWeight: 300 }}>{t.result}</div>
                    <div className="text-sm" style={{ color: "#5f6368", fontWeight: 400 }}>{t.resultLabel}</div>
                    <div className="mt-6 text-xs px-3 py-1.5 rounded-full inline-block" style={{ background: t.color, color: "#fff", fontWeight: 500 }}>
                      {t.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: "1px solid #dadce0", background: "#fff" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f3f4"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              aria-label="Anterior"
            >
              <ChevronLeft size={18} color="#5f6368" />
            </button>

            <div className="flex items-center gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    background: i === current ? testimonials[i].color : "#dadce0",
                    width: i === current ? 24 : 8,
                  }}
                  aria-label={`Ir para depoimento ${i + 1}`}
                />
              ))}
              <span className="text-sm ml-2" style={{ color: "#5f6368", fontWeight: 400 }}>
                {current + 1} / {testimonials.length}
              </span>
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: "1px solid #dadce0", background: "#fff" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f3f4"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              aria-label="Próximo"
            >
              <ChevronRight size={18} color="#5f6368" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
