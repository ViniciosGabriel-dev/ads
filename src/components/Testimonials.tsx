"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Google Ads completely transformed our business. We saw a 23x return on our ad spend within the first three months — something we never thought possible for a small business like ours.",
    author: "Sarah Chen",
    role: "Founder & CEO",
    company: "BloomBotanics",
    result: "23x ROI",
    resultLabel: "return on ad spend",
    industry: "E-commerce",
    color: "#1a73e8",
    initials: "BC",
  },
  {
    quote: "We were skeptical at first, but Google Search Ads brought us a 400% return on investment. Now Google Ads is the backbone of our customer acquisition strategy.",
    author: "Marcus Johnson",
    role: "Marketing Director",
    company: "TechFlow Solutions",
    result: "400%",
    resultLabel: "return on investment",
    industry: "SaaS",
    color: "#34a853",
    initials: "TF",
  },
  {
    quote: "With Shopping Ads, we achieved 150% year-over-year growth in online revenue. Our products now reach shoppers the moment they're ready to buy.",
    author: "Isabella Rodriguez",
    role: "Head of Digital",
    company: "StyleHouse Fashion",
    result: "150%",
    resultLabel: "year-over-year growth",
    industry: "Retail",
    color: "#ea4335",
    initials: "SH",
  },
  {
    quote: "YouTube video ads delivered a 675% ROAS for our seasonal campaigns. We connected with our audience in a way that traditional advertising never could.",
    author: "David Kim",
    role: "VP of Marketing",
    company: "FreshBite Foods",
    result: "675%",
    resultLabel: "return on ad spend (ROAS)",
    industry: "Food & Beverage",
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
          <h2 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>
            Real results from real businesses
          </h2>
          <p className="text-lg" style={{ color: "#5f6368" }}>
            See how businesses like yours grow with Google Ads.
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
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={t.color} color={t.color} />
                    ))}
                  </div>

                  <blockquote className="text-xl font-normal leading-relaxed mb-8" style={{ color: "#202124" }}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: t.color }}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: "#202124" }}>{t.author}</p>
                      <p className="text-sm" style={{ color: "#5f6368" }}>{t.role}, {t.company}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${t.color}15`, color: t.color }}>
                        {t.industry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: stat */}
                <div className="lg:w-80 flex items-center justify-center p-8 lg:p-12" style={{ background: `${t.color}08`, borderLeft: "1px solid #dadce0" }}>
                  <div className="text-center">
                    <div className="text-7xl font-light mb-2" style={{ color: t.color }}>{t.result}</div>
                    <div className="text-sm" style={{ color: "#5f6368" }}>{t.resultLabel}</div>
                    <div className="mt-6 text-xs px-3 py-1.5 rounded-full inline-block" style={{ background: t.color, color: "#fff" }}>
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
              aria-label="Previous"
            >
              <ChevronLeft size={18} color="#5f6368" />
            </button>

            <div className="flex items-center gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{
                    background: i === current ? testimonials[i].color : "#dadce0",
                    width: i === current ? 24 : 8,
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
              <span className="text-sm ml-2" style={{ color: "#5f6368" }}>
                {current + 1} / {testimonials.length}
              </span>
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ border: "1px solid #dadce0", background: "#fff" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f3f4"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
              aria-label="Next"
            >
              <ChevronRight size={18} color="#5f6368" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
