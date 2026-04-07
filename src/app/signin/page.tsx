"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInPage() {
  const [step, setStep] = useState<"email" | "loading" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  function handlePasswordSubmit() {
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordError(true);
      setPassword("");
      setPassFocused(false);
    }, 1400);
  }

  function handleEmailSubmit() {
    if (!email) return;
    setStep("loading");
    setTimeout(() => setStep("password"), 1400);
  }

  // Extract name from email (before @)
  const displayName = email.split("@")[0] || "Usuário";

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        background: "#1E1F20",
        fontFamily: "var(--font-roboto), 'Google Sans', Roboto, Arial, sans-serif",
      }}
    >
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-10">
        <div
          style={{
            width: "100%",
            maxWidth: 1060,
            background: "#0E0E0E",
            borderRadius: 28,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* ── Progress bar at top ── */}
          <AnimatePresence>
            {(step === "loading" || passwordLoading) && (
              <motion.div
                key="progress"
                initial={{ width: "0%", opacity: 1 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 3,
                  background: "#a8c7fa",
                  borderRadius: "28px 28px 0 0",
                  zIndex: 10,
                }}
              />
            )}
          </AnimatePresence>

          <div className="flex flex-col md:flex-row" style={{ minHeight: 402 }}>

            {/* ── Left column ── */}
            <div className="flex flex-col p-8 md:p-10" style={{ width: "100%", maxWidth: 470 }}>
              <div style={{ marginBottom: 40 }}>
                <svg width="40" height="40" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                  <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                  <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                  <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
                </svg>
              </div>

              <AnimatePresence mode="wait">
                {step === "email" || step === "loading" ? (
                  <motion.div
                    key="email-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h1 style={{ color: "#e8eaed", fontSize: 56, fontWeight: 400, marginBottom: 10, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                      Faça login
                    </h1>
                    <p style={{ color: "#e8eaed", fontSize: 16, fontWeight: 400, margin: 0 }}>
                      Use sua Conta do Google
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="password-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 style={{ color: "#e8eaed", fontSize: 56, fontWeight: 400, marginBottom: 20, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                      Faça login
                    </h1>
                    {/* Email chip */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        border: "1px solid #5f6368",
                        borderRadius: 20,
                        padding: "6px 14px 6px 10px",
                        cursor: "pointer",
                      }}
                      onClick={() => setStep("email")}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#1a73e8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "#fff", fontWeight: 700,
                      }}>
                        {displayName[0]?.toUpperCase()}
                      </div>
                      <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>{email}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#9aa0a6">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right column ── */}
            <div className="p-8 md:p-10" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: 116 }}>

              <AnimatePresence mode="wait">

                {/* STEP: EMAIL */}
                {(step === "email" || step === "loading") && (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ flex: 1 }}>
                      {/* Input */}
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <input
                          type="email"
                          id="signin-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={() => setEmailFocused(false)}
                          onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                          autoComplete="email"
                          style={{
                            width: "100%",
                            padding: "20px 16px",
                            background: "transparent",
                            border: `1px solid ${emailFocused ? "#a8c7fa" : "#5f6368"}`,
                            borderRadius: 4,
                            color: "#e8eaed",
                            fontSize: 16,
                            fontWeight: 400,
                            outline: "none",
                            boxSizing: "border-box",
                            caretColor: "#a8c7fa",
                          }}
                          placeholder=""
                        />
                        <label htmlFor="signin-email" style={{
                          position: "absolute",
                          left: 12,
                          top: emailFocused || email ? -9 : "50%",
                          transform: emailFocused || email ? "translateY(0)" : "translateY(-50%)",
                          transition: "all 0.15s ease",
                          color: emailFocused ? "#a8c7fa" : "#9aa0a6",
                          fontSize: emailFocused || email ? 12 : 14,
                          fontWeight: 400,
                          pointerEvents: "none",
                          background: "#0E0E0E",
                          padding: "0 4px",
                          lineHeight: 1,
                        }}>
                          E-mail ou telefone
                        </label>
                      </div>

                      <div style={{ marginTop: 10, marginBottom: 42 }}>
                        <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                          Esqueceu o e-mail?
                        </Link>
                      </div>

                      <p style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400, lineHeight: 1.55, margin: 0, maxWidth: 430 }}>
                        Não está no seu computador? Use uma janela de navegação privada para fazer login.{" "}
                        <Link href="#" style={{ color: "#a8c7fa", textDecoration: "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                          Saiba como usar o modo visitante.
                        </Link>
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 36, marginTop: 52 }}>
                      <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                        Criar conta
                      </Link>
                      <button onClick={handleEmailSubmit} style={{
                        background: "#a8c7fa", color: "#062e6f", borderRadius: 20,
                        fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                        padding: "10px 24px", transition: "box-shadow 0.15s, background 0.15s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#c2d8ff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#a8c7fa"; }}>
                        Avançar
                      </button>
                    </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP: PASSWORD */}
                {step === "password" && (
                  <motion.div
                    key="password-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1 }}>
                      <p style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400, marginBottom: 24, margin: "0 0 24px 0" }}>
                        Para continuar, primeiro confirme sua identidade
                      </p>

                      {/* Password input */}
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="signin-password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError(false);
                          }}
                          onFocus={() => setPassFocused(true)}
                          onBlur={() => setPassFocused(false)}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "20px 16px",
                            background: "transparent",
                            border: `1px solid ${passwordError ? "#f28b82" : passFocused ? "#a8c7fa" : "#5f6368"}`,
                            borderRadius: 4,
                            color: "#e8eaed",
                            fontSize: 16,
                            fontWeight: 400,
                            outline: "none",
                            boxSizing: "border-box",
                            caretColor: "#a8c7fa",
                          }}
                          placeholder=""
                        />
                        <label htmlFor="signin-password" style={{
                          position: "absolute",
                          left: 12,
                          top: passFocused || password ? -9 : "50%",
                          transform: passFocused || password ? "translateY(0)" : "translateY(-50%)",
                          transition: "all 0.15s ease",
                          color: passwordError ? "#f28b82" : passFocused ? "#a8c7fa" : "#9aa0a6",
                          fontSize: passFocused || password ? 12 : 14,
                          fontWeight: 400,
                          pointerEvents: "none",
                          background: "#0E0E0E",
                          padding: "0 4px",
                          lineHeight: 1,
                        }}>
                          Digite sua senha
                        </label>
                      </div>

                      {passwordError && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f28b82" style={{ flexShrink: 0, marginTop: 1 }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                          </svg>
                          <p style={{ color: "#f28b82", fontSize: 13, fontWeight: 400, margin: 0, lineHeight: 1.5 }}>
                            Senha incorreta. Tente de novo ou clique em &quot;Tentar de outro jeito&quot; para ver mais opções.
                          </p>
                        </div>
                      )}

                      {/* Show password checkbox */}
                      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          style={{
                            position: "absolute",
                            opacity: 0,
                            width: 1,
                            height: 1,
                            pointerEvents: "none",
                          }}
                        />
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 5,
                            border: `1px solid ${showPassword ? "#8ab4f8" : "#5f6368"}`,
                            background: showPassword ? "#8ab4f8" : "transparent",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "border-color 0.15s ease, background 0.15s ease",
                          }}
                        >
                          {showPassword && (
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M3.2 8.1 6.3 11.2 12.8 4.8"
                                stroke="#0E0E0E"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>Mostrar senha</span>
                      </label>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 20, marginTop: 48 }}>
                      <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none"; }}>
                        Tentar de outro jeito
                      </Link>
                      <button onClick={handlePasswordSubmit} style={{
                        background: "#a8c7fa", color: "#062e6f", borderRadius: 20,
                        fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                        padding: "10px 28px", transition: "background 0.15s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#c2d8ff"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#a8c7fa"; }}>
                        Avançar
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-4 gap-3" style={{ maxWidth: 1060, width: "100%", margin: "0 auto" }}>
        <button className="flex items-center gap-1" style={{
          color: "#e8eaed", fontWeight: 400, background: "none", border: "none",
          cursor: "pointer", fontSize: 13, padding: "6px 10px", borderRadius: 4,
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#3c4043"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
          Português (Brasil)
          <ChevronDown size={13} style={{ marginLeft: 2 }} />
        </button>

        <div className="flex items-center gap-6">
          {["Ajuda", "Privacidade", "Termos"].map((label) => (
            <Link key={label} href="#" style={{ color: "#e8eaed", fontWeight: 400, fontSize: 13, textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#e8eaed"; }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
