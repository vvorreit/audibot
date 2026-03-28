export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAudit";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, body, inReplyTo } = await req.json();

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "to, subject et body requis" }, { status: 400 });
  }

  const html = `<div style="font-family:sans-serif;line-height:1.6;max-width:600px;">${body.replace(/\n/g, "<br/>")}</div>`;

  await sendMail({
    to,
    subject,
    html,
    ...(inReplyTo ? { replyTo: inReplyTo } : {}),
  });

  return NextResponse.json({ ok: true });
}
