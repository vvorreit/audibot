import { describe, it, expect } from "vitest";
import { getCorsHeaders, getPortalCorsHeaders } from "@/lib/cors";

describe("getCorsHeaders", () => {
  it("autorise une origin audibot.fr", () => {
    const headers = getCorsHeaders("https://audibot.fr");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("autorise un sous-domaine audibot.fr", () => {
    const headers = getCorsHeaders("https://app.audibot.fr");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://app.audibot.fr");
  });

  it("autorise une extension Chrome (chrome-extension://)", () => {
    const origin = "chrome-extension://abcdefghijklmnopqrstuvwxyz123456";
    const headers = getCorsHeaders(origin);
    expect(headers["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it("retourne audibot.fr pour une origin tierce non autorisée", () => {
    const headers = getCorsHeaders("https://example-tiers.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("retourne audibot.fr si origin est null", () => {
    const headers = getCorsHeaders(null);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("retourne audibot.fr si origin est undefined", () => {
    const headers = getCorsHeaders(undefined);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("expose les bons methods et headers", () => {
    const headers = getCorsHeaders("https://audibot.fr");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, GET, OPTIONS");
    expect(headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
  });
});

describe("getPortalCorsHeaders", () => {
  it("autorise les origins chrome-extension://", () => {
    const origin = "chrome-extension://abcdefghijklmnopqrstuvwxyz123456";
    const headers = getPortalCorsHeaders(origin);
    expect(headers["Access-Control-Allow-Origin"]).toBe(origin);
  });

  it("autorise audibot.fr", () => {
    const headers = getPortalCorsHeaders("https://audibot.fr");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("refuse une origin tierce (fallback audibot.fr)", () => {
    const origin = "https://portail-mutuelle-exemple.fr";
    const headers = getPortalCorsHeaders(origin);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("retourne audibot.fr si origin est absent", () => {
    const headers = getPortalCorsHeaders(undefined);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("retourne audibot.fr si origin est null", () => {
    const headers = getPortalCorsHeaders(null);
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });

  it("expose les bons methods et headers", () => {
    const headers = getPortalCorsHeaders("https://audibot.fr");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, GET, OPTIONS");
    expect(headers["Access-Control-Allow-Headers"]).toBe("Content-Type");
  });
});
