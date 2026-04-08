import type { BankProvider, BankProviderName } from "./types";
import { createBridgeProvider } from "./bridge";
import { createPowensProvider } from "./powens";

export function getProvider(name: BankProviderName): BankProvider {
  switch (name) {
    case "bridge":
      return createBridgeProvider();
    case "powens":
      return createPowensProvider();
    default:
      throw new Error(`Provider bancaire inconnu: ${name}`);
  }
}
