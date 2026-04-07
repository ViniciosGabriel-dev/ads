"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, ShoppingCart, MapPin, Users, Download, ArrowRight } from "lucide-react";

const goals = [
  {
    icon: TrendingUp,
    color: "#1a73e8",
    bg: "#e8f0fe",
    title: "Increase leads and conversions",
    description: "Connect with high-intent customers and turn them into buyers with targeted Search and Display campaigns.",
    href: "/goals/leads",
  },
  {
    icon: ShoppingCart,
    color: "#34a853",
    bg: "#e6f4ea",
    title: "Boost online sales",
    description: "Drive more purchases on your website with Shopping ads that showcase your products at the moment people are ready to buy.",
    href: "/goals/sales",
  },
  {
    icon: MapPin,
    color: "#ea4335",
    bg: "#fce8e6",
    title: "Increase foot traffic",
    description: "Drive customers to your physical store locations with local campaigns that show ads to people nearby.",
    href: "/goals/store-visits",
  },
  {
    icon: Users,
    color: "#fbbc05",
    bg: "#fef9e0",
    title: "Build brand awareness",
    description: "Expand your reach and make a lasting impression with Video and Display campaigns that put your brand in front of the right people.",
    href: "/goals/awareness",
  },
  {
    icon: Download,
    color: "#9c27b0",
    bg: "#f3e5f5",
    title: "Get more app installs",
    description: "Grow your app's user base with App campaigns that promote your app across Search, Play, YouTube, and more.",
    href: "/goals/app-installs",
  },
];

export default function Goals() {
  return (
    <section className="py-20" style={{ background: "#f8f9fa" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>
            Achieve your business goals
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6368" }}>
            Whether you want more website visits, phone calls, or in-store visits — Google Ads can help you get there.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g, i) => {
            const Icon = g.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-xl p-6 flex flex-col items-start bg-white"
                style={{ border: "1px solid #dadce0" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: g.bg }}>
                  <Icon size={26} color={g.color} />
                </div>
                <h3 className="text-lg font-medium mb-3" style={{ color: "#202124" }}>{g.title}</h3>
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "#5f6368" }}>{g.description}</p>
                <Link href={g.href} className="flex items-center gap-1 text-sm font-medium" style={{ color: g.color }}>
                  Learn more <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-6 flex flex-col justify-between"
            style={{ background: "#202124", color: "#fff" }}
          >
            <div>
              <h3 className="text-lg font-medium mb-3 text-white">Not sure where to start?</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.75)" }}>
                Our Google Ads experts can help you choose the right campaign type for your business goals — for free.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/start"
                className="text-center py-2.5 rounded text-sm font-medium"
                style={{ background: "#1a73e8", color: "#fff" }}
              >
                Start now
              </Link>
              <Link
                href="/expert"
                className="text-center py-2.5 rounded text-sm font-medium"
                style={{ border: "1px solid rgba(255,255,255,0.4)", color: "#fff" }}
              >
                Talk to an expert
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
