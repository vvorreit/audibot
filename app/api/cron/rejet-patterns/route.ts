export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { safeCompare } from "@/lib/safeCompare"

/**
 * GET /api/cron/rejet-patterns
 * Nightly cron: aggregates RejetAutoDetecte from last 90 days
 * and upserts into RejetPattern with rejection rates.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const DAYS = 90
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000)

  try {
    // Fetch all rejections from the last 90 days
    const rejets = await prisma.rejetAutoDetecte.findMany({
      where: { createdAt: { gte: cutoff } },
      select: {
        portail: true,
        motif: true,
      },
    })

    // Group by (portail, champ) extracted from motif
    const groups = new Map<string, { portail: string; champ: string; pattern: string; count: number }>()

    for (const r of rejets) {
      const champ = extractChamp(r.motif)
      const pattern = r.motif || "inconnu"
      const key = `${r.portail}||${champ}||${pattern}`

      const existing = groups.get(key)
      if (existing) {
        existing.count++
      } else {
        groups.set(key, { portail: r.portail, champ, pattern, count: 1 })
      }
    }

    let updated = 0

    for (const g of groups.values()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).rejetPattern.upsert({
        where: {
          portail_champ_pattern: {
            portail: g.portail,
            champ: g.champ,
            pattern: g.pattern,
          },
        },
        update: {
          rejetCount: g.count,
          totalCount: g.count, // total = observed rejections in window
          tauxRejet: 1.0,      // all observed are rejections by definition
        },
        create: {
          portail: g.portail,
          champ: g.champ,
          pattern: g.pattern,
          rejetCount: g.count,
          totalCount: g.count,
          tauxRejet: 1.0,
        },
      })
      updated++
    }

    console.log(`[CRON] rejet-patterns: ${updated} patterns updated from ${rejets.length} rejections`)

    return NextResponse.json({ ok: true, updated })
  } catch (e) {
    console.error("[CRON] rejet-patterns error:", e)
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 })
  }
}

/** Extract the field name (champ) from a rejection motif string */
function extractChamp(motif: string | null): string {
  if (!motif) return "autre"
  const m = motif.toLowerCase()

  if (m.includes("nss")) return "nss"
  if (m.includes("ordonnance") || m.includes("prescription")) return "dateOrdo"
  if (m.includes("rpps") || m.includes("prescripteur")) return "rpps"
  if (m.includes("montant") || m.includes("plafond")) return "montant"
  if (m.includes("code") || m.includes("acte")) return "codeActe"

  return "autre"
}
