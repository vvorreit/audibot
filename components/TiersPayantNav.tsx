"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, RefreshCw, LayoutTemplate, Bell, Zap, BarChart2, Mail, Scale } from "lucide-react";

const NAV_ITEMS = [
  { href: "/tiers-payant/dashboard", label: "Tableau de bord", icon: BarChart2 },
  { href: "/tiers-payant",           label: "Dossiers",         icon: FileText },
  { href: "/tiers-payant/relances",  label: "Relances",         icon: RefreshCw },
  { href: "/tiers-payant/litiges",   label: "Litiges",          icon: Scale },
  { href: "/tiers-payant/templates", label: "Courriers",        icon: LayoutTemplate },
  { href: "/tiers-payant/alertes",   label: "Alertes",          icon: Bell },
  { href: "/tiers-payant/emails",    label: "Emails",           icon: Mail },
  { href: "/tiers-payant/rejets",    label: "Rejets auto",      icon: Zap },
];

export default function TiersPayantNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm mb-6 gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
