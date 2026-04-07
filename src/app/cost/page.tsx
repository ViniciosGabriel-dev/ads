"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Check, DollarSign, TrendingUp, Shield, ChevronRight } from "lucide-react";

const budgetFacts = [
  { icon: DollarSign, title: "No minimum budget", desc: "Start with as little as $1/day. Scale up as you see results." },
  { icon: Shield, title: "Never overspend", desc: "Set a daily budget cap. Google Ads never exceeds your limit." },
  { icon: TrendingUp, title: "Only pay for results", desc: "Pay per click (PPC) — you're only charged when someone clicks." },
];

const tiers = [
  {
    label: "Getting started",
    range: "$10–$50/day",
    ideal: "Local businesses, solo entrepreneurs",
    features: ["Search & Display ads", "Basic keyword targeting", "Location targeting", "Performance reports"],
    color: "#34a853",
  },
  {
    label: "Growing",
    range: "$50–$500/day",
    ideal: "SMBs scaling customer acquisition",
    features: ["All ad formats", "Smart Bidding AI", "Remarketing campaigns", "Conversion tracking", "A/B ad testing"],
    color: "#1a73e8",
    popular: true,
  },
  {
    label: "Enterprise",
    range: "$500+/day",
    ideal: "Established brands and e-commerce",
    features: ["Performance Max", "Shopping & YouTube ads", "Customer Match targeting", "Advanced audience insights", "Dedicated account support", "API access"],
    color: "#ea4335",
  },
];

export default function CostPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-20 text-center" style={{ background: "linear-gradient(180deg, #f8f9fa 0%, #fff 100%)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-normal mb-6" style={{ color: "#202124" }}>
              Google Ads pricing
            </h1>
            <p className="text-xl mb-4" style={{ color: "#5f6368" }}>
              There&apos;s no minimum spend. You set your budget, and you only pay when your ad gets results.
            </p>
            <p className="text-base" style={{ color: "#9aa0a6" }}>
              On average, businesses make $2 for every $1 spent on Google Ads.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Budget facts */}
      <section className="py-16" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {budgetFacts.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6"
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f0fe" }}>
                    <Icon size={24} color="#1a73e8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "#202124" }}>{f.title}</h3>
                  <p className="text-sm" style={{ color: "#5f6368" }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16" style={{ background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <h2 className="text-3xl font-normal text-center mb-12" style={{ color: "#202124" }}>
            Common budget ranges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl p-8 relative"
                style={{
                  background: "#fff",
                  border: tier.popular ? `2px solid ${tier.color}` : "1px solid #dadce0",
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: tier.color }}>
                    Most common
                  </div>
                )}
                <div className="text-sm font-medium mb-1" style={{ color: tier.color }}>{tier.label}</div>
                <div className="text-3xl font-light mb-1" style={{ color: "#202124" }}>{tier.range}</div>
                <div className="text-sm mb-6" style={{ color: "#5f6368" }}>Ideal for: {tier.ideal}</div>
                <ul className="space-y-3">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: "#5f6368" }}>
                      <Check size={14} color={tier.color} strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/start"
                  className="mt-6 block text-center py-2.5 rounded text-sm font-medium"
                  style={{ background: tier.popular ? tier.color : "transparent", color: tier.popular ? "#fff" : tier.color, border: tier.popular ? "none" : `1px solid ${tier.color}` }}
                >
                  Get started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CPC explainer */}
      <section className="py-16" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <h2 className="text-3xl font-normal mb-6" style={{ color: "#202124" }}>How pay-per-click works</h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#5f6368" }}>
            With Google Ads, you bid on keywords. When someone searches for those keywords and clicks your ad, you pay your bid amount (or less — you never pay more than your max bid). The average cost per click varies by industry, typically ranging from $0.11 to $4+ depending on competition. You control your max CPC bid and daily budget cap at all times.
          </p>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { label: "Avg. CPC across industries", value: "$1–$4" },
              { label: "Average ROI", value: "2x spend" },
              { label: "Time to first results", value: "< 1 day" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: "#f8f9fa" }}>
                <div className="text-2xl font-light mb-1" style={{ color: "#1a73e8" }}>{stat.value}</div>
                <div className="text-xs" style={{ color: "#5f6368" }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/start" className="inline-flex items-center gap-2 px-8 py-3 rounded text-white font-medium" style={{ background: "#1a73e8" }}>
              Start with any budget <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
