"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PresenceTracker() {
  const pathname = usePathname();
  const pageIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    if (pathname === "/admin") return;
    history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname]);

  useEffect(() => {
    const pageId = pageIdRef.current;

    const sendPing = () => {
      void fetch("/api/v1/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping", pageId, page: pathname }),
      });
    };

    const sendLeave = () => {
      navigator.sendBeacon(
        "/api/v1/status",
        new Blob([JSON.stringify({ action: "leave", pageId })], { type: "application/json" }),
      );
    };

    sendPing();
    const interval = window.setInterval(sendPing, 5000);
    window.addEventListener("beforeunload", sendLeave);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", sendLeave);
      sendLeave();
    };
  }, [pathname]);

  return null;
}
