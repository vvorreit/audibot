"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const REASONS = [
  { value: "", label: "-- Raison (optionnel) --" },
  { value: "too_many_emails", label: "Trop d'emails" },
  { value: "not_relevant", label: "Contenu non pertinent" },
  { value: "other", label: "Autre raison" },
];

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t");

  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"loading" | "idle" | "confirming" | "done" | "already" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`/api/unsubscribe?t=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyUnsubscribed) {
          setStatus("already");
        } else {
          setStatus("idle");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  async function handleUnsubscribe() {
    if (!token) return;
    setStatus("confirming");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason: reason || undefined }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-slate-600">Lien de d&eacute;sinscription invalide.</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="text-center text-slate-400 text-sm">Chargement...</div>
    );
  }

  if (status === "already") {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">&#x2705;</div>
        <h2 className="text-lg font-bold text-slate-800">Vous &ecirc;tes d&eacute;j&agrave; d&eacute;sinscrit.</h2>
        <p className="text-slate-500 text-sm">Vous ne recevrez plus de mails de notre part.</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">&#x2705;</div>
        <h2 className="text-lg font-bold text-slate-800">Vous avez &eacute;t&eacute; d&eacute;sinscrit.</h2>
        <p className="text-slate-500 text-sm">Vous ne recevrez plus de mails de notre part.</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <h2 className="text-lg font-bold text-slate-800">
        Vous ne souhaitez plus recevoir nos emails ?
      </h2>
      <p className="text-slate-500 text-sm">
        Cliquez sur le bouton ci-dessous pour confirmer votre d&eacute;sinscription.
      </p>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full max-w-xs mx-auto px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <div>
        <button
          onClick={handleUnsubscribe}
          disabled={status === "confirming"}
          className="px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "confirming" ? "D\u00e9sinscription..." : "Confirmer ma d\u00e9sinscription"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-red-600 text-sm">Une erreur est survenue. Veuillez r&eacute;essayer.</p>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 max-w-md w-full">
        <Suspense fallback={<div className="text-center text-slate-400 text-sm">Chargement...</div>}>
          <UnsubscribeForm />
        </Suspense>
      </div>
    </div>
  );
}
