import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/** Classe partagée pour les inputs — source unique de vérité */
export const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all";

const baseCls = inputCls;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
}

export function Input({ error, hint, className = "", id, ...props }: InputProps) {
  const errorId = id ? `${id}-error` : undefined;
  const hintId = id ? `${id}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <input
        {...props}
        id={id}
        aria-describedby={error && errorId ? errorId : hint && hintId ? hintId : undefined}
        aria-invalid={error ? "true" : undefined}
        className={`${baseCls} ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
      />
      {hint && !error && <p id={hintId} className="text-2xs text-slate-500 font-medium">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-2xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  hint?: string;
}

export function Select({ error, hint, children, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <select
        {...props}
        className={`${baseCls} ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
      >
        {children}
      </select>
      {hint && !error && <p className="text-2xs text-slate-500 font-medium">{hint}</p>}
      {error && <p className="text-2xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
}

export function Textarea({ error, hint, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        {...props}
        className={`${baseCls} resize-none ${error ? "border-red-400 focus:ring-red-400" : ""} ${className}`}
      />
      {hint && !error && <p className="text-2xs text-slate-500 font-medium">{hint}</p>}
      {error && <p className="text-2xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}
