"use server";

import { getSession } from "./helpers";

export async function requestExtensionAccess(): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.email) return { success: false, error: "Non authentifié" };

  try {
    const { getTransporter } = await import("@/lib/mailer");
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: "contact@optibot.fr",
      replyTo: session.user.email,
      subject: `[Extension] Demande d'accès anticipé — ${session.user.name || session.user.email}`,
      html: `<p><strong>${session.user.name || "Utilisateur"}</strong> (${session.user.email}) demande l'accès anticipé à l'extension Chrome OptiBot.</p>`,
    });
    return { success: true };
  } catch (err) {
    console.error("[requestExtensionAccess] Erreur:", err);
    return { success: false, error: "Erreur lors de l'envoi. Réessayez." };
  }
}
