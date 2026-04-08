"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Users, Smartphone, FileText, X } from "lucide-react";
import { updateOnboardingStep } from "@/app/actions/onboarding";
import { track } from "@/lib/analytics";
import Link from "next/link";
import confetti from "canvas-confetti";

const MILESTONE_KEY = "audibot_onboarding_milestone_seen";

interface OnboardingChecklistProps {
  clientCount?: number;
  onboardingStep: number;
}

export default function OnboardingChecklist({ clientCount = 0, onboardingStep }: OnboardingChecklistProps) {
  const [currentStep, setCurrentStep] = useState(onboardingStep);
  const [collapsed, setCollapsed] = useState(false);
  const [done, setDone] = useState(false);

  const markStep = useCallback(async (step: number) => {
    if (step <= currentStep) return;
    setCurrentStep(step);
    await updateOnboardingStep(step);
    track("onboarding_step_completed", { step });
  }, [currentStep]);

  /* Step 2 (premier doc): auto-check when clientCount >= 1 */
  useEffect(() => {
    if (clientCount >= 1 && currentStep < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      markStep(2);
    }
  }, [clientCount, currentStep, markStep]);

  /* Step 3 (copié): listen for audibot_data_copied event */
  useEffect(() => {
    const handler = () => {
      if (currentStep < 3) {
        markStep(3);
      }
    };
    window.addEventListener("audibot_data_copied", handler);
    return () => window.removeEventListener("audibot_data_copied", handler);
  }, [currentStep, markStep]);

  const steps = [
    { key: 0, label: "Installer l'extension Chrome", checked: currentStep >= 1, auto: false, onboardingValue: 1 },
    { key: 1, label: "Scanner un premier document", checked: currentStep >= 2, auto: true, onboardingValue: 2 },
    { key: 2, label: "Remplir votre premier formulaire", checked: currentStep >= 4, auto: false, onboardingValue: 4 },
  ];

  const completedCount = steps.filter((s) => s.checked).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  const [showMilestone, setShowMilestone] = useState(false);

  /* All done → show milestone or hide */
  useEffect(() => {
    if (completedCount === steps.length) {
      if (!localStorage.getItem(MILESTONE_KEY)) {
        setShowMilestone(true);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } else {
        const timer = setTimeout(() => setDone(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [completedCount, steps.length]);

  const closeMilestone = () => {
    localStorage.setItem(MILESTONE_KEY, "1");
    setShowMilestone(false);
    setDone(true);
  };

  if (done) return null;

  const allDone = completedCount === steps.length;

  return (
    <>
    {showMilestone && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeMilestone}>
        <div className="bg-white rounded-card shadow-2xl p-10 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={closeMilestone} className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center mb-8">
            <span className="text-6xl block mb-4">🎉</span>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Vous &ecirc;tes pr&ecirc;t !</h2>
            <p className="text-slate-500 font-medium">L&apos;onboarding est termin&eacute;. Vous &ecirc;tes op&eacute;rationnel.</p>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Prochaines &eacute;tapes</p>
            {[
              { icon: Users, label: "Inviter un coll\u00e8gue dans votre \u00e9quipe", href: "/dashboard/team" },
              { icon: Smartphone, label: "Scanner depuis votre t\u00e9l\u00e9phone", href: "/dashboard/scan" },
              { icon: FileText, label: "Explorer le suivi tiers-payant", href: "/tiers-payant" },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.href}
                onClick={closeMilestone}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={closeMilestone}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-sm shadow-xl shadow-blue-200"
          >
            C&apos;est parti !
          </button>
        </div>
      </div>
    )}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-slate-900">
            {allDone ? "Vous \u00eates pr\u00eat !" : "Bien d\u00e9marrer avec AudiBot"}
          </h2>
          <span className="text-2xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {completedCount}/{steps.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <>
        <ul className="mt-4 space-y-2">
          {steps.map((step) => {
            const Icon = step.checked ? CheckCircle2 : Circle;
            return (
              <li key={step.key} className="flex items-center justify-between gap-3 py-1.5">
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      step.checked ? "text-blue-600" : "text-slate-300"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      step.checked ? "text-slate-400 line-through" : "font-medium text-slate-700"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!step.auto && !step.checked && (
                    <button
                      onClick={() => markStep(step.onboardingValue)}
                      className="text-2xs font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
                    >
                      Marquer comme fait
                    </button>
                  )}
                  {step.key === 0 && !step.checked && (
                    <Link
                      href="/extension"
                      className="text-2xs font-bold text-slate-400 hover:text-blue-600 transition-colors whitespace-nowrap"
                    >
                      Installer →
                    </Link>
                  )}
                  {step.key === 2 && !step.checked && (
                    <Link
                      href="/portails"
                      className="text-2xs font-bold text-slate-400 hover:text-blue-600 transition-colors whitespace-nowrap"
                    >
                      Voir les portails compatibles →
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {allDone && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2">
            <p className="text-green-800 font-black text-sm">🎉 Onboarding terminé — vous êtes prêt !</p>
            <p className="text-green-700 text-xs font-medium">Votre collègue perd aussi 10 min/dossier ?</p>
            <Link href="/dashboard/team" className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-black rounded-xl hover:bg-green-700 transition-colors">
              Inviter un collègue →
            </Link>
          </div>
        )}
        </>
      )}
    </div>
    </>
  );
}
