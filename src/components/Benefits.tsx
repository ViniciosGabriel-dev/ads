"use client";

import { motion } from "framer-motion";
import { Globe, BarChart3, DollarSign } from "lucide-react";

const benefits = [
  {
    icon: Globe,
    color: "#1a73e8",
    title: "Reach the right customers",
    description: "Show your ads to the right people at the right time. Google Ads gives you control over who sees your ads — by location, language, interests, device, and more.",
    points: [
      "Target by keyword, location, demographics",
      "Reach people on Google Search, YouTube, Gmail & more",
      "Advertise globally or just in your neighborhood",
    ],
  },
  {
    icon: BarChart3,
    color: "#34a853",
    title: "Measure and optimize results",
    description: "Know exactly what's working. Track clicks, calls, website visits, and sales — then use Google's AI to automatically optimize your campaigns.",
    points: [
      "Real-time performance reporting",
      "Smart bidding powered by Google AI",
      "Conversion tracking for calls, purchases & more",
    ],
  },
  {
    icon: DollarSign,
    color: "#fbbc05",
    title: "Control your budget",
    description: "Start with any budget and only pay when someone clicks your ad. Set a daily budget cap so you never overspend — and adjust any time.",
    points: [
      "No minimum spend required",
      "Only pay per click (PPC) or impression",
      "Set and change budgets at any time",
    ],
  },
];

export default function Benefits() {
  return (
    <section className="py-20" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>
            Why Google Ads?
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6368" }}>
            Google Ads gives businesses of all sizes the tools to grow — from local shops to global brands.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="flex justify-center lg:justify-start mb-5">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${b.color}15` }}>
                    <Icon size={30} color={b.color} />
                  </div>
                </div>
                <h3 className="text-2xl font-normal mb-4" style={{ color: "#202124" }}>{b.title}</h3>
                <p className="text-base mb-5 leading-relaxed" style={{ color: "#5f6368" }}>{b.description}</p>
                <ul className="space-y-2">
                  {b.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "#5f6368" }}>
                      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill={b.color}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom graphic strip */}
        <motion.div
          className="mt-20 rounded-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ background: "linear-gradient(135deg, #1a73e8 0%, #174ea6 50%, #0d47a1 100%)" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between px-10 py-10 gap-6">
            <div className="text-white">
              <h3 className="text-2xl font-normal mb-2">Google AI works for you</h3>
              <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 480, fontSize: 15 }}>
                Smart Bidding uses machine learning to automatically optimize bids for each auction — helping you get more conversions at the right price.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-center shrink-0">
              <div className="text-white">
                <div className="text-5xl font-light">70%</div>
                <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>of advertisers see more conversions with Smart Bidding</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
