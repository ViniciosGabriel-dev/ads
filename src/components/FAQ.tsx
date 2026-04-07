"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "What types of Google Ads campaigns can I run?",
    answer: "Google Ads offers several campaign types to match your marketing goals: Search campaigns (text ads on Google Search), Display campaigns (visual ads across the web), Shopping campaigns (product listings on Google), Video campaigns (ads on YouTube), App campaigns (promote your mobile app), and Performance Max campaigns (AI-powered campaigns across all Google channels). Each type serves different business objectives and reaches customers at different stages of their journey.",
  },
  {
    question: "Is Google Ads right for my business?",
    answer: "Google Ads works for businesses of all sizes — from local service providers to global e-commerce stores. If your customers search for products or services like yours online, Google Ads can help you reach them. You control your budget (starting from any amount), only pay when someone clicks your ad, and can pause or stop campaigns at any time. Over 1 million businesses worldwide use Google Ads to grow.",
  },
  {
    question: "How does Google AI help improve my ads?",
    answer: "Google AI powers many features across Google Ads to help you get better results automatically. Smart Bidding uses machine learning to optimize your bids in real time for each auction. Performance Max automatically finds your best-performing ad combinations across all Google channels. Responsive Search Ads test different headlines and descriptions to find what resonates best with your audience. Google AI learns from your campaign data to continuously improve performance over time.",
  },
  {
    question: "How do I target the right audience with Google Ads?",
    answer: "Google Ads provides powerful targeting options to reach your ideal customers: Keywords (show ads when people search specific terms), Location targeting (local, regional, or global), Demographics (age, gender, household income), Interests & intent (people interested in or actively researching your category), Remarketing (re-engage past website visitors), Customer Match (target existing customers by email list), and Similar audiences (reach new people who resemble your best customers).",
  },
  {
    question: "How much does Google Ads cost?",
    answer: "Google Ads works on a pay-per-click (PPC) model — you only pay when someone clicks your ad. There is no minimum budget requirement. You set a daily budget cap to control spending, and you can adjust or pause your campaigns at any time. The cost per click varies by industry, competition, and keyword. On average, businesses make $2 in revenue for every $1 spent on Google Ads. New advertisers can also get ad credits of up to $500 when they start.",
  },
  {
    question: "How long does it take to see results?",
    answer: "Many advertisers see results within hours of launching their first campaign — once approved, ads can start showing immediately. However, Google recommends allowing at least 30-90 days for Smart Bidding strategies to gather data and optimize. For most businesses, you'll start seeing meaningful data and initial results within the first 2 weeks. Ongoing optimization typically leads to continuous improvement over time.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>
            Frequently asked questions
          </h2>
          <p className="text-lg" style={{ color: "#5f6368" }}>
            Have more questions?{" "}
            <Link href="/support" className="underline" style={{ color: "#1a73e8" }}>
              Visit our Help Center
            </Link>
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #dadce0" }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                style={{ background: open === i ? "#f8f9fa" : "#fff" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium pr-4" style={{ color: "#202124", fontSize: 16 }}>
                  {faq.question}
                </span>
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: open === i ? "#1a73e8" : "#f1f3f4" }}>
                  {open === i
                    ? <Minus size={16} color="#fff" />
                    : <Plus size={16} color="#5f6368" />
                  }
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-6 pb-5 pt-1 text-sm leading-relaxed" style={{ color: "#5f6368", borderTop: "1px solid #dadce0" }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
