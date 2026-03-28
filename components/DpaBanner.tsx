"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function DpaBanner() {
  const [show, setShow] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");

  useEffect(() => {
    fetch("/api/legal/dpa/status")
      .then((r) => r.json())
      .then((data) => {
        if (!data.is_current) {
          setCurrentVersion(data.current_version);
          setShow(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await fetch("/api/legal/dpa/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dpa_version: currentVersion }),
      });
      if (res.ok) {
        setShow(false);
      }
    } catch {
      /* ignore */
    }
    setAccepting(false);
  };

  if (!show) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            Une nouvelle version (v{currentVersion}) de l&apos;Accord de Traitement des Données (DPA) est disponible.{" "}
            <Link href="/legal/dpa" target="_blank" className="underline font-bold">
              Consulter le DPA
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="px-4 py-1.5 bg-white text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            {accepting ? "..." : "Accepter"}
          </button>
          <button onClick={() => setShow(false)} className="p-1 hover:bg-blue-500 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
