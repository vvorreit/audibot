import React from "react";
import FocusTrap from "focus-trap-react";

type DocType = "mutuelle" | "ordonnance";

interface FeedbackModalProps {
  isOpen: boolean;
  type: DocType | null;
  text: string;
  onTextChange: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  sending: boolean;
  sent: boolean;
}

export default function FeedbackModal({
  isOpen, type, text, onTextChange, onClose, onSubmit, sending, sent
}: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <FocusTrap focusTrapOptions={{ escapeDeactivates: true, onDeactivate: onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
        <div role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4 relative z-10">
          {sent ? (
            <p className="text-center text-green-600 font-semibold py-4">
              Merci, votre retour nous aide à améliorer la lecture.
            </p>
          ) : (
            <>
              <h3 id="feedback-modal-title" className="text-lg font-bold text-slate-900">
                Signaler une erreur ({type === "mutuelle" ? "Mutuelle" : "Ordonnance"})
              </h3>
              <textarea
                id="feedback-text"
                aria-label="Décrivez l'erreur de lecture"
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Ex: le nom est mal lu, le NSS est tronqué..."
                className="w-full h-28 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus-visible:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-700 hover:text-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={onSubmit}
                  disabled={sending || !text.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sending ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </FocusTrap>
  );
}
