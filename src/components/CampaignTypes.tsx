"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Monitor, ShoppingBag, Play, Smartphone, ArrowRight } from "lucide-react";

const campaigns = [
  {
    icon: Search,
    color: "#4285F4",
    bg: "#e8f0fe",
    title: "Search ads",
    subtitle: "Reach people actively searching",
    description: "Show your ads to people who are already searching for products or services like yours on Google Search. Only pay when someone clicks your ad.",
    href: "/campaign-types/search",
    stats: "Google processes 8.5 billion searches per day",
  },
  {
    icon: Monitor,
    color: "#EA4335",
    bg: "#fce8e6",
    title: "Display ads",
    subtitle: "Capture attention visually",
    description: "Reach people as they browse the web, watch YouTube videos, check Gmail, or use mobile devices and apps. Create visually engaging ads.",
    href: "/campaign-types/display",
    stats: "Reach 90% of internet users worldwide",
  },
  {
    icon: ShoppingBag,
    color: "#FBBC05",
    bg: "#fef9e0",
    title: "Shopping ads",
    subtitle: "Showcase your products",
    description: "Promote your products to people shopping online. Shopping ads appear at the top of Google Search results with images, prices, and store names.",
    href: "/campaign-types/shopping",
    stats: "Drive more sales with product listings",
  },
  {
    icon: Play,
    color: "#EA4335",
    bg: "#fce8e6",
    title: "Video ads",
    subtitle: "Tell your story with video",
    description: "Engage your audience with video ads on YouTube and across Google's video partner sites. Reach people where they spend their time watching video.",
    href: "/campaign-types/video",
    stats: "YouTube has 2B+ monthly active users",
  },
  {
    icon: Smartphone,
    color: "#34A853",
    bg: "#e6f4ea",
    title: "App ads",
    subtitle: "Grow your app's user base",
    description: "Promote your app across Google's largest properties — Search, Play, YouTube, Discover, and Google's Display Network — all in one campaign.",
    href: "/campaign-types/app",
    stats: "Reach people ready to download apps",
  },
];

export default function CampaignTypes() {
  return (
    <section className="py-20" style={{ background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>
            The right ad for every goal
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#5f6368" }}>
            Google Ads offers a variety of campaign types to help you reach your marketing goals — wherever your customers are.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="rounded-xl p-6 flex flex-col"
                style={{
                  border: "1px solid #dadce0",
                  background: "#fff",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: c.bg }}>
                  <Icon size={22} color={c.color} />
                </div>

                <h3 className="text-xl font-medium mb-1" style={{ color: "#202124" }}>{c.title}</h3>
                <p className="text-sm font-medium mb-3" style={{ color: c.color }}>{c.subtitle}</p>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "#5f6368" }}>{c.description}</p>

                {/* Stat */}
                <div className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: c.bg, color: c.color }}>
                  {c.stats}
                </div>

                <Link
                  href={c.href}
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: c.color }}
                >
                  Explore {c.title.toLowerCase()} <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}

          {/* Performance Max card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-xl p-6 md:col-span-2 lg:col-span-1"
            style={{
              background: "linear-gradient(135deg, #1a73e8 0%, #174ea6 100%)",
              color: "#fff",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.2)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-1 text-white">Performance Max</h3>
            <p className="text-sm font-medium mb-3" style={{ color: "rgba(255,255,255,0.8)" }}>AI-powered, all-in-one campaigns</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
              Let Google AI find your best-performing ads across all Google channels — Search, Display, YouTube, Gmail, Maps, and Discover — in a single campaign.
            </p>
            <Link
              href="/campaign-types/performance-max"
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Learn about Performance Max <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
