"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Check, ChevronRight } from "lucide-react";

const goals = [
  { id: "sales", label: "Get more online sales", icon: "🛒" },
  { id: "leads", label: "Generate leads", icon: "📊" },
  { id: "traffic", label: "Increase website traffic", icon: "🌐" },
  { id: "store", label: "Drive store visits", icon: "📍" },
  { id: "brand", label: "Build brand awareness", icon: "✨" },
  { id: "app", label: "Get app installs", icon: "📱" },
];

export default function StartPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <PageLayout>
      <section className="min-h-screen py-20" style={{ background: "#f8f9fa" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    background: s <= step ? "#1a73e8" : "#dadce0",
                    color: s <= step ? "#fff" : "#5f6368",
                  }}
                >
                  {s < step ? <Check size={14} /> : s}
                </div>
                {s < 3 && <div className="h-0.5 w-12" style={{ background: s < step ? "#1a73e8" : "#dadce0" }} />}
              </div>
            ))}
            <span className="text-sm ml-2" style={{ color: "#5f6368" }}>Step {step} of 3</span>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-sm"
            style={{ border: "1px solid #dadce0" }}
          >
            {step === 1 && (
              <>
                <h1 className="text-2xl font-normal mb-2" style={{ color: "#202124" }}>What&apos;s your main advertising goal?</h1>
                <p className="text-sm mb-6" style={{ color: "#5f6368" }}>Select all that apply — you can run multiple campaigns.</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => toggle(g.id)}
                      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                      style={{
                        border: selected.includes(g.id) ? "2px solid #1a73e8" : "2px solid #dadce0",
                        background: selected.includes(g.id) ? "#e8f0fe" : "#fff",
                      }}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <span className="text-sm font-medium" style={{ color: "#202124" }}>{g.label}</span>
                      {selected.includes(g.id) && (
                        <Check size={14} color="#1a73e8" className="ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={selected.length === 0}
                  className="w-full py-3 rounded font-medium text-white transition-opacity"
                  style={{ background: "#1a73e8", opacity: selected.length === 0 ? 0.5 : 1 }}
                >
                  Continue <ChevronRight size={16} className="inline" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-normal mb-2" style={{ color: "#202124" }}>What&apos;s your monthly budget?</h1>
                <p className="text-sm mb-6" style={{ color: "#5f6368" }}>Start with any amount. You can change it anytime.</p>
                <div className="space-y-3 mb-8">
                  {[
                    { label: "Under $300/month", sub: "Great for testing and local businesses" },
                    { label: "$300–$1,500/month", sub: "Ideal for growing small businesses" },
                    { label: "$1,500–$5,000/month", sub: "Best for established SMBs" },
                    { label: "$5,000+/month", sub: "For enterprises and high-growth companies" },
                  ].map((b, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all"
                      style={{ border: "2px solid #dadce0" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1a73e8"; (e.currentTarget as HTMLElement).style.background = "#e8f0fe"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#dadce0"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                      onClick={() => setStep(3)}
                    >
                      <div>
                        <p className="font-medium text-sm" style={{ color: "#202124" }}>{b.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#5f6368" }}>{b.sub}</p>
                      </div>
                      <ChevronRight size={16} color="#5f6368" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="text-sm" style={{ color: "#5f6368" }}>← Back</button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e6f4ea" }}>
                    <Check size={28} color="#34a853" />
                  </div>
                  <h1 className="text-2xl font-normal mb-4" style={{ color: "#202124" }}>You&apos;re ready to get started!</h1>
                  <p className="text-sm mb-8" style={{ color: "#5f6368" }}>
                    Create your Google Ads account to launch your first campaign. It only takes a few minutes.
                  </p>
                  <Link
                    href="https://ads.google.com"
                    className="block w-full py-3 rounded font-medium text-white text-center mb-3"
                    style={{ background: "#1a73e8" }}
                  >
                    Create your account
                  </Link>
                  <Link href="/expert" className="block text-sm" style={{ color: "#1a73e8" }}>
                    Or talk to an expert first →
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
