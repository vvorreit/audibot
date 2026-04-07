export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAudit";
import { prisma } from "@/lib/db";
import { encrypt, tryDecrypt } from "@/lib/serverCrypto";

/**
 * POST /api/admin/migrate-bank-tokens
 * One-time migration: encrypts plaintext bank tokens with AES-256-GCM.
 * Safe to run multiple times — skips already-encrypted tokens.
 */
export async function POST() {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connections = await (prisma as any).bankConnection.findMany({
    select: { id: true, accessToken: true, refreshToken: true },
    take: 5000,
  });

  let migrated = 0;
  let skipped = 0;

  for (const conn of connections) {
    // Si tryDecrypt réussit, le token est déjà chiffré → skip
    if (tryDecrypt(conn.accessToken) !== null) {
      skipped++;
      continue;
    }

    const data: Record<string, string> = {
      accessToken: encrypt(conn.accessToken),
    };
    if (conn.refreshToken && tryDecrypt(conn.refreshToken) === null) {
      data.refreshToken = encrypt(conn.refreshToken);
    }

    await (prisma as any).bankConnection.update({
      where: { id: conn.id },
      data,
    });
    migrated++;
  }

  return NextResponse.json({ ok: true, migrated, skipped, total: connections.length });
}
