export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/bank/provider";
import type { BankProviderName } from "@/lib/bank/types";
import { decrypt, encrypt } from "@/lib/serverCrypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  const code = searchParams.get("code") || searchParams.toString();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!state) {
    return NextResponse.redirect(`${baseUrl}/tiers-payant/rapprochement?bank_error=missing_state`);
  }

  try {
    // Déchiffrer et valider le state
    const payload = JSON.parse(decrypt(state));
    if (payload.exp < Date.now()) {
      return NextResponse.redirect(`${baseUrl}/tiers-payant/rapprochement?bank_error=expired`);
    }

    const userId = payload.userId as string;
    const providerName = payload.provider as BankProviderName;

    const provider = getProvider(providerName);
    const result = await provider.handleCallback(code);

    // Créer une BankConnection par compte
    for (const account of result.accounts) {
      await (prisma as any).bankConnection.upsert({
        where: {
          provider_externalAccountId: {
            provider: providerName,
            externalAccountId: account.id,
          },
        },
        create: {
          userId,
          provider: providerName,
          externalUserId: result.externalUserId,
          externalAccountId: account.id,
          iban: account.iban,
          bankName: account.bankName,
          label: account.name,
          accessToken: encrypt(result.accessToken),
          refreshToken: result.refreshToken ? encrypt(result.refreshToken) : null,
          status: "ACTIVE",
        },
        update: {
          accessToken: encrypt(result.accessToken),
          refreshToken: result.refreshToken ? encrypt(result.refreshToken) : null,
          status: "ACTIVE",
          lastError: null,
        },
      });
    }

    return NextResponse.redirect(
      `${baseUrl}/tiers-payant/rapprochement?bank_connected=${result.accounts.length}`
    );
  } catch (err: any) {
    console.error("[bank/callback]", err);
    return NextResponse.redirect(`${baseUrl}/tiers-payant/rapprochement?bank_error=callback_failed`);
  }
}
