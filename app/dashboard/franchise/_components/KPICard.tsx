import type { LucideIcon } from "lucide-react";

export function KPICard({ icon: Icon, label, value, color, bgColor }: {
  icon: LucideIcon; label: string; value: string; color: string; bgColor: string;
}) {
  return (
    <div className="bg-white rounded-card border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-2xs font-bold uppercase tracking-wide text-slate-600">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
