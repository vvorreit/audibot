"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  BarChart2, Users, Eye, Briefcase,
  Mail, ShieldCheck, UserMinus, Video, Plug,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
}

const PRIMARY: NavItem[] = [
  { href: "/admin/analytics",       label: "Analytiques", icon: BarChart2 },
  { href: "/admin/users-hub",       label: "Utilisateurs", icon: Users },
  { href: "/admin/extension",       label: "Extension",   icon: Plug },
  { href: "/admin/ocr",             label: "OCR",         icon: Eye },
  { href: "/admin/franchise",       label: "Franchise",   icon: Briefcase },
];

const SECONDARY: NavItem[] = [
  { href: "/admin/emails-hub",      label: "Emails",      icon: Mail },
  { href: "/admin/compliance-hub",  label: "Conformité",  icon: ShieldCheck },
  { href: "/admin/parcours",        label: "Parcours",    icon: Video },
  { href: "/admin/churn",           label: "Churn",       icon: UserMinus, danger: true },
];

function NavLink({ item, currentHref }: { item: NavItem; currentHref: string }) {
  const isActive = currentHref === item.href;
  const base = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all";
  const cls = isActive
    ? `${base} bg-blue-600 text-white shadow`
    : item.danger
    ? `${base} text-red-500 hover:bg-red-50`
    : `${base} text-slate-500 hover:text-slate-700 hover:bg-slate-50`;
  const Icon = item.icon;
  return (
    <Link href={item.href} className={cls}>
      <Icon className="w-4 h-4" />
      {item.label}
    </Link>
  );
}

function AdminNavInner() {
  const pathname = usePathname();
  const currentHref = pathname;

  return (
    <div className="flex flex-wrap bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm mb-6 gap-1">
      {PRIMARY.map((item) => <NavLink key={item.href} item={item} currentHref={currentHref} />)}
      <div className="w-px bg-slate-100 mx-1 self-stretch" />
      {SECONDARY.map((item) => <NavLink key={item.href} item={item} currentHref={currentHref} />)}
    </div>
  );
}

export default function AdminNav() {
  return (
    <Suspense fallback={<div className="h-12 bg-white rounded-2xl border border-slate-100 mb-8 animate-pulse" />}>
      <AdminNavInner />
    </Suspense>
  );
}
