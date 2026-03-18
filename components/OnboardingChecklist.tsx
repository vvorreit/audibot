"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { updateOnboardingStep } from "@/app/actions/onboarding";

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
  }, [currentStep]);

  /* Step 2 (premier doc): auto-check when clientCount >= 1 */
  useEffect(() => {
    if (clientCount >= 1 && currentStep < 2) {
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
    { key: 0, label: "Compte créé", checked: true, auto: true },
    { key: 1, label: "Installer l'extension Chrome", checked: currentStep >= 1, auto: false },
    { key: 2, label: "Uploader un premier document", checked: currentStep >= 2, auto: true },
    { key: 3, label: "Copier les données", checked: currentStep >= 3, auto: true },
    { key: 4, label: "Remplir un formulaire avec le bot", checked: currentStep >= 4, auto: false },
  ];

  const completedCount = steps.filter((s) => s.checked).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  /* All done → hide after 2s */
  useEffect(() => {
    if (completedCount === steps.length) {
      const timer = setTimeout(() => setDone(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [completedCount, steps.length]);

  if (done) return null;

  const allDone = completedCount === steps.length;

  return (
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
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
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
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <ul className="mt-4 space-y-2">
          {steps.map((step) => {
            const Icon = step.checked ? CheckCircle2 : Circle;
            return (
              <li key={step.key} className="flex items-center justify-between gap-3 py-1.5">
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      step.checked ? "text-indigo-600" : "text-slate-300"
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
                {!step.auto && !step.checked && step.key !== 0 && (
                  <button
                    onClick={() => markStep(step.key)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap"
                  >
                    Marquer comme fait
                  </button>
                )}
                {step.key === 1 && !step.checked && (
                  <a
                    href="/extension"
                    className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors whitespace-nowrap"
                  >
                    Installer
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
