"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Search, Check, ArrowRight } from "lucide-react";

export default function SearchAdsPage() {
  return (
    <PageLayout>
      <section className="py-20" style={{ background: "linear-gradient(135deg, #e8f0fe 0%, #fff 60%)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div className="flex-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm mb-6" style={{ background: "#e8f0fe", color: "#1a73e8" }}>
                <Search size={14} />
                Search Ads
              </div>
              <h1 className="text-5xl font-normal mb-6" style={{ color: "#202124" }}>
                Reach people when they&apos;re searching for you
              </h1>
              <p className="text-xl mb-8" style={{ color: "#5f6368" }}>
                Show your ads to people actively searching for products or services like yours. Only pay when someone clicks.
              </p>
              <div className="flex gap-3">
                <Link href="/start" className="px-6 py-3 rounded text-white font-medium" style={{ background: "#1a73e8" }}>Start now</Link>
                <Link href="/how-it-works" className="px-6 py-3 rounded font-medium" style={{ color: "#1a73e8", border: "1px solid #1a73e8" }}>How it works</Link>
              </div>
            </motion.div>

            <motion.div className="flex-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {/* Search ad mockup */}
              <div className="rounded-2xl overflow-hidden shadow-xl" style={{ background: "#fff", border: "1px solid #dadce0" }}>
                <div className="p-4" style={{ background: "#f8f9fa", borderBottom: "1px solid #dadce0" }}>
                  <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ background: "#fff", border: "1px solid #dadce0" }}>
                    <Search size={14} color="#9aa0a6" />
                    <span className="text-sm" style={{ color: "#202124" }}>running shoes for women</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {[
                    { domain: "bestshoes.com", title: "Women's Running Shoes – 40% Off Today Only", desc: "Premium running shoes for all distances. Free shipping on orders $50+. Shop 200+ styles.", sponsored: true },
                    { domain: "runnersworld.com", title: "Best Women's Running Shoes 2025", desc: "Expert tested and reviewed. Find the perfect running shoe for your stride.", sponsored: false },
                  ].map((r, i) => (
                    <div key={i} className="pb-3" style={{ borderBottom: i === 0 ? "1px solid #dadce0" : "none" }}>
                      <div className="flex items-center gap-1 mb-1">
                        {r.sponsored && <span className="text-xs px-1 rounded" style={{ background: "#1a73e8", color: "#fff", fontWeight: 700 }}>Sponsored</span>}
                        <span className="text-xs" style={{ color: "#5f6368" }}>· {r.domain}</span>
                      </div>
                      <p className="text-sm font-medium" style={{ color: "#1a0dab" }}>{r.title}</p>
                      <p className="text-xs mt-1" style={{ color: "#5f6368" }}>{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <h2 className="text-3xl font-normal text-center mb-10" style={{ color: "#202124" }}>Why Search Ads?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "High purchase intent", desc: "People searching on Google are actively looking for solutions — making them far more likely to convert than passive audiences." },
              { title: "Pay per click only", desc: "You only pay when someone clicks your ad. You're not charged just for showing up in search results." },
              { title: "Keyword control", desc: "Choose exactly which search terms trigger your ads. Add negative keywords to avoid irrelevant clicks." },
              { title: "Instant visibility", desc: "Your ads can appear at the top of Google Search results within hours of campaign launch." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 p-5 rounded-xl"
                style={{ background: "#f8f9fa" }}
              >
                <Check size={18} color="#1a73e8" className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium mb-1" style={{ color: "#202124" }}>{item.title}</h4>
                  <p className="text-sm" style={{ color: "#5f6368" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/start" className="inline-flex items-center gap-2 px-8 py-3 rounded text-white font-medium" style={{ background: "#1a73e8" }}>
              Launch your Search campaign <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
