export const dynamic = "force-dynamic";

/**
 * GET /api/cron/enforce-retention
 * RGPD Art.5(1)(e) — Principe de limitation de la conservation.
 * Purge les données au-delà de leur durée de rétention légale.
 * Exports: GET. ~100 lignes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";

/**
 * Politique de rétention des données (en jours) :
 *
 * | Données                | Rétention | Justification                          |
 * |------------------------|-----------|----------------------------------------|
 * | AdminAuditLog          | 365 j     | Art.30 — traçabilité administrative     |
 * | EmailTracking          | 180 j     | Analyse marketing, intérêt légitime     |
 * | ConsentRecord          | 1095 j    | Art.7 — preuve de consentement (3 ans)  |
 * | DataAccessLog          | 365 j     | Art.30 — accountability                 |
 * | DiagnosticLog          | 90 j      | Support technique                       |
 * | NpsResponse            | 365 j     | Analyse qualité                         |
 * | SelectorRepairRequest  | 90 j      | Support technique                       |
 * | ExtensionEvent         | 90 j      | Télémétrie                              |
 * | PreSubmitLog           | 90 j      | Diagnostic extension                    |
 * | DeletionRequest (done) | 90 j      | Nettoyage post-suppression              |
 * | FieldFeedback          | 180 j     | Amélioration IA                         |
 *
 * Note: rpaLog, ocrScanLog, injectionLog, bookmarkletPing, smartFillCorrection,
 * ocrFeedback, rejetAutoDetecte sont déjà purgés par /api/cron/purge-logs (90j).
 */

const RETENTION_POLICY: Array<{
  model: string;
  days: number;
  dateField?: string;
  extraWhere?: Record<string, unknown>;
}> = [
  { model: "adminAuditLog", days: 365 },
  { model: "emailTracking", days: 180 },
  { model: "dataAccessLog", days: 365 },
  { model: "diagnosticLog", days: 90 },
  { model: "npsResponse", days: 365 },
  { model: "selectorRepairRequest", days: 90 },
  { model: "extensionEvent", days: 90 },
  { model: "preSubmitLog", days: 90 },
  { model: "fieldFeedback", days: 180 },
  { model: "deletionRequest", days: 90, extraWhere: { executedAt: { not: null } } },
  // ConsentRecord : 3 ans (1095 jours) — preuve de consentement Art.7
  { model: "consentRecord", days: 1095 },
];

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: Record<string, number> = {};

    for (const policy of RETENTION_POLICY) {
      const cutoff = new Date(Date.now() - policy.days * 24 * 60 * 60 * 1000);
      const dateField = policy.dateField ?? "createdAt";

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deleted = await (prisma as any)[policy.model].deleteMany({
          where: {
            [dateField]: { lt: cutoff },
            ...policy.extraWhere,
          },
        });
        results[policy.model] = deleted.count;
      } catch (err) {
        console.error(`[enforce-retention] Error purging ${policy.model}:`, err);
        results[policy.model] = -1;
      }
    }

    const total = Object.values(results).filter((v) => v > 0).reduce((a, b) => a + b, 0);
    console.log(`[RGPD Art.5(1)(e)] Retention enforcement: ${total} records purged`);

    return NextResponse.json({ ok: true, purged: results, total });
  } catch (err) {
    console.error("[enforce-retention]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
