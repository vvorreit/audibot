import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  icon?: LucideIcon;
  iconColor?: string; // ex: "bg-indigo-100 text-indigo-600"
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Header uniforme pour toutes les pages admin secondaires.
 * Utilisation :
 *   <AdminPageHeader icon={ShieldCheck} iconColor="bg-indigo-100 text-indigo-600" title="Logs d'audit" subtitle="32 actions" actions={<button>Actualiser</button>} />
 */
export default function AdminPageHeader({ icon: Icon, iconColor = "bg-blue-100 text-blue-600", title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-400 text-xs font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
