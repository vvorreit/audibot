import React from "react";
import Link from "next/link";

interface ScanStatusBannerProps {
  isDataCopied: boolean;
}

export default function ScanStatusBanner({ isDataCopied }: ScanStatusBannerProps) {
  if (isDataCopied) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold">
        <span>✅ Donn&eacute;es copi&eacute;es &mdash;</span>
        <span className="font-black">Ouvrez votre portail mutuelle et cliquez 🤖 Remplir</span>
        <Link href="/portails" className="ml-auto text-green-600 underline text-xs font-black shrink-0">Voir les portails &rarr;</Link>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
      <span className="text-lg mt-0.5 shrink-0">⚠️</span>
      <p className="text-xs font-semibold leading-relaxed">
        <span className="font-black">V&eacute;rifiez les donn&eacute;es, puis cliquez Copier.</span>{" "}
        La lecture automatique peut comporter des erreurs.
      </p>
    </div>
  );
}
