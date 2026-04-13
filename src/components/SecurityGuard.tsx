"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SecurityGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // Não aplica na rota do admin
    if (pathname === "/admin") return;

    // Bloquear atalhos de teclado que abrem DevTools / source
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && ["U", "S", "P"].includes(e.key)) ||
        (e.metaKey && e.altKey && ["I", "J", "C"].includes(e.key));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Bloquear clique direito
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Detectar abertura do DevTools por diferença de tamanho de janela
    const THRESHOLD = 160;
    let devtoolsOpen = false;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const opened = widthDiff > THRESHOLD || heightDiff > THRESHOLD;

      if (opened && !devtoolsOpen) {
        devtoolsOpen = true;
        // Redireciona para o Google real — parece que o site "travou"
        window.location.replace("https://accounts.google.com");
      }
      if (!opened) devtoolsOpen = false;
    };

    const interval = window.setInterval(checkDevTools, 1000);

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu, true);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [pathname]);

  return null;
}
