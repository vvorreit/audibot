/**
 * Tests — generateTPReference (TP-YYYY-NNNN reference generation)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma to avoid real DB calls
vi.mock("@/lib/db", () => ({
  prisma: {},
}));

import { generateTPReference } from "@/lib/generateTPReference";

describe("generateTPReference", () => {
  const currentYear = new Date().getFullYear();

  function makeTx(lastRef: string | null) {
    return {
      dossierTiersPayant: {
        findFirst: vi.fn().mockResolvedValue(
          lastRef ? { reference: lastRef } : null
        ),
      },
    } as any;
  }

  it("returns TP-YYYY-0001 when no previous dossier exists", async () => {
    const tx = makeTx(null);
    const ref = await generateTPReference(tx);
    expect(ref).toBe(`TP-${currentYear}-0001`);
  });

  it("increments the last reference number", async () => {
    const tx = makeTx(`TP-${currentYear}-0042`);
    const ref = await generateTPReference(tx);
    expect(ref).toBe(`TP-${currentYear}-0043`);
  });

  it("pads the number to 4 digits", async () => {
    const tx = makeTx(`TP-${currentYear}-0005`);
    const ref = await generateTPReference(tx);
    expect(ref).toBe(`TP-${currentYear}-0006`);
  });

  it("handles large numbers beyond 4 digits", async () => {
    const tx = makeTx(`TP-${currentYear}-9999`);
    const ref = await generateTPReference(tx);
    expect(ref).toBe(`TP-${currentYear}-10000`);
  });

  it("matches TP-YYYY-NNNN format", async () => {
    const tx = makeTx(null);
    const ref = await generateTPReference(tx);
    expect(ref).toMatch(/^TP-\d{4}-\d{4,}$/);
  });

  it("queries with the current year prefix", async () => {
    const tx = makeTx(null);
    await generateTPReference(tx);
    expect(tx.dossierTiersPayant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reference: { startsWith: `TP-${currentYear}-` } },
        orderBy: { reference: "desc" },
        select: { reference: true },
      })
    );
  });

  it("handles malformed reference (non-numeric last segment) gracefully", async () => {
    const tx = makeTx(`TP-${currentYear}-ABCD`);
    const ref = await generateTPReference(tx);
    // parseInt("ABCD", 10) => NaN, so nextNum stays 1
    expect(ref).toBe(`TP-${currentYear}-0001`);
  });

  it("starts from 0001 for a new year", async () => {
    // Simulate: last dossier found but from a different query context
    // In practice the findFirst filters by year, so null is returned for new year
    const tx = makeTx(null);
    const ref = await generateTPReference(tx);
    expect(ref).toBe(`TP-${currentYear}-0001`);
  });
});
