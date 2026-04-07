"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Calendar, MessageCircle } from "lucide-react";

export default function Support() {
  return (
    <section className="py-20" style={{ background: "#202124" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left text */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-normal mb-4 text-white">
              Let us help you get started
            </h2>
            <p className="text-lg max-w-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
              Our Google Ads specialists are available to help you set up your first campaign, optimize performance, and achieve your business goals — at no extra cost.
            </p>
          </motion.div>

          {/* Right cards */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Phone,
                title: "Call us",
                desc: "Speak directly with a Google Ads expert",
                href: "tel:1-866-246-6453",
                cta: "1-866-246-6453",
                color: "#34a853",
              },
              {
                icon: Calendar,
                title: "Schedule a meeting",
                desc: "Book a free 1-on-1 session with an expert",
                href: "/schedule",
                cta: "Book now",
                color: "#1a73e8",
              },
              {
                icon: MessageCircle,
                title: "Chat with us",
                desc: "Get instant help from our support team",
                href: "/chat",
                cta: "Start chat",
                color: "#fbbc05",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  href={item.href}
                  className="flex flex-col p-6 rounded-xl transition-all group"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", minWidth: 180 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: `${item.color}22` }}>
                    <Icon size={20} color={item.color} />
                  </div>
                  <p className="font-medium text-white mb-1 text-sm">{item.title}</p>
                  <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>{item.desc}</p>
                  <span className="text-sm font-medium" style={{ color: item.color }}>{item.cta} →</span>
                </Link>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
