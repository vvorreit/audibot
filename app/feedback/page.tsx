"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { submitNpsFeedback } from "@/app/actions/feedback";

function FeedbackContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get("score") || "0", 10);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    setSending(true);
    await submitNpsFeedback(score, message);
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <div className="text-center space-y-3">
        <p className="text-2xl">🙏</p>
        <p className="text-lg font-black text-slate-900">Merci pour votre retour !</p>
        <p className="text-sm text-slate-500">Votre avis nous aide à améliorer AudiBot.</p>
      </div>
    );
  }

  if (score >= 4) {
    return (
      <div className="text-center space-y-4">
        <p className="text-4xl">🙌</p>
        <h1 className="text-xl font-black text-slate-900">Merci ! Votre avis compte beaucoup.</h1>
        <p className="text-sm text-slate-500">Content que votre première semaine se soit bien passée.</p>
        <a
          href="https://g.page/r/audibot/review"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors text-sm"
          onClick={() => submitNpsFeedback(score, "")}
        >
          Laisser un avis Google →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-4xl text-center">💬</p>
      <h1 className="text-xl font-black text-slate-900 text-center">Merci pour votre retour.</h1>
      <p className="text-sm text-slate-500 text-center">Pouvez-vous nous dire ce qui n&apos;a pas fonctionné ?</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Décrivez votre difficulté..."
        className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus-visible:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={sending || !message.trim()}
        className="w-full py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
      >
        {sending ? "Envoi..." : "Envoyer"}
      </button>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md py-16">
        <Suspense fallback={<div className="text-center text-slate-400">Chargement...</div>}>
          <FeedbackContent />
        </Suspense>
      </div>
    </main>
  );
}
