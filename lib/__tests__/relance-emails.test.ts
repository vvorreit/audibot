import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: { mutuelleEmailConfig: { findFirst: vi.fn() } } }));
vi.mock("@/lib/mailer", () => ({
  getTransporter: vi.fn(),
  smtpConfigured: vi.fn().mockReturnValue(false),
}));

import { buildEmailContent } from "@/lib/relance-emails";

describe("buildEmailContent", () => {
  const dossier = {
    reference: "TP-2026-0001",
    mutuelle: "ALMERYS",
    montant: 385.00,
    dateEnvoi: new Date("2026-01-15"),
  };

  it("génère un HTML avec la référence du dossier", () => {
    const result = buildEmailContent(dossier, null);
    expect(result.html).toContain("TP-2026-0001");
  });

  it("génère un HTML avec le nom de la mutuelle", () => {
    const result = buildEmailContent(dossier, null);
    expect(result.html).toContain("Almerys");
  });

  it("génère un HTML avec le montant formaté", () => {
    const result = buildEmailContent(dossier, null);
    expect(result.html).toContain("385");
  });

  it("utilise le template custom si fourni", () => {
    const template = { objet: "Relance personnalisée", contenu: "Bonjour {{reference_dossier}}" };
    const result = buildEmailContent(dossier, template);
    expect(result.subject).toBe("Relance personnalisée");
    expect(result.html).toContain("TP-2026-0001");
  });

  it("utilise le template par défaut si null", () => {
    const result = buildEmailContent(dossier, null);
    expect(result.subject).toBeTruthy();
    expect(result.html).toBeTruthy();
  });
});
