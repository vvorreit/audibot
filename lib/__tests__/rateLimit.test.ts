/**
 * Tests unitaires — rateLimit (lib/rateLimit.ts)
 *
 * Stratégie :
 * - On mock @upstash/redis avec un constructeur (function, pas arrow fn)
 *   pour que `new Redis({...})` fonctionne correctement.
 * - On mock @upstash/ratelimit pour contrôler `limit()`.
 * - limiterCache module-level → windowMs unique par test.
 *
 * Données fictives uniquement.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted → disponible dans les factories de vi.mock() (hoistées avant imports)
const { limiterInstance } = vi.hoisted(() => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis-fictif.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "token-fictif-abc123";
  return { limiterInstance: { limit: vi.fn() } };
});

vi.mock("@upstash/redis", () => {
  // Must use 'function', NOT arrow fn — arrow functions cannot be constructors
  function RedisMock(this: unknown) {
    // no-op redis mock
  }
  return { Redis: RedisMock };
});

vi.mock("@upstash/ratelimit", () => {
  // Must use 'function', NOT arrow fn — same reason
  function RatelimitMock(this: Record<string, unknown>) {
    this.limit = function (key: string) {
      return limiterInstance.limit(key);
    };
  }
  RatelimitMock.slidingWindow = function () {
    return { slidingWindow: true };
  };
  return { Ratelimit: RatelimitMock };
});

import { rateLimit } from "../rateLimit";

// Each test uses a unique windowMs to bypass limiterCache
let wCounter = 1000;
const nextWindow = () => ++wCounter;

beforeEach(() => {
  limiterInstance.limit.mockClear();
});

// ─── Fail-open ─────────────────────────────────────────────────────────────────

describe("rateLimit — fail-open (Redis non configuré / erreur)", () => {
  it("retourne true si Redis non configuré (fail-open simulé via erreur)", async () => {
    // Simule une erreur Redis → fail-open → true
    limiterInstance.limit.mockRejectedValue(new Error("Redis connection timeout"));
    const allowed = await rateLimit("user:jean-test-error", 10, nextWindow());
    expect(allowed).toBe(true);
  });

  it("retourne true sur toute erreur réseau", async () => {
    limiterInstance.limit.mockRejectedValue(new Error("Network unreachable"));
    const allowed = await rateLimit("user:network-error-fictif", 5, nextWindow());
    expect(allowed).toBe(true);
  });
});

// ─── Comportement nominal ─────────────────────────────────────────────────────

describe("rateLimit — requête autorisée", () => {
  it("retourne true si Upstash renvoie success=true", async () => {
    limiterInstance.limit.mockResolvedValue({ success: true, limit: 10, remaining: 9 });
    const allowed = await rateLimit("user:jean-test-ok", 10, nextWindow());
    expect(allowed).toBe(true);
  });
});

// ─── Rate-limiting actif ──────────────────────────────────────────────────────

describe("rateLimit — requête bloquée (rate-limited)", () => {
  it("retourne false après N requêtes (mock Upstash success=false)", async () => {
    limiterInstance.limit.mockResolvedValue({ success: false, limit: 5, remaining: 0 });
    const allowed = await rateLimit("user:jean-test-limited", 5, nextWindow());
    expect(allowed).toBe(false);
  });

  it("retourne false après épuisement du quota (simulation séquentielle)", async () => {
    const window = nextWindow();
    limiterInstance.limit
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 2 })
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 1 })
      .mockResolvedValueOnce({ success: true, limit: 3, remaining: 0 })
      .mockResolvedValueOnce({ success: false, limit: 3, remaining: 0 });

    const results: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      results.push(await rateLimit("user:quota-test-fictif", 3, window));
    }

    expect(results.slice(0, 3).every((r) => r === true)).toBe(true);
    expect(results[3]).toBe(false);
  });
});

// ─── Clés indépendantes ───────────────────────────────────────────────────────

describe("rateLimit — clés indépendantes", () => {
  it("deux clés différentes ont des compteurs indépendants", async () => {
    const window = nextWindow();
    limiterInstance.limit
      .mockResolvedValueOnce({ success: true, limit: 5, remaining: 4 })   // clé A
      .mockResolvedValueOnce({ success: false, limit: 5, remaining: 0 });  // clé B

    const allowedA = await rateLimit("user:key-alpha-fictif", 5, window);
    const allowedB = await rateLimit("user:key-beta-fictif", 5, window);

    expect(allowedA).toBe(true);
    expect(allowedB).toBe(false);
  });

  it("limit() est appelée avec la bonne clé pour chaque requête", async () => {
    const window = nextWindow();
    limiterInstance.limit.mockResolvedValue({ success: true, limit: 10, remaining: 9 });

    await rateLimit("user:key-x-fictif", 10, window);
    await rateLimit("user:key-y-fictif", 10, window);

    expect(limiterInstance.limit).toHaveBeenCalledTimes(2);
    expect(limiterInstance.limit).toHaveBeenNthCalledWith(1, "user:key-x-fictif");
    expect(limiterInstance.limit).toHaveBeenNthCalledWith(2, "user:key-y-fictif");
  });
});
