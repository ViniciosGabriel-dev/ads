"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Search, Target, BarChart3, Zap, ChevronRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Target,
    color: "#1a73e8",
    title: "Choose your goal",
    description: "Tell Google Ads what you want to achieve — more website visits, phone calls, store visits, sales, or app downloads. Your goal determines which campaign types are best suited for you.",
    detail: "Google Ads matches your goal with the right ad formats and bidding strategies automatically.",
  },
  {
    number: "02",
    icon: Search,
    color: "#34a853",
    title: "Select your audience",
    description: "Define who you want to reach. Choose by location, language, demographics, interests, and keywords. You can target locally or globally — down to a specific city radius.",
    detail: "Advanced targeting ensures your ads only appear to the people most likely to become customers.",
  },
  {
    number: "03",
    icon: Zap,
    color: "#ea4335",
    title: "Create your ads",
    description: "Write your ad text, upload images or videos, or let Google AI generate creative assets. Responsive ads automatically test combinations to find what works best for your audience.",
    detail: "Google provides guidance and previews so you can see how your ads will look before they go live.",
  },
  {
    number: "04",
    icon: BarChart3,
    color: "#fbbc05",
    title: "Set your budget & launch",
    description: "Choose how much you want to spend per day. You only pay when someone clicks your ad (PPC) or sees it (CPM). Launch your campaign and start reaching customers immediately.",
    detail: "Pause, adjust, or stop campaigns at any time. There's no long-term commitment.",
  },
];

export default function HowItWorksPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 text-center" style={{ background: "linear-gradient(135deg, #e8f0fe 0%, #fff 60%)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-normal mb-6" style={{ color: "#202124" }}>
              How Google Ads works
            </h1>
            <p className="text-xl mb-8" style={{ color: "#5f6368" }}>
              From setup to results — here&apos;s how Google Ads helps your business grow in four simple steps.
            </p>
            <Link href="/start" className="inline-flex items-center gap-2 px-8 py-3 rounded text-white font-medium" style={{ background: "#1a73e8" }}>
              Get started <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div className="space-y-16">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-6xl font-light" style={{ color: `${step.color}30` }}>{step.number}</span>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
                        <Icon size={22} color={step.color} />
                      </div>
                    </div>
                    <h2 className="text-3xl font-normal mb-4" style={{ color: "#202124" }}>{step.title}</h2>
                    <p className="text-base leading-relaxed mb-4" style={{ color: "#5f6368" }}>{step.description}</p>
                    <div className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm" style={{ background: `${step.color}10`, color: step.color }}>
                      <Zap size={14} className="mt-0.5 shrink-0" />
                      {step.detail}
                    </div>
                  </div>

                  <div className="flex-1 flex justify-center">
                    <div className="w-64 h-64 rounded-2xl flex items-center justify-center" style={{ background: `${step.color}10`, border: `2px solid ${step.color}20` }}>
                      <Icon size={80} color={step.color} strokeWidth={1} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ background: "#f8f9fa" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <h2 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>Ready to start?</h2>
          <p className="text-lg mb-8" style={{ color: "#5f6368" }}>Create your first campaign in minutes. No experience needed.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/start" className="px-8 py-3 rounded text-white font-medium" style={{ background: "#1a73e8" }}>Start now</Link>
            <Link href="/cost" className="px-8 py-3 rounded font-medium" style={{ color: "#1a73e8", border: "1px solid #1a73e8" }}>See pricing</Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
