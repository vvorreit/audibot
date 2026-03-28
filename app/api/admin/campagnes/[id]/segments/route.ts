export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const emails = await prisma.emailTracking.findMany({
      where: { campaignId: id },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        openCount: true,
        clickCount: true,
      },
    });

    const allUnsubscribed = new Set(
      (await prisma.emailUnsubscribe.findMany({ select: { email: true } })).map((u) => u.email),
    );

    const segments = {
      opened_clicked: emails.filter((e) => e.openCount > 0 && e.clickCount > 0),
      opened_only: emails.filter((e) => e.openCount > 0 && e.clickCount === 0),
      not_opened: emails.filter(
        (e) => e.openCount === 0 && (e.status === "sent" || e.status === "pending"),
      ),
      errors: emails.filter((e) => e.status === "error"),
      unsubscribed: emails.filter((e) => allUnsubscribed.has(e.email)),
    };

    const total = emails.length;

    return NextResponse.json({
      total,
      segments: {
        opened_clicked: {
          count: segments.opened_clicked.length,
          pct: total > 0 ? segments.opened_clicked.length / total : 0,
          contacts: segments.opened_clicked.map((e) => ({
            email: e.email,
            firstName: e.firstName,
            lastName: e.lastName,
          })),
        },
        opened_only: {
          count: segments.opened_only.length,
          pct: total > 0 ? segments.opened_only.length / total : 0,
          contacts: segments.opened_only.map((e) => ({
            email: e.email,
            firstName: e.firstName,
            lastName: e.lastName,
          })),
        },
        not_opened: {
          count: segments.not_opened.length,
          pct: total > 0 ? segments.not_opened.length / total : 0,
          contacts: segments.not_opened.map((e) => ({
            email: e.email,
            firstName: e.firstName,
            lastName: e.lastName,
          })),
        },
        errors: {
          count: segments.errors.length,
          pct: total > 0 ? segments.errors.length / total : 0,
          contacts: segments.errors.map((e) => ({
            email: e.email,
            firstName: e.firstName,
            lastName: e.lastName,
          })),
        },
        unsubscribed: {
          count: segments.unsubscribed.length,
          pct: total > 0 ? segments.unsubscribed.length / total : 0,
          contacts: segments.unsubscribed.map((e) => ({
            email: e.email,
            firstName: e.firstName,
            lastName: e.lastName,
          })),
        },
      },
    });
  } catch (err) {
    console.error("[campagnes/segments]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
