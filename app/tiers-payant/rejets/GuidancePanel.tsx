"use client";

import { Lightbulb, ScanLine, Pencil, Phone, Info } from "lucide-react";
import Link from "next/link";

interface GuidanceData {
  id: string;
  titre: string;
  description: string;
  actionType: string;
  actionUrl: string | null;
  portail: string;
}

const ACTION_CONFIG: Record<
  string,
  { icon: typeof Info; color: string; bgColor: string; borderColor: string; label: string; href: string }
> = {
  rescan: {
    icon: ScanLine,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "Rescanner la carte",
    href: "/dashboard",
  },
  edit: {
    icon: Pencil,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Modifier les donnees",
    href: "/tiers-payant",
  },
  contact: {
    icon: Phone,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Contacter la mutuelle",
    href: "/tiers-payant/relances",
  },
  info: {
    icon: Info,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    label: "Voir les details",
    href: "/tiers-payant",
  },
};

export default function GuidancePanel({ guidance }: { guidance: GuidanceData }) {
  const config = ACTION_CONFIG[guidance.actionType] ?? ACTION_CONFIG.info;
  const Icon = config.icon;
  const actionHref = guidance.actionUrl ?? config.href;

  return (
    <tr>
      <td colSpan={8} className="px-5 pb-4 pt-0">
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
          <div className={`p-2 rounded-lg bg-white/60 ${config.color} shrink-0`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-black ${config.color}`}>{guidance.titre}</p>
            <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">{guidance.description}</p>
          </div>
          <Link
            href={actionHref}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-2xs font-bold border transition-colors hover:opacity-80 ${config.color} ${config.borderColor} bg-white`}
          >
            <Icon className="w-3 h-3" />
            {config.label}
          </Link>
        </div>
      </td>
    </tr>
  );
}
