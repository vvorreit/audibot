export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserFeatures } from "@/lib/userFeatures";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  // ADMIN ou super user avec feature bilanAuditif
  if (session.user.role !== "ADMIN") {
    const features = await getUserFeatures(session.user.id);
    if (!features.bilanAuditif) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }

  const userId = session.user.id;
  const teamId = session.user.teamId;
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Si teamId: toutes les sessions de l'équipe. Sinon: seulement les siennes.
  const teamFilter = teamId
    ? { teamId }
    : { userId };

  const sessions = await prisma.bilanSession.findMany({
    where: {
      ...teamFilter,
      OR: [
        // WAITING ou IN_PROGRESS non expirés
        {
          status: { in: ["WAITING", "IN_PROGRESS"] },
          expiresAt: { gte: now },
        },
        // DONE depuis moins de 24h
        {
          status: "DONE",
          createdAt: { gte: oneDayAgo },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      createdAt: true,
      assignedToUserId: true,
      assignedAt: true,
      delivered: true,
      payload: true,
      user: { select: { name: true } },
    },
  });

  // Récupérer les noms des opticiens assignés
  const assignedUserIds = [
    ...new Set(
      sessions
        .map((s) => s.assignedToUserId)
        .filter((id): id is string => !!id)
    ),
  ];
  const assignedUsers =
    assignedUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: assignedUserIds } },
          select: { id: true, name: true },
        })
      : [];
  const userMap = new Map(assignedUsers.map((u) => [u.id, u.name ?? "Opticien"]));

  const items = sessions.map((s) => {
    let parsedResult = null;
    let clientName: string | null = null;
    let clientData: Record<string, string> | null = null;
    if (s.payload) {
      try {
        const parsed = JSON.parse(s.payload);
        if (s.delivered) parsedResult = parsed;
        // Extract client identity from formData
        const fd = parsed?.formData ?? parsed?.payload?.formData ?? parsed;
        const parts = [fd?.prenom, fd?.nom].filter(Boolean);
        if (parts.length > 0) clientName = parts.join(" ");
        // Extract all identity fields for extension loading
        if (fd?.nom || fd?.prenom) {
          clientData = {};
          for (const k of ["civilite", "nom", "prenom", "nomNaissance", "telephone", "email", "adresse", "codePostal", "ville"]) {
            if (fd[k]) clientData[k] = fd[k];
          }
        }
      } catch { /* ignore */ }
    }
    return {
      id: s.id,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      assignedToUserId: s.assignedToUserId,
      assignedToName: s.assignedToUserId ? userMap.get(s.assignedToUserId) ?? null : null,
      assignedAt: s.assignedAt?.toISOString() ?? null,
      delivered: s.delivered,
      result: parsedResult,
      clientName,
      clientData,
    };
  });

  return NextResponse.json({ sessions: items });
}
