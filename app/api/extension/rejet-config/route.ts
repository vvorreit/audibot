export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    version: 1,
    portails: {
      ALMERYS: {
        enabled: true,
        urlPattern: "*.almerys.com/*",
        selectors: {
          rejetContainer: ".rejets-list, .table-rejets, [data-testid='rejets']",
          rejetRow: "tr.rejet, .rejet-item",
          numeroDossier: ".num-dossier, td:nth-child(1)",
          motif: ".motif-rejet, td:nth-child(3)",
          dateRejet: ".date-rejet, td:nth-child(2)",
          montant: ".montant, td:nth-child(4)",
        },
        pagePatterns: ["/rejets", "/suivi", "/dossiers"],
      },
      VIAMEDIS: {
        enabled: true,
        urlPattern: "*.viamedis.net/*",
        selectors: {
          rejetContainer: ".liste-rejets, #rejets-table",
          rejetRow: "tr.ligne-rejet, .rejet-entry",
          numeroDossier: ".ref-dossier, td:first-child",
          motif: ".motif, td:nth-child(4)",
          dateRejet: ".date, td:nth-child(2)",
          montant: ".montant, td:nth-child(3)",
        },
        pagePatterns: ["/rejets", "/suivi-dossiers"],
      },
      ITELIS: {
        enabled: false,
        urlPattern: "*.ism-tp.fr/*",
        selectors: {
          rejetContainer: "",
          rejetRow: "",
          numeroDossier: "",
          motif: "",
          dateRejet: "",
          montant: "",
        },
        pagePatterns: [],
      },
      KALIXIA: {
        enabled: false,
        urlPattern: "*.actil.com/*",
        selectors: {
          rejetContainer: "",
          rejetRow: "",
          numeroDossier: "",
          motif: "",
          dateRejet: "",
          montant: "",
        },
        pagePatterns: [],
      },
    },
  };

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
