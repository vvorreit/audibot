/**
 * Tests — userFeatures (feature flag logic)
 *
 * Donnees fictives uniquement. Aucune donnee reelle.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockFindUnique = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    userFeatures: { findUnique: (...args: any[]) => mockFindUnique(...args) },
  },
}));

// Mock next-auth
const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getUserFeatures, hasFeature } from "@/lib/userFeatures";

describe("getUserFeatures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns feature flags from database", async () => {
    mockFindUnique.mockResolvedValue({ bilanAuditif: true, rapprochement: false });
    const result = await getUserFeatures("user-1");
    expect(result).toEqual({ bilanAuditif: true, rapprochement: false });
  });

  it("returns false defaults when no features record exists", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getUserFeatures("user-unknown");
    expect(result).toEqual({ bilanAuditif: false, rapprochement: false });
  });

  it("queries with the correct userId", async () => {
    mockFindUnique.mockResolvedValue(null);
    await getUserFeatures("user-42");
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { userId: "user-42" } });
  });

  it("returns partial defaults (bilanAuditif present, rapprochement undefined)", async () => {
    mockFindUnique.mockResolvedValue({ bilanAuditif: true });
    const result = await getUserFeatures("user-partial");
    expect(result).toEqual({ bilanAuditif: true, rapprochement: false });
  });
});

describe("hasFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when no session exists", async () => {
    mockGetServerSession.mockResolvedValue(null);
    expect(await hasFeature("bilanAuditif")).toBe(false);
  });

  it("returns false when session has no user id", async () => {
    mockGetServerSession.mockResolvedValue({ user: { email: "test@test.com" } });
    expect(await hasFeature("bilanAuditif")).toBe(false);
  });

  it("returns true for ADMIN regardless of feature flags", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    // No need to mock features — ADMIN bypasses
    expect(await hasFeature("bilanAuditif")).toBe(true);
    expect(await hasFeature("rapprochement")).toBe(true);
  });

  it("returns true when user has the feature enabled", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    });
    mockFindUnique.mockResolvedValue({ bilanAuditif: true, rapprochement: false });
    expect(await hasFeature("bilanAuditif")).toBe(true);
  });

  it("returns false when user does not have the feature enabled", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    });
    mockFindUnique.mockResolvedValue({ bilanAuditif: false, rapprochement: false });
    expect(await hasFeature("bilanAuditif")).toBe(false);
  });

  it("returns false when user features record does not exist", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-new", role: "USER" },
    });
    mockFindUnique.mockResolvedValue(null);
    expect(await hasFeature("rapprochement")).toBe(false);
  });
});
