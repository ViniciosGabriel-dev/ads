"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, Pause, ChevronRight } from "lucide-react";

const slides = [
  {
    headline: "Aumente as vendas",
    sub: "com o Google Ads",
    description: "Conecte-se com clientes que estão ativamente buscando o que você vende.",
    color: "#1a73e8",
    badge: "Anúncios de Pesquisa",
    mockup: "search",
  },
  {
    headline: "Destaque-se",
    sub: "com o Google Ads",
    description: "Capture atenção com visuais impactantes em milhões de sites.",
    color: "#ea4335",
    badge: "Anúncios de Display",
    mockup: "display",
  },
  {
    headline: "Seja encontrado",
    sub: "com o Google Ads",
    description: "Apareça quando as pessoas procuram produtos como os seus no Google.",
    color: "#fbbc05",
    badge: "Anúncios de Shopping",
    mockup: "shopping",
  },
  {
    headline: "Apareça",
    sub: "com o Google Ads",
    description: "Alcance pessoas assistindo YouTube com anúncios de vídeo impactantes.",
    color: "#34a853",
    badge: "Anúncios de Vídeo",
    mockup: "video",
  },
];

function SearchMockup({ color }: { color: string }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#fff", maxWidth: 420 }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f1f3f4", borderBottom: "1px solid #dadce0" }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ea4335" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#fbbc05" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#34a853" }} />
        </div>
        <div className="flex-1 rounded-full px-3 py-1 text-xs" style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0" }}>
          google.com/search?q=tenis+de+corrida
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg width="24" height="24" viewBox="0 0 272 92" fill="none">
            <path d="M35.29 41.41V32h34.51c.34 1.76.51 3.85.51 6.11 0 7.59-2.08 16.97-8.74 23.63-6.49 6.74-14.74 10.33-25.72 10.33C16.22 72.07 0 56.36 0 36.78 0 17.2 16.22 1.49 35.85 1.49c11.23 0 19.22 4.41 25.21 10.07l-7.1 7.1c-4.29-4.03-10.1-7.17-18.11-7.17-14.8 0-26.37 11.91-26.37 26.29 0 14.38 11.57 26.29 26.37 26.29 9.59 0 15.06-3.86 18.56-7.36 2.85-2.85 4.72-6.93 5.46-12.51H35.29z" fill="#4285F4"/>
          </svg>
          <span className="text-sm" style={{ color: "#202124", fontWeight: 400 }}>tênis de corrida</span>
        </div>
        <div className="mb-3 p-3 rounded-lg" style={{ border: `2px solid ${color}`, background: "#fafafa" }}>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs px-1 rounded" style={{ background: color, color: "#fff", fontWeight: 700 }}>Anúncio</span>
            <span className="text-xs" style={{ color: "#5f6368" }}>· melhortenis.com.br</span>
          </div>
          <p className="text-sm" style={{ color: color, fontWeight: 500 }}>Tênis de Corrida Premium – Frete Grátis Hoje</p>
          <p className="text-xs mt-1" style={{ color: "#5f6368", fontWeight: 400 }}>Os melhores tênis para todas as distâncias. 500+ modelos com troca grátis.</p>
        </div>
        <div className="mb-3 p-2">
          <p className="text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>corridaemfoco.com.br › melhores-tenis</p>
          <p className="text-sm" style={{ color: "#1a0dab", fontWeight: 400 }}>Melhores Tênis de Corrida de 2025</p>
          <p className="text-xs mt-1" style={{ color: "#5f6368", fontWeight: 400 }}>Testados e avaliados por especialistas em corrida...</p>
        </div>
      </div>
    </div>
  );
}

function DisplayMockup({ color }: { color: string }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#fff", maxWidth: 420 }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f1f3f4", borderBottom: "1px solid #dadce0" }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ea4335" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#fbbc05" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#34a853" }} />
        </div>
        <div className="flex-1 rounded-full px-3 py-1 text-xs" style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0" }}>
          receitas.com.br/massas
        </div>
      </div>
      <div className="p-4 relative">
        <div className="text-xs mb-2" style={{ color: "#5f6368", fontWeight: 400 }}>Top 10 Receitas de Macarrão para Hoje</div>
        <div className="text-xs mb-4 leading-5" style={{ color: "#202124", fontWeight: 400 }}>
          Procurando a receita perfeita de macarrão? Do cremoso carbonara ao clássico ao sugo, veja nossas melhores opções...
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: color }}>
          <span className="text-xs text-white opacity-70 block mb-1">Patrocinado</span>
          <p className="text-white text-sm mb-1" style={{ fontWeight: 700 }}>50% Off no Seu Primeiro Pedido</p>
          <p className="text-white text-xs mb-3 opacity-90" style={{ fontWeight: 400 }}>Produtos premium com entrega grátis</p>
          <div className="rounded px-4 py-1 inline-block text-xs" style={{ background: "#fff", color: color, fontWeight: 500 }}>
            Comprar Agora
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingMockup({ color }: { color: string }) {
  const products = [
    { name: "Runner Pro X", price: "R$ 299", store: "NikeShop" },
    { name: "Speed Elite", price: "R$ 449", store: "Adidas" },
    { name: "Zoom Flex", price: "R$ 219", store: "FootLocker" },
  ];
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#fff", maxWidth: 420 }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f1f3f4", borderBottom: "1px solid #dadce0" }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ea4335" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#fbbc05" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#34a853" }} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs px-1 rounded" style={{ background: "#dadce0", color: "#5f6368", fontWeight: 400 }}>Patrocinado</span>
          <span className="text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>· Resultados de Shopping</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {products.map((p, i) => (
            <div key={i} className="rounded-lg overflow-hidden border" style={{ borderColor: i === 0 ? color : "#dadce0", borderWidth: i === 0 ? 2 : 1 }}>
              <div className="h-20 flex items-center justify-center" style={{ background: `${color}15` }}>
                <div className="w-12 h-12 rounded-full" style={{ background: color, opacity: 0.3 + i * 0.2 }} />
              </div>
              <div className="p-2">
                <p className="text-xs leading-tight" style={{ color: "#202124", fontWeight: 500 }}>{p.name}</p>
                <p className="text-xs mt-1" style={{ color: color, fontWeight: 700 }}>{p.price}</p>
                <p className="text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>{p.store}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoMockup({ color }: { color: string }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#fff", maxWidth: 420 }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f1f3f4", borderBottom: "1px solid #dadce0" }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ea4335" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#fbbc05" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#34a853" }} />
        </div>
        <div className="flex-1 rounded-full px-3 py-1 text-xs" style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0" }}>
          youtube.com/watch?v=...
        </div>
      </div>
      <div className="relative">
        <div className="h-48 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${color}40, ${color}80)` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)" }}>
              <Play size={22} style={{ color: color, marginLeft: 2 }} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div>
              <span className="text-xs text-white opacity-70">Anúncio · </span>
              <span className="text-xs text-white" style={{ fontWeight: 500 }}>Sua Marca – Assista essa mensagem</span>
            </div>
            <div className="text-xs px-2 py-1 rounded" style={{ background: color, color: "#fff", fontWeight: 400 }}>Pular em 5s</div>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm" style={{ color: "#202124", fontWeight: 500 }}>Anúncios no YouTube alcançam +2 bilhões de espectadores mensais</p>
          <p className="text-xs mt-1" style={{ color: "#5f6368", fontWeight: 400 }}>Conte sua história com vídeo na maior plataforma do mundo.</p>
        </div>
      </div>
    </div>
  );
}

const mockups = [SearchMockup, DisplayMockup, ShoppingMockup, VideoMockup];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [playing]);

  const slide = slides[current];
  const Mockup = mockups[current];

  return (
    <section className="pt-20 pb-0" style={{ background: "#fff" }}>
      {/* Promo banner */}
      <div className="text-center py-3 text-sm" style={{ background: "#e8f0fe", color: "#1a73e8", fontWeight: 400 }}>
        Novo no Google Ads? Ganhe até <strong>R$ 500 em crédito</strong> ao gastar R$ 500.{" "}
        <Link href="/offer" className="underline" style={{ fontWeight: 500 }}>Resgatar oferta</Link>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 0" }}>
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.1, color: slide.color, fontWeight: 400, marginBottom: 8 }}>
                  {slide.headline}
                </h1>
                <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.1, color: "#202124", fontWeight: 400, marginBottom: 24 }}>
                  {slide.sub}
                </h1>
                <p className="mb-8 text-lg" style={{ color: "#5f6368", maxWidth: 480, fontWeight: 400 }}>
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded text-white text-sm"
                style={{ background: "#1a73e8", fontWeight: 500 }}
              >
                Começar agora
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded text-sm"
                style={{ color: "#1a73e8", border: "1px solid #1a73e8", background: "transparent", fontWeight: 500 }}
              >
                Converse com o Google Ads
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-3 mt-10 justify-center lg:justify-start">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: current === i ? s.color : "#f1f3f4",
                    color: current === i ? "#fff" : "#5f6368",
                    fontWeight: 500,
                  }}
                >
                  {s.badge}
                </button>
              ))}
              <button
                onClick={() => setPlaying(!playing)}
                className="p-2 rounded-full"
                style={{ background: "#f1f3f4", color: "#5f6368" }}
                aria-label={playing ? "Pausar" : "Reproduzir"}
              >
                {playing ? <Pause size={12} /> : <Play size={12} />}
              </button>
            </div>
          </div>

          {/* Right: mockup */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.95 }}
                transition={{ duration: 0.45 }}
                className="w-full"
                style={{ maxWidth: 440 }}
              >
                <Mockup color={slide.color} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="mt-16" style={{ background: "#f8f9fa", borderTop: "1px solid #dadce0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "+1 bi", label: "pessoas usam a Pesquisa Google diariamente" },
              { stat: "90%", label: "dos usuários de internet alcançados pelos Anúncios de Display" },
              { stat: "8x", label: "de retorno sobre o investimento em média" },
              { stat: "+2 bi", label: "usuários ativos mensais no YouTube" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl mb-2" style={{ color: "#1a73e8", fontWeight: 300 }}>{item.stat}</div>
                <div className="text-sm" style={{ color: "#5f6368", fontWeight: 400 }}>{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
