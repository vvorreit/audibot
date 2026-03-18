"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, RefreshCw, LayoutTemplate, Bell, Zap, BarChart2, Mail } from "lucide-react";

const NAV_ITEMS = [
  { href: "/tiers-payant/dashboard", label: "Tableau de bord", icon: BarChart2, color: "text-emerald-600 bg-emerald-50 border-emerald-200", activeColor: "text-white bg-emerald-600 border-emerald-600" },
  { href: "/tiers-payant", label: "Dossiers", icon: FileText, color: "text-indigo-600 bg-indigo-50 border-indigo-200", activeColor: "text-white bg-indigo-600 border-indigo-600" },
  { href: "/tiers-payant/relances", label: "Relances", icon: RefreshCw, color: "text-amber-600 bg-amber-50 border-amber-200", activeColor: "text-white bg-amber-600 border-amber-600" },
  { href: "/tiers-payant/templates", label: "Courriers", icon: LayoutTemplate, color: "text-violet-600 bg-violet-50 border-violet-200", activeColor: "text-white bg-violet-600 border-violet-600" },
  { href: "/tiers-payant/alertes", label: "Alertes", icon: Bell, color: "text-orange-600 bg-orange-50 border-orange-200", activeColor: "text-white bg-orange-600 border-orange-600" },
  { href: "/tiers-payant/emails", label: "Emails", icon: Mail, color: "text-pink-600 bg-pink-50 border-pink-200", activeColor: "text-white bg-pink-600 border-pink-600" },
  { href: "/tiers-payant/rejets", label: "Rejets auto", icon: Zap, color: "text-red-600 bg-red-50 border-red-200", activeColor: "text-white bg-red-600 border-red-600" },
];

export default function TiersPayantNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {NAV_ITEMS.map(({ href, label, icon: Icon, color, activeColor }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-colors hover:opacity-80 ${isActive ? activeColor : color}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
