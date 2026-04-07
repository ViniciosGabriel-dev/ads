"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Visão geral", href: "/" },
  { label: "Objetivos", href: "/goals" },
  { label: "Como funciona", href: "/how-it-works" },
  { label: "Custo", href: "/cost" },
  { label: "Artigos e estudos de caso", href: "/articles" },
  { label: "Suporte especializado", href: "/support" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-shadow duration-300"
      style={{
        background: "#fff",
        boxShadow: scrolled ? "0 2px 8px rgba(0,0,0,0.12)" : "0 1px 0 #dadce0",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg width="92" height="30" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
            <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
            <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
            <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
            <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
            <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
            <path d="M35.29 41.41V32h34.51c.34 1.76.51 3.85.51 6.11 0 7.59-2.08 16.97-8.74 23.63-6.49 6.74-14.74 10.33-25.72 10.33C16.22 72.07 0 56.36 0 36.78 0 17.2 16.22 1.49 35.85 1.49c11.23 0 19.22 4.41 25.21 10.07l-7.1 7.1c-4.29-4.03-10.1-7.17-18.11-7.17-14.8 0-26.37 11.91-26.37 26.29 0 14.38 11.57 26.29 26.37 26.29 9.59 0 15.06-3.86 18.56-7.36 2.85-2.85 4.72-6.93 5.46-12.51H35.29z" fill="#4285F4"/>
          </svg>
          <span style={{ fontSize: 13, color: "#5f6368", fontWeight: 400, marginTop: 2 }}>Ads</span>
        </Link>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Phone */}
          <a
            href="tel:08007248349"
            className="flex items-center gap-2 text-sm"
            style={{ color: "#1a73e8", fontWeight: 400, whiteSpace: "nowrap" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a73e8">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            0800 724 8349
          </a>

          {/* Acesse sua conta */}
          <Link
            href="/signin"
            className="text-sm px-5 py-2 transition-colors"
            style={{ color: "#1a73e8", border: "1px solid #dadce0", borderRadius: 24, fontWeight: 400, background: "#fff" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8f9fa"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}
          >
            Acesse sua conta
          </Link>

          {/* Começar agora */}
          <Link
            href="/signin"
            className="text-sm px-6 py-2 text-white"
            style={{ background: "#1a73e8", borderRadius: 24, fontWeight: 500 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1557b0"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#1a73e8"; }}
          >
            Começar agora
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: "#fff", borderTop: "1px solid #dadce0" }}
          >
            <nav className="flex flex-col px-4 py-3 gap-2">
              <a href="tel:08007248349" className="px-3 py-2 text-sm flex items-center gap-2" style={{ color: "#1a73e8", fontWeight: 400 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a73e8"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                0800 724 8349
              </a>
              <Link href="/signin" className="px-3 py-2 text-sm text-center" style={{ color: "#1a73e8", border: "1px solid #dadce0", borderRadius: 24, fontWeight: 400 }}>Acesse sua conta</Link>
              <Link href="/signin" className="px-3 py-2 text-sm text-center text-white" style={{ background: "#1a73e8", borderRadius: 24, fontWeight: 500 }}>Começar agora</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
