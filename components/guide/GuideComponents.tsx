import React from "react";
import {
  CheckCircle, Zap, AlertCircle, Info, X, Lock, BookOpen
} from "lucide-react";

export function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "purple" | "amber" | "slate" | "rose" }) {
  const colors: Record<string, string> = {
    blue:   "bg-blue-100 text-blue-700",
    green:  "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    amber:  "bg-amber-100 text-amber-700",
    slate:  "bg-slate-100 text-slate-700",
    rose:   "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[color]}`}>
      {children}
    </span>
  );
}

export function StepNumber({ n, color = "blue" }: { n: number; color?: string }) {
  const bg: Record<string, string> = { blue: "bg-blue-600", green: "bg-green-600", purple: "bg-purple-600", amber: "bg-amber-500", rose: "bg-rose-600", slate: "bg-slate-600", indigo: "bg-indigo-600" };
  return (
    <span className={`w-8 h-8 rounded-full ${bg[color] ?? "bg-blue-600"} text-white text-sm font-black flex items-center justify-center shrink-0`}>
      {n}
    </span>
  );
}

export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600">
      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

export function XItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600">
      <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

export function TipBox({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mt-5">
      <span className="mt-0.5 shrink-0 text-blue-500">{icon ?? <Zap className="w-4 h-4" />}</span>
      <p className="text-sm text-blue-700 font-medium leading-relaxed">{children}</p>
    </div>
  );
}

export function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mt-5">
      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-sm text-amber-700 font-medium leading-relaxed">{children}</p>
    </div>
  );
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 mt-5">
      <Info className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
      <p className="text-sm text-slate-600 font-medium leading-relaxed">{children}</p>
    </div>
  );
}

export function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="block -mt-24 pt-24" />;
}

export function SectionHeader({
  step, label, icon: Icon, title, subtitle, color = "blue"
}: {
  step?: string; label: string; icon: React.ElementType; title: string; subtitle?: string; color?: string
}) {
  const bg: Record<string, string> = { blue: "bg-blue-100", green: "bg-green-100", purple: "bg-purple-100", amber: "bg-amber-100", rose: "bg-rose-100", indigo: "bg-indigo-100", slate: "bg-slate-100" };
  const text: Record<string, string> = { blue: "text-blue-600", green: "text-green-600", purple: "text-purple-600", amber: "text-amber-600", rose: "text-rose-600", indigo: "text-indigo-600", slate: "text-slate-700" };
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className={`w-10 h-10 ${bg[color]} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${text[color]}`} />
      </div>
      <div>
        {step && <p className={`text-xs font-black ${text[color]} uppercase tracking-widest mb-0.5`}>{step}</p>}
        {!step && <p className={`text-xs font-black ${text[color]} uppercase tracking-widest mb-0.5`}>{label}</p>}
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-8 ${className}`}>
      {children}
    </div>
  );
}

export function SubSection({ title, icon: Icon, iconColor = "text-blue-500", children }: {
  title: string; icon: React.ElementType; iconColor?: string; children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}

export function Divider() {
  return <hr className="border-slate-100" />;
}

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-slate-950 text-emerald-400 rounded-2xl px-5 py-4 text-xs font-mono leading-relaxed overflow-x-auto mt-3">
      {children}
    </pre>
  );
}

export function RejetRow({ code, label, cause, fix }: { code: string; label: string; cause: string; fix: string }) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4 align-top">
        <span className="font-mono text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{code}</span>
      </td>
      <td className="py-3 px-4 align-top text-sm font-bold text-slate-800">{label}</td>
      <td className="py-3 px-4 align-top text-xs text-slate-700 leading-relaxed">{cause}</td>
      <td className="py-3 px-4 align-top text-xs text-blue-700 font-medium leading-relaxed">{fix}</td>
    </tr>
  );
}
