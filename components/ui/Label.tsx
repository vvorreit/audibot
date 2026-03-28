import type { LabelHTMLAttributes } from "react";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export default function Label({ required, children, className = "", ...props }: LabelProps) {
  return (
    <label
      {...props}
      className={`block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 ${className}`}
    >
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}
