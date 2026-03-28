"use client";

import { useState, useMemo } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Mail, Check, X as XIcon } from "lucide-react";
import { registerUser } from "@/app/actions/auth";

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string; width: string } {
  if (!pw) return { level: 0, label: "", color: "", width: "0%" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { level: 1, label: "Faible", color: "bg-red-500", width: "33%" };
  if (score <= 3) return { level: 2, label: "Moyen", color: "bg-orange-500", width: "66%" };
  return { level: 3, label: "Fort", color: "bg-green-500", width: "100%" };
}

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [dpaAccepted, setDpaAccepted] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const passwordsMatch = form.password === form.confirm;
  const canSubmit = !loading && dpaAccepted && form.password.length >= 8 && form.confirm.length > 0 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const dpaVersion = process.env.NEXT_PUBLIC_DPA_VERSION || "1.1";
    const result = await registerUser(form.name, form.email, form.password, dpaVersion);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setRegistered(true);
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-200">
                O
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">OptiBot</span>
            </Link>
          </div>
          <div className="bg-white p-6 sm:p-10 rounded-card shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Vérifiez votre email</h1>
            <p className="text-slate-500 font-medium mb-2">
              Un email de confirmation a été envoyé à
            </p>
            <p className="text-blue-600 font-bold mb-6">{form.email}</p>
            <p className="text-slate-400 text-sm font-medium">
              Cliquez sur le lien dans l&apos;email pour activer votre compte. Le lien expire dans 24h.
            </p>
          </div>
          <p className="text-center mt-6 text-sm font-medium text-slate-400">
            Déjà confirmé ?{" "}
            <Link href="/auth/signin" className="text-blue-600 font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-200 group-hover:scale-105 transition-transform">
              O
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">OptiBot</span>
          </Link>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-card shadow-sm border border-slate-100">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Créer un compte</h1>
          <p className="text-slate-500 font-medium mb-8">Rejoignez OptiBot en quelques secondes.</p>

          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold" role="alert">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Dupont"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jean@exemple.fr"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="8 caractères minimum"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-xs font-bold mt-1 ${
                    strength.level === 1 ? "text-red-500" : strength.level === 2 ? "text-orange-500" : "text-green-600"
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => { setForm({ ...form, confirm: e.target.value }); if (!confirmTouched) setConfirmTouched(true); }}
                  placeholder="Répétez le mot de passe"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                {confirmTouched && form.confirm.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordsMatch
                      ? <Check className="w-5 h-5 text-green-500" />
                      : <XIcon className="w-5 h-5 text-red-500" />
                    }
                  </span>
                )}
              </div>
              {confirmTouched && form.confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs font-semibold text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-2">
              <p className="text-sm text-blue-800 font-medium">
                OptiBot traite des données de santé en qualité de sous-traitant au sens de l&apos;article 28 du RGPD.
                L&apos;acceptation de l&apos;Accord de Traitement des Données (DPA) est requise pour utiliser le service.
              </p>
            </div>

            <label className="flex items-start gap-3 mt-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dpaAccepted}
                onChange={(e) => setDpaAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600 font-medium">
                J&apos;ai lu et j&apos;accepte l&apos;<Link href="/legal/dpa" target="_blank" className="text-blue-600 font-bold underline">Accord de Traitement des Données (DPA)</Link> conformément à l&apos;article 28 du RGPD.
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-400">
              <span className="bg-white px-4">Ou</span>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-4 py-4 px-6 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 font-bold hover:bg-slate-50 hover:border-blue-100 transition-all shadow-sm active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            Continuer avec Google
          </button>

          <p className="text-center mt-6 text-sm font-medium text-slate-500">
            Déjà un compte ?{" "}
            <Link href="/auth/signin" className="text-blue-600 font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
            Retour à l&apos;accueil
            <ArrowRight className="w-4 h-4" />
          </Link>
        </p>
      </div>
    </div>
  );
}
