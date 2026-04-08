export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireBankAccess } from "@/lib/bank/access";
import { getProvider } from "@/lib/bank/provider";
import type { BankProviderName } from "@/lib/bank/types";
import { encrypt } from "@/lib/serverCrypto";
import { z } from "zod";
import { parseBody } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";

const connectSchema = z.object({
  provider: z.enum(["bridge", "powens"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireBankAccess();

    const allowed = await rateLimit(`bank-connect:${user.id}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
    }

    const data = await parseBody(req, connectSchema);
    if (data instanceof NextResponse) return data;

    const providerName = data.provider;
    const provider = getProvider(providerName);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/bank/callback`;

    // State chiffré avec serverCrypto (AES-256-GCM) — expire dans 15 min
    const statePayload = JSON.stringify({
      userId: user.id,
      provider: providerName,
      exp: Date.now() + 15 * 60 * 1000,
    });
    const state = encrypt(statePayload);

    const url = await provider.createConnectUrl({
      email: user.email,
      redirectUri,
      state,
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("[bank/connect]", err);
    if (err.message?.includes("plan Pro")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 });
  }
}
