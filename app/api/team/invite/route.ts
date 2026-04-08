export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTransporter, smtpConfigured } from "@/lib/mailer";
import { randomBytes } from "crypto";
import { getTeamSeatsLimit } from "@/app/actions/team";
import { z } from "zod";
import { parseBody } from "@/lib/validation";

const inviteSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["MEMBER", "MANAGER"]).optional().default("MEMBER"),
  resend: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const parsed = await parseBody(req, inviteSchema);
  if (parsed instanceof NextResponse) return parsed;
  const { email, role: inviteRole, resend } = parsed;

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      team: {
        include: {
          users: { select: { id: true } },
          invitations: { where: { expires: { gt: new Date() } }, select: { id: true } },
        },
      },
    },
  });

  if (!user?.teamId || (user.teamRole !== "OWNER" && user.teamRole !== "ADMIN" && user.teamRole !== "MANAGER")) {
    return NextResponse.json({ error: "Réservé aux administrateurs de l'équipe." }, { status: 403 });
  }

  // Vérifier si une invitation existe déjà (hors transaction pour le cas "already invited")
  const existing = await prisma.invitation.findUnique({
    where: { teamId_email: { teamId: user.teamId, email } },
  });

  if (existing && existing.expires > new Date() && !resend) {
    return NextResponse.json({ success: true, sent: false, alreadyInvited: true });
  }

  // Seat check + création d'invitation dans une transaction pour éviter les race conditions
  let inviteToken: string;
  try {
    inviteToken = await prisma.$transaction(async (tx) => {
      // Recompter les postes occupés dans la transaction
      const teamData = await tx.team.findUnique({
        where: { id: user.teamId! },
        include: {
          users: { select: { id: true } },
          invitations: { where: { expires: { gt: new Date() } }, select: { id: true } },
        },
      });
      const owner = await tx.user.findUnique({ where: { id: teamData!.ownerId }, select: { plan: true } });
      const limit = await getTeamSeatsLimit(owner?.plan ?? "FREE", teamData?.extraSeats ?? 0);
      const occupied = (teamData?.users.length ?? 0) + (teamData?.invitations.length ?? 0);
      if (occupied >= limit) {
        throw new Error(`Limite de postes atteinte (${limit} postes maximum pour votre plan).`);
      }

      if (existing && existing.expires > new Date() && resend) {
        return existing.token;
      }

      if (existing) {
        await tx.invitation.delete({ where: { id: existing.id } });
      }
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await tx.invitation.create({
        data: { email, token, expires, teamId: user.teamId!, inviterId: userId, role: inviteRole },
      });
      return token;
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg.includes("Limite de postes")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    throw e;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const inviteLink = `${baseUrl}/join/${inviteToken}`;

  try {
    if (smtpConfigured()) {
      await getTransporter().sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `Rejoignez l'équipe ${user.team?.name} sur AudiBot`,
        html: `
          <h1>Invitation d'équipe</h1>
          <p><strong>${user.name || user.email}</strong> vous a invité à rejoindre l'équipe <strong>${user.team?.name}</strong>.</p>
          <p><a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accepter l'invitation</a></p>
          <p>Ou copiez ce lien : ${inviteLink}</p>
        `,
      });
      return NextResponse.json({ success: true, sent: true });
    } else {
      return NextResponse.json({ success: true, sent: false, link: inviteLink });
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ success: true, sent: false, link: inviteLink });
  }
}
