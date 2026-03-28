import { ImapFlow } from "imapflow";

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
  messageId: string;
}

function isConfigured(): boolean {
  return !!(process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASS);
}

export async function fetchEmails(limit = 50): Promise<EmailMessage[]> {
  if (!isConfigured()) return [];

  const client = new ImapFlow({
    host: process.env.IMAP_HOST!,
    port: Number(process.env.IMAP_PORT ?? 993),
    secure: process.env.IMAP_SECURE !== "false",
    auth: {
      user: process.env.IMAP_USER!,
      pass: process.env.IMAP_PASS!,
    },
    logger: false,
  });

  const emails: EmailMessage[] = [];

  try {
    await client.connect();
    const mailbox = await client.mailboxOpen("INBOX");
    const total = mailbox.exists;
    if (total === 0) return [];

    const start = Math.max(1, total - limit + 1);
    const messages = client.fetch(`${start}:*`, {
      uid: true,
      flags: true,
      envelope: true,
      bodyStructure: true,
      source: true,
    });

    for await (const msg of messages) {
      try {
        const from = msg.envelope?.from?.[0]
          ? `${msg.envelope.from[0].name ?? ""} <${msg.envelope.from[0].address ?? ""}>`.trim()
          : "Inconnu";

        const subject = msg.envelope?.subject ?? "(sans objet)";
        const date = msg.envelope?.date?.toISOString() ?? new Date().toISOString();
        const messageId = msg.envelope?.messageId ?? String(msg.uid);
        const isRead = msg.flags?.has("\\Seen") ?? false;

        // Extraire le texte du body
        let body = "";
        if (msg.source) {
          const raw = msg.source.toString("utf-8");
          // Extraire la partie texte après les headers
          const parts = raw.split(/\r?\n\r?\n/);
          body = parts.slice(1).join("\n\n").slice(0, 5000);
          // Nettoyer les encodages basiques
          body = body
            .replace(/=\r?\n/g, "")
            .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .trim();
        }

        emails.push({
          id: String(msg.uid),
          from,
          subject,
          date,
          body,
          isRead,
          messageId,
        });
      } catch {
        // Skip message en erreur
      }
    }

    emails.reverse(); // Plus récents en premier
    return emails;
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }
}
