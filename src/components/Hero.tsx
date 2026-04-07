"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Play, Pause, ChevronRight } from "lucide-react";

const slides = [
  {
    headline: "Drive sales",
    sub: "with Google Ads",
    description: "Connect with customers actively searching for what you sell.",
    color: "#1a73e8",
    badge: "Search Ads",
    mockup: "search",
  },
  {
    headline: "Stand out",
    sub: "with Google Ads",
    description: "Capture attention with stunning visuals across millions of sites.",
    color: "#ea4335",
    badge: "Display Ads",
    mockup: "display",
  },
  {
    headline: "Be found",
    sub: "with Google Ads",
    description: "Show up when people search for products like yours on Google.",
    color: "#fbbc05",
    badge: "Shopping Ads",
    mockup: "shopping",
  },
  {
    headline: "Show up",
    sub: "with Google Ads",
    description: "Reach people watching YouTube with compelling video ads.",
    color: "#34a853",
    badge: "Video Ads",
    mockup: "video",
  },
];

function SearchMockup({ color }: { color: string }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-2xl" style={{ background: "#fff", maxWidth: 420 }}>
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#f1f3f4", borderBottom: "1px solid #dadce0" }}>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ background: "#ea4335" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#fbbc05" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#34a853" }} />
        </div>
        <div className="flex-1 rounded-full px-3 py-1 text-xs" style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0" }}>
          google.com/search?q=running+shoes
        </div>
      </div>
      {/* Search content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg width="24" height="24" viewBox="0 0 272 92" fill="none">
            <path d="M35.29 41.41V32h34.51c.34 1.76.51 3.85.51 6.11 0 7.59-2.08 16.97-8.74 23.63-6.49 6.74-14.74 10.33-25.72 10.33C16.22 72.07 0 56.36 0 36.78 0 17.2 16.22 1.49 35.85 1.49c11.23 0 19.22 4.41 25.21 10.07l-7.1 7.1c-4.29-4.03-10.1-7.17-18.11-7.17-14.8 0-26.37 11.91-26.37 26.29 0 14.38 11.57 26.29 26.37 26.29 9.59 0 15.06-3.86 18.56-7.36 2.85-2.85 4.72-6.93 5.46-12.51H35.29z" fill="#4285F4"/>
          </svg>
          <span className="text-sm font-medium" style={{ color: "#202124" }}>running shoes</span>
        </div>
        {/* Ad result */}
        <div className="mb-3 p-3 rounded-lg" style={{ border: `2px solid ${color}`, background: "#fafafa" }}>
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs px-1 rounded" style={{ background: color, color: "#fff", fontWeight: 700 }}>Ad</span>
            <span className="text-xs" style={{ color: "#5f6368" }}>· bestrunners.com</span>
          </div>
          <p className="text-sm font-medium" style={{ color: color }}>Premium Running Shoes – Free Shipping Today</p>
          <p className="text-xs mt-1" style={{ color: "#5f6368" }}>Top-rated running shoes for all terrains. Shop 500+ styles with free returns.</p>
        </div>
        {/* Organic result */}
        <div className="mb-3 p-2">
          <p className="text-xs" style={{ color: "#5f6368" }}>runnersworld.com › best-running-shoes</p>
          <p className="text-sm font-medium" style={{ color: "#1a0dab" }}>Best Running Shoes of 2025</p>
          <p className="text-xs mt-1" style={{ color: "#5f6368" }}>Expert tested and reviewed top running shoes...</p>
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
          recipe-site.com/pasta-recipes
        </div>
      </div>
      <div className="p-4 relative">
        <div className="text-xs mb-2" style={{ color: "#5f6368" }}>Top 10 Pasta Recipes for Tonight</div>
        <div className="text-xs mb-4 leading-5" style={{ color: "#202124" }}>
          Looking for the perfect pasta recipe? From creamy carbonara to classic marinara, here are our top picks...
        </div>
        {/* Display Ad */}
        <div className="rounded-lg p-4 text-center" style={{ background: color }}>
          <span className="text-xs text-white opacity-70 block mb-1">Sponsored</span>
          <p className="text-white font-bold text-sm mb-1">50% Off Your First Order</p>
          <p className="text-white text-xs mb-3 opacity-90">Shop premium products with free delivery</p>
          <div className="rounded px-4 py-1 inline-block text-xs font-medium" style={{ background: "#fff", color: color }}>
            Shop Now
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingMockup({ color }: { color: string }) {
  const products = [
    { name: "Runner Pro X", price: "$89.99", store: "NikeShop" },
    { name: "Speed Elite", price: "$124.00", store: "Adidas" },
    { name: "Zoom Flex", price: "$67.50", store: "FootLocker" },
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
          <span className="text-xs px-1 rounded" style={{ background: "#dadce0", color: "#5f6368" }}>Sponsored</span>
          <span className="text-xs" style={{ color: "#5f6368" }}>· Shopping results</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {products.map((p, i) => (
            <div key={i} className="rounded-lg overflow-hidden border" style={{ borderColor: i === 0 ? color : "#dadce0", borderWidth: i === 0 ? 2 : 1 }}>
              <div className="h-20 flex items-center justify-center" style={{ background: `${color}15` }}>
                <div className="w-12 h-12 rounded-full" style={{ background: color, opacity: 0.3 + i * 0.2 }} />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium leading-tight" style={{ color: "#202124" }}>{p.name}</p>
                <p className="text-xs font-bold mt-1" style={{ color: color }}>{p.price}</p>
                <p className="text-xs" style={{ color: "#5f6368" }}>{p.store}</p>
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
        {/* Video player */}
        <div className="h-48 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${color}40, ${color}80)` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.9)" }}>
              <Play size={22} style={{ color: color, marginLeft: 2 }} />
            </div>
          </div>
          {/* Ad overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.7)" }}>
            <div>
              <span className="text-xs text-white opacity-70">Ad · </span>
              <span className="text-xs text-white font-medium">BrandSpot – Watch this message</span>
            </div>
            <div className="text-xs px-2 py-1 rounded" style={{ background: color, color: "#fff" }}>Skip in 5s</div>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm font-medium" style={{ color: "#202124" }}>YouTube Ads reach 2B+ monthly viewers</p>
          <p className="text-xs mt-1" style={{ color: "#5f6368" }}>Tell your story with video on the world's largest video platform.</p>
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
      <div className="text-center py-3 text-sm" style={{ background: "#e8f0fe", color: "#1a73e8" }}>
        New to Google Ads? Get up to <strong>$500 in ad credit</strong> when you spend $500.{" "}
        <Link href="/offer" className="underline font-medium">Claim offer</Link>
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
                <h1 className="font-normal mb-2" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.1, color: slide.color }}>
                  {slide.headline}
                </h1>
                <h1 className="font-normal mb-6" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.1, color: "#202124" }}>
                  {slide.sub}
                </h1>
                <p className="mb-8 text-lg" style={{ color: "#5f6368", maxWidth: 480 }}>
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded text-white font-medium text-sm"
                style={{ background: "#1a73e8" }}
              >
                Start now
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded font-medium text-sm"
                style={{ color: "#1a73e8", border: "1px solid #1a73e8", background: "transparent" }}
              >
                Chat with Google Ads
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-3 mt-10 justify-center lg:justify-start">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: current === i ? s.color : "#f1f3f4",
                    color: current === i ? "#fff" : "#5f6368",
                  }}
                >
                  {s.badge}
                </button>
              ))}
              <button
                onClick={() => setPlaying(!playing)}
                className="p-2 rounded-full"
                style={{ background: "#f1f3f4", color: "#5f6368" }}
                aria-label={playing ? "Pause" : "Play"}
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
              { stat: "1B+", label: "people use Google Search daily" },
              { stat: "90%", label: "of internet users reached by Display Ads" },
              { stat: "8x", label: "return on ad spend on average" },
              { stat: "2B+", label: "monthly YouTube active users" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-normal mb-2" style={{ color: "#1a73e8" }}>{item.stat}</div>
                <div className="text-sm" style={{ color: "#5f6368" }}>{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
