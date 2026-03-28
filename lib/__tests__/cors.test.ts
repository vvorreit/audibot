import { describe, it, expect } from "vitest";
import { getCorsHeaders, getPortalCorsHeaders } from "@/lib/cors";

describe("getCorsHeaders", () => {
  it("autorise une origin optibot.fr", () => {
    const headers = getCorsHeaders("https://optibot.fr");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://optibot.fr");
  });

  it("autorise un sous-domaine optibot.fr", () => {
    const headers = getCorsHeaders("https://app.optibot.fr");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://app.optibot.fr");
  });

  it("autorise une extension Chrome (chrome-extension://)", () => {
    const origin = "chrome-extension://abcdefghijklmnopqrstuvwxyz123456";
    const headers = getCorsHeaders(origin);
    expect(headers["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it("retourne optibot.fr pour une origin tierce non autorisée", () => {
    const headers = getCorsHeaders("https://example-tiers.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://optibot.fr");
  });

  it("retourne optibot.fr si origin est null", () => {
    const headers = getCorsHeaders(null);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://optibot.fr");
  });

  it("retourne optibot.fr si origin est undefined", () => {
    const headers = getCorsHeaders(undefined);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://optibot.fr");
  });

  it("expose les bons methods et headers", () => {
    const headers = getCorsHeaders("https://optibot.fr");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, GET, OPTIONS");
    expect(headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
  });
});

describe("getPortalCorsHeaders", () => {
  it("autorise n'importe quelle origin (retourne l'origin)", () => {
    const origin = "https://portail-mutuelle-exemple.fr";
    const headers = getPortalCorsHeaders(origin);
    expect(headers["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it("autorise les origins chrome-extension://", () => {
    const origin = "chrome-extension://abcdefghijklmnopqrstuvwxyz123456";
    const headers = getPortalCorsHeaders(origin);
    expect(headers["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it("retourne * si origin est absent", () => {
    const headers = getPortalCorsHeaders(undefined);
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("retourne * si origin est null", () => {
    const headers = getPortalCorsHeaders(null);
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("expose les bons methods et headers", () => {
    const headers = getPortalCorsHeaders("https://portail-exemple.fr");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, GET, OPTIONS");
    expect(headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
  });
});
