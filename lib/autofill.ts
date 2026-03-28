import type { MutuelleData, OrdonnanceData } from "./parsers";

export interface AutofillPayload {
  mutuelle?: MutuelleData;
  ordonnance?: OrdonnanceData;
  syncToken?: string;
}

export function generatePayloadString(payload: AutofillPayload): string {
  const m = payload.mutuelle ?? {};
  const o = payload.ordonnance ?? {};
  const syncToken = payload.syncToken || "";
  return JSON.stringify({ m, o, syncToken });
}
