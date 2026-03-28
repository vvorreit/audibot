"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateSelector } from "@/lib/selectorsSchema";

/* ── HEALTH ACTIONS ── */

export async function getSelectorHealthSummary(period: "24h" | "7d") {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorisé");

  const since = new Date();
  if (period === "24h") since.setHours(since.getHours() - 24);
  else since.setDate(since.getDate() - 7);

  const results = await prisma.$queryRaw`
    SELECT
      "portal",
      "selectorName",
      COUNT(*) as "total",
      COUNT(*) FILTER (WHERE "found" = false) as "failures",
      COUNT(*) FILTER (WHERE "found" = true) as "successes",
      MAX("createdAt") as "lastPing"
    FROM "SelectorHealthPing"
    WHERE "createdAt" >= ${since}
    GROUP BY "portal", "selectorName"
    ORDER BY COUNT(*) FILTER (WHERE "found" = false) DESC
  ` as any[];

  return results.map((r: any) => ({
    portal: r.portal,
    selectorName: r.selectorName,
    total: Number(r.total),
    failures: Number(r.failures),
    successes: Number(r.successes),
    failureRate: Number(r.total) > 0 ? Math.round((Number(r.failures) / Number(r.total)) * 100) : 0,
    lastPing: r.lastPing ? new Date(r.lastPing).toISOString() : null,
  }));
}

export async function getSelectorHealthAlerts() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorisé");

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const alerts = await prisma.$queryRaw`
    SELECT
      "portal",
      "selectorName",
      COUNT(*) FILTER (WHERE "found" = false) as "failures"
    FROM "SelectorHealthPing"
    WHERE "createdAt" >= ${oneHourAgo}
    GROUP BY "portal", "selectorName"
    HAVING COUNT(*) FILTER (WHERE "found" = false) >= 10
    ORDER BY COUNT(*) FILTER (WHERE "found" = false) DESC
  ` as any[];

  return alerts.map((a: any) => ({
    portal: a.portal,
    selectorName: a.selectorName,
    failures: Number(a.failures),
  }));
}

export async function getSelectorHealthTimeline(portal: string, selectorName: string, days: number) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorisé");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const timeline = await prisma.$queryRaw`
    SELECT
      date_trunc('hour', "createdAt") as "hour",
      COUNT(*) FILTER (WHERE "found" = false) as "failures",
      COUNT(*) FILTER (WHERE "found" = true) as "successes"
    FROM "SelectorHealthPing"
    WHERE "portal" = ${portal}
      AND "selectorName" = ${selectorName}
      AND "createdAt" >= ${since}
    GROUP BY date_trunc('hour', "createdAt")
    ORDER BY "hour" ASC
  ` as any[];

  return timeline.map((t: any) => ({
    hour: new Date(t.hour).toISOString(),
    failures: Number(t.failures),
    successes: Number(t.successes),
  }));
}

/* ── OVERRIDE ACTIONS ── */

export async function getSelectorOverrides() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorise");

  const overrides = await prisma.portalSelectorOverride.findMany({
    orderBy: [{ portal: "asc" }, { selectorName: "asc" }],
  });
  return overrides.map((o) => ({
    id: o.id,
    portal: o.portal,
    selectorName: o.selectorName,
    selector: o.selector,
    enabled: o.enabled,
    updatedBy: o.updatedBy,
    updatedAt: o.updatedAt.toISOString(),
  }));
}

export async function upsertSelectorOverride(
  portal: string,
  selectorName: string,
  selector: string,
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorise");

  // Validation strict via Zod
  const validation = validateSelector({ portal, selectorName, selector });
  if (!validation.success) {
    throw new Error(`Validation echouee: ${validation.error.message}`);
  }

  const result = await prisma.portalSelectorOverride.upsert({
    where: { portal_selectorName: { portal, selectorName } },
    update: { selector, updatedBy: session.user?.email || "admin" },
    create: {
      portal,
      selectorName,
      selector,
      enabled: true,
      updatedBy: session.user?.email || "admin",
    },
  });
  return { id: result.id };
}

export async function deleteSelectorOverride(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorise");

  await prisma.portalSelectorOverride.delete({ where: { id } });
  return { ok: true };
}

export async function toggleSelectorOverride(id: string, enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") throw new Error("Non autorise");

  await prisma.portalSelectorOverride.update({
    where: { id },
    data: { enabled },
  });
  return { ok: true };
}
