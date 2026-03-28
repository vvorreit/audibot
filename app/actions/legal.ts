"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentCgvVersion(): Promise<string> {
  return process.env.CGV_VERSION ?? "1.1";
}

export async function acceptDpa(version: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
  if (!user) throw new Error("Utilisateur introuvable");

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? null;
  const ua = headersList.get("user-agent") ?? null;

  await prisma.legalAcceptance.create({
    data: {
      userId: user.id,
      email: user.email!,
      documentType: "DPA",
      documentVersion: version,
      ipAddress: ip,
      userAgent: ua,
    },
  });

  return { ok: true };
}

export async function acceptCgv(version: string): Promise<{ ok: boolean }> {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
  if (!user) throw new Error("Utilisateur introuvable");

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headersList.get("x-real-ip") ?? null;
  const ua = headersList.get("user-agent") ?? null;

  await prisma.$transaction([
    prisma.legalAcceptance.create({
      data: {
        userId: user.id,
        email: user.email!,
        documentType: "CGV",
        documentVersion: version,
        ipAddress: ip,
        userAgent: ua,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        cgvVersion: version,
        needsCgvAcceptance: false,
      },
    }),
  ]);

  return { ok: true };
}
