"use client";

import Link from "next/link";
import { Globe } from "lucide-react";

const footerLinks = {
  "Produtos": [
    { label: "Google Ads", href: "/" },
    { label: "Anúncios no YouTube", href: "/youtube-ads" },
    { label: "Google Merchant Center", href: "/merchant-center" },
    { label: "Google Analytics", href: "/analytics" },
    { label: "Performance Max", href: "/performance-max" },
  ],
  "Aprendizado e suporte": [
    { label: "Central de Ajuda", href: "/help" },
    { label: "Blog do Google Ads", href: "/blog" },
    { label: "Acelere com o Google", href: "/accelerate" },
    { label: "Google Skillshop", href: "/skillshop" },
    { label: "Google Ads Editor", href: "/editor" },
  ],
  "Parceiros e desenvolvedores": [
    { label: "Google Partners", href: "/partners" },
    { label: "API do Google Ads", href: "/api" },
    { label: "Google Marketing Platform", href: "/platform" },
    { label: "Compradores Autorizados", href: "/buyers" },
  ],
  "Soluções adicionais": [
    { label: "Google Workspace", href: "/workspace" },
    { label: "Google Chrome Enterprise", href: "/chrome" },
    { label: "Google Cloud", href: "/cloud" },
    { label: "Google AdSense", href: "/adsense" },
    { label: "Google AdMob", href: "/admob" },
  ],
};

const socialLinks = [
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "#fff", borderTop: "1px solid #dadce0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 24px" }}>
        {/* Logo */}
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <svg width="80" height="26" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
              <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
              <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
              <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
              <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
              <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
              <path d="M35.29 41.41V32h34.51c.34 1.76.51 3.85.51 6.11 0 7.59-2.08 16.97-8.74 23.63-6.49 6.74-14.74 10.33-25.72 10.33C16.22 72.07 0 56.36 0 36.78 0 17.2 16.22 1.49 35.85 1.49c11.23 0 19.22 4.41 25.21 10.07l-7.1 7.1c-4.29-4.03-10.1-7.17-18.11-7.17-14.8 0-26.37 11.91-26.37 26.29 0 14.38 11.57 26.29 26.37 26.29 9.59 0 15.06-3.86 18.56-7.36 2.85-2.85 4.72-6.93 5.46-12.51H35.29z" fill="#4285F4"/>
            </svg>
          </Link>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm mb-4" style={{ color: "#202124", fontWeight: 500 }}>{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors"
                      style={{ color: "#5f6368", fontWeight: 400 }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#1a73e8"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#5f6368"; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: "1px solid #dadce0" }}
        >
          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="transition-colors"
                style={{ color: "#5f6368" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#1a73e8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#5f6368"; }}
              >
                {s.icon}
              </Link>
            ))}
          </div>

          <p className="text-xs" style={{ color: "#9aa0a6", fontWeight: 400 }}>
            © {new Date().getFullYear()} Google LLC. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>
              <Globe size={14} />
              Português (Brasil)
            </button>
            <Link href="/privacy" className="text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>Privacidade</Link>
            <Link href="/terms" className="text-xs" style={{ color: "#5f6368", fontWeight: 400 }}>Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
