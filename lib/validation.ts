/**
 * Helpers de validation Zod pour les API routes.
 * Exports: parseBody, parseQuery. ~30 lignes
 */

import { NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

/**
 * Parse et valide le body JSON d'une requete avec un schema Zod.
 * Retourne les donnees typees ou une NextResponse 400.
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      { error: "Donnees invalides", details: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  return result.data;
}
