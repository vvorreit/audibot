/**
 * Tests — extensionAuth (sync token validation, user lookup)
 *
 * Donnees fictives uniquement.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockFindUnique = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: (...args: any[]) => mockFindUnique(...args) },
  },
}));

// Mock rateLimit
const mockRateLimit = vi.fn();
vi.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: any[]) => mockRateLimit(...args),
}));

import { extractToken, optionsCors, getExtCors, authenticateExtension } from "@/lib/extensionAuth";
import { NextRequest } from "next/server";

function makeReq(opts: {
  authHeader?: string;
  queryToken?: string;
} = {}): NextRequest {
  const url = new URL("http://localhost:3000/api/ext/test");
  if (opts.queryToken) url.searchParams.set("token", opts.queryToken);
  const req = new NextRequest(url);
  if (opts.authHeader) {
    // NextRequest headers are read-only, so we build differently
    return new NextRequest(url, {
      headers: { Authorization: opts.authHeader },
    });
  }
  return req;
}

describe("getExtCors", () => {
  it("defaults to audibot.fr when no origin", () => {
    const cors = getExtCors();
    expect(cors["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
    expect(cors["Access-Control-Allow-Methods"]).toContain("GET");
    expect(cors["Access-Control-Allow-Methods"]).toContain("POST");
    expect(cors["Access-Control-Allow-Headers"]).toContain("Authorization");
    expect(cors["Vary"]).toBe("Origin");
  });

  it("allows chrome-extension:// origins", () => {
    const cors = getExtCors("chrome-extension://abc123");
    expect(cors["Access-Control-Allow-Origin"]).toBe("chrome-extension://abc123");
  });

  it("allows audibot.fr origins", () => {
    const cors = getExtCors("https://audibot.fr");
    expect(cors["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
    const cors2 = getExtCors("https://app.audibot.fr");
    expect(cors2["Access-Control-Allow-Origin"]).toBe("https://app.audibot.fr");
  });

  it("rejects unknown origins", () => {
    const cors = getExtCors("https://evil.com");
    expect(cors["Access-Control-Allow-Origin"]).toBe("https://audibot.fr");
  });
});

describe("optionsCors", () => {
  it("returns 204 with CORS headers", () => {
    const res = optionsCors();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://audibot.fr");
  });
});

describe("extractToken", () => {
  it("extracts token from Bearer authorization header", () => {
    const req = makeReq({ authHeader: "Bearer my-sync-token" });
    expect(extractToken(req)).toBe("my-sync-token");
  });

  it("extracts token from query parameter", () => {
    const req = makeReq({ queryToken: "query-token" });
    expect(extractToken(req)).toBe("query-token");
  });

  it("extracts token from body", () => {
    const req = makeReq();
    expect(extractToken(req, { syncToken: "body-token" })).toBe("body-token");
  });

  it("prefers Authorization header over query and body", () => {
    const req = makeReq({ authHeader: "Bearer header-token", queryToken: "query-token" });
    expect(extractToken(req, { syncToken: "body-token" })).toBe("header-token");
  });

  it("returns empty string when no token found", () => {
    const req = makeReq();
    expect(extractToken(req)).toBe("");
  });

  it("handles Bearer prefix case-insensitively", () => {
    const req = makeReq({ authHeader: "bearer my-token" });
    expect(extractToken(req)).toBe("my-token");
  });

  it("trims whitespace from extracted token", () => {
    const req = makeReq({ authHeader: "Bearer   spaced-token  " });
    expect(extractToken(req)).toBe("spaced-token");
  });
});

describe("authenticateExtension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.mockResolvedValue(true);
  });

  it("returns error when no token provided", async () => {
    const req = makeReq();
    const result = await authenticateExtension(req);
    expect(result.error).toBeDefined();
    const body = await result.error!.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Token requis");
  });

  it("returns error when token is invalid (user not found)", async () => {
    const req = makeReq({ authHeader: "Bearer invalid-token" });
    mockFindUnique.mockResolvedValue(null);
    const result = await authenticateExtension(req);
    expect(result.error).toBeDefined();
    const body = await result.error!.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Token invalide");
  });

  it("returns user when token is valid", async () => {
    const req = makeReq({ authHeader: "Bearer valid-token" });
    const mockUser = { id: "user-1", plan: "PRO", teamId: null };
    mockFindUnique.mockResolvedValue(mockUser);
    const result = await authenticateExtension(req);
    expect(result.error).toBeUndefined();
    expect(result.user).toEqual(mockUser);
    expect(result.token).toBe("valid-token");
  });

  it("returns 429 when rate limited", async () => {
    const req = makeReq({ authHeader: "Bearer valid-token" });
    mockRateLimit.mockResolvedValue(false);
    const result = await authenticateExtension(req, undefined, "test-key");
    expect(result.error).toBeDefined();
    expect(result.error!.status).toBe(429);
  });

  it("skips rate limiting when no rateLimitKey provided", async () => {
    const req = makeReq({ authHeader: "Bearer valid-token" });
    const mockUser = { id: "user-1", plan: "PRO", teamId: null };
    mockFindUnique.mockResolvedValue(mockUser);
    await authenticateExtension(req);
    expect(mockRateLimit).not.toHaveBeenCalled();
  });

  it("queries prisma with the correct syncToken", async () => {
    const req = makeReq({ authHeader: "Bearer lookup-token" });
    mockFindUnique.mockResolvedValue(null);
    await authenticateExtension(req);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { syncToken: "lookup-token" },
      select: { id: true, plan: true, teamId: true, isBanned: true },
    });
  });
});
