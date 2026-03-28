import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantCls: Record<ButtonVariant, string> = {
  primary:   "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300",
  danger:    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 disabled:text-slate-300",
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "px-3 py-2.5 text-sm rounded-xl font-bold min-h-[44px]",
  md: "px-5 py-2.5 text-sm rounded-2xl font-bold min-h-[44px]",
  lg: "px-7 py-3.5 text-base rounded-2xl font-bold min-h-[48px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${variantCls[variant]} ${sizeCls[size]} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
