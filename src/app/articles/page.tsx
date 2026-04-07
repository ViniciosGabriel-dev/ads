"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";

const articles = [
  {
    category: "Case Study",
    categoryColor: "#1a73e8",
    title: "How BloomBotanics achieved 23x ROI with Google Search Ads",
    excerpt: "A small e-commerce flower shop scaled from local to national with targeted Search campaigns. Here's how they did it.",
    readTime: "5 min read",
    image: "#e8f0fe",
  },
  {
    category: "Case Study",
    categoryColor: "#34a853",
    title: "TechFlow SaaS grew 400% using Performance Max campaigns",
    excerpt: "B2B software company TechFlow leveraged AI-powered Performance Max to reach decision-makers across Google's network.",
    readTime: "7 min read",
    image: "#e6f4ea",
  },
  {
    category: "Guide",
    categoryColor: "#ea4335",
    title: "The beginner's guide to Google Search Ads",
    excerpt: "Everything you need to know to launch your first Search campaign — from keyword research to bid strategies.",
    readTime: "10 min read",
    image: "#fce8e6",
  },
  {
    category: "Case Study",
    categoryColor: "#fbbc05",
    title: "StyleHouse Fashion: 150% YoY revenue growth with Shopping Ads",
    excerpt: "Online retailer StyleHouse used Google Shopping Ads to put their products in front of shoppers at the exact right moment.",
    readTime: "6 min read",
    image: "#fef9e0",
  },
  {
    category: "Guide",
    categoryColor: "#9c27b0",
    title: "How to use Smart Bidding to maximize conversions",
    excerpt: "Learn how Google's AI-powered bidding strategies can automatically optimize your bids to get more results at the right price.",
    readTime: "8 min read",
    image: "#f3e5f5",
  },
  {
    category: "Case Study",
    categoryColor: "#ea4335",
    title: "FreshBite Foods: 675% ROAS with YouTube Video Ads",
    excerpt: "Food brand FreshBite Foods connected with new audiences at scale using YouTube TrueView ads and brand awareness campaigns.",
    readTime: "5 min read",
    image: "#fce8e6",
  },
  {
    category: "Guide",
    categoryColor: "#1a73e8",
    title: "Remarketing 101: Re-engage your website visitors",
    excerpt: "How to set up remarketing campaigns that bring back visitors who didn't convert the first time — and turn them into customers.",
    readTime: "9 min read",
    image: "#e8f0fe",
  },
  {
    category: "Guide",
    categoryColor: "#34a853",
    title: "Measuring ROI: A complete guide to conversion tracking",
    excerpt: "Set up conversion tracking to measure phone calls, purchases, form submissions, and more — and prove the value of your ads.",
    readTime: "12 min read",
    image: "#e6f4ea",
  },
];

const categories = ["All", "Case Studies", "Guides", "Tips & Tricks", "Product Updates"];

export default function ArticlesPage() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-16 text-center" style={{ background: "#f8f9fa", borderBottom: "1px solid #dadce0" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-normal mb-4" style={{ color: "#202124" }}>Articles & case studies</h1>
            <p className="text-lg" style={{ color: "#5f6368" }}>
              Real stories, expert guides, and tips to help you get the most out of Google Ads.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter tabs */}
      <section style={{ background: "#fff", borderBottom: "1px solid #dadce0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {categories.map((cat, i) => (
              <button
                key={i}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: i === 0 ? "#1a73e8" : "transparent",
                  color: i === 0 ? "#fff" : "#5f6368",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-16" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <Link href="#" className="block rounded-xl overflow-hidden h-full" style={{ border: "1px solid #dadce0", textDecoration: "none" }}>
                  {/* Image placeholder */}
                  <div className="h-40 flex items-center justify-center" style={{ background: article.image }}>
                    <div className="w-16 h-16 rounded-full" style={{ background: article.categoryColor, opacity: 0.2 }} />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${article.categoryColor}15`, color: article.categoryColor }}>
                      {article.category}
                    </span>
                    <h3 className="font-medium mt-3 mb-2 leading-tight" style={{ color: "#202124", fontSize: 15 }}>{article.title}</h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "#5f6368" }}>{article.excerpt}</p>
                    <span className="text-xs" style={{ color: "#9aa0a6" }}>{article.readTime}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
