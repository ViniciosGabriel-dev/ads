"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import { Phone, Calendar, MessageCircle, BookOpen, Video, Users } from "lucide-react";

const supportOptions = [
  {
    icon: Phone,
    color: "#34a853",
    title: "Call a Google Ads expert",
    desc: "Speak directly with a specialist who can walk you through setup, optimization, and strategy.",
    cta: "Call now",
    href: "tel:1-866-246-6453",
    sub: "Mon–Fri, 9am–9pm ET",
  },
  {
    icon: Calendar,
    color: "#1a73e8",
    title: "Schedule a free consultation",
    desc: "Book a 1-on-1 session with a Google Ads expert at a time that works for you.",
    cta: "Book a meeting",
    href: "/schedule",
    sub: "Free, no commitment",
  },
  {
    icon: MessageCircle,
    color: "#fbbc05",
    title: "Chat with support",
    desc: "Get quick answers from our support team via live chat, available during business hours.",
    cta: "Start chat",
    href: "/chat",
    sub: "Typical response: under 2 min",
  },
];

const selfServe = [
  {
    icon: BookOpen,
    color: "#1a73e8",
    title: "Help Center",
    desc: "Find step-by-step guides for every Google Ads feature.",
    href: "/help",
  },
  {
    icon: Video,
    color: "#ea4335",
    title: "Video tutorials",
    desc: "Learn at your own pace with our library of tutorial videos.",
    href: "/videos",
  },
  {
    icon: Users,
    color: "#34a853",
    title: "Community forum",
    desc: "Connect with other advertisers and Google Ads experts.",
    href: "/community",
  },
];

export default function SupportPage() {
  return (
    <PageLayout>
      <section className="py-20 text-center" style={{ background: "linear-gradient(180deg, #f8f9fa 0%, #fff 60%)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-normal mb-6" style={{ color: "#202124" }}>Expert support</h1>
            <p className="text-xl" style={{ color: "#5f6368" }}>
              Our Google Ads specialists are here to help you every step of the way — for free.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportOptions.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl p-8 text-center"
                  style={{ border: "1px solid #dadce0" }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${opt.color}15` }}>
                    <Icon size={28} color={opt.color} />
                  </div>
                  <h3 className="text-lg font-medium mb-3" style={{ color: "#202124" }}>{opt.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "#5f6368" }}>{opt.desc}</p>
                  <Link
                    href={opt.href}
                    className="block w-full py-2.5 rounded text-sm font-medium text-center text-white"
                    style={{ background: opt.color }}
                  >
                    {opt.cta}
                  </Link>
                  <p className="text-xs mt-2" style={{ color: "#9aa0a6" }}>{opt.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: "#f8f9fa" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <h2 className="text-3xl font-normal text-center mb-10" style={{ color: "#202124" }}>Self-service resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selfServe.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={r.href} className="flex items-start gap-4 p-5 rounded-xl bg-white" style={{ border: "1px solid #dadce0", textDecoration: "none" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${r.color}15` }}>
                      <Icon size={20} color={r.color} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1" style={{ color: "#202124" }}>{r.title}</h4>
                      <p className="text-sm" style={{ color: "#5f6368" }}>{r.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
