export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getTrackingLink, getUnsubscribeFooter } from "@/lib/email-tracking";

function personalizeHtmlForTest(html: string, firstName: string): string {
  const greeting = firstName || "Bonjour";
  let result = html.replace(/\[Prénom\]/gi, greeting);

  result = result.replace(
    /href="(https?:\/\/[^"]*(?:audibot)\.fr[^"]*)"/gi,
    (_match, url) => `href="${getTrackingLink("TEST", url)}"`,
  );

  const footer = getUnsubscribeFooter("TEST");
  if (result.includes("</body>")) {
    result = result.replace("</body>", `${footer}</body>`);
  } else {
    result += footer;
  }

  return result;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const subject: string | undefined = body.subject;
    const htmlBody: string | undefined = body.htmlBody;

    if (!subject || !htmlBody) {
      return NextResponse.json({ error: "subject et htmlBody requis" }, { status: 400 });
    }

    const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    const html = personalizeHtmlForTest(htmlBody, "Test");

    await sendMail({
      to: session.user.email,
      subject: `[TEST] ${subject}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[campagnes/test]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
