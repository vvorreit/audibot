import React from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, Timer, ArrowRight, Chrome, Smartphone, MousePointerClick, ScanLine, FileText, AlertCircle, Bot, Bell, Users, Settings, ShieldCheck, HelpCircle, ClipboardList } from "lucide-react";
import { Badge } from "./GuideComponents";

const tocItems = [
  { href: "#extension",    icon: Chrome,            label: "1. Extension Chrome" },
  { href: "#scan-mobile",  icon: Smartphone,        label: "2. Scan mobile / PWA" },
  { href: "#bilan",        icon: ClipboardList,     label: "3. Bilan visuel" },
  { href: "#ocr",          icon: ScanLine,          label: "4. OCR documents" },
  { href: "#autofill",     icon: MousePointerClick, label: "5. Autofill portails" },
  { href: "#tiers-payant", icon: FileText,          label: "6. Tiers payant" },
  { href: "#rejets",       icon: AlertCircle,       label: "7. Codes rejet" },
  { href: "#rpa",          icon: Bot,               label: "8. RPA Avancé" },
  { href: "#alertes",      icon: Bell,              label: "9. Alertes" },
  { href: "#equipe",       icon: Users,             label: "10. Équipe" },
  { href: "#compte",       icon: Settings,          label: "11. Mon compte" },
  { href: "#securite",     icon: ShieldCheck,       label: "12. Sécurité RGPD" },
  { href: "#faq",          icon: HelpCircle,        label: "13. FAQ" },
];

export default function GuideHero() {
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600">Guide complet</span>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <Badge color="green">Documentation officielle</Badge>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 leading-tight">
          Guide complet AudiBot
        </h1>
        <p className="text-lg text-slate-700 font-medium max-w-2xl leading-relaxed">
          Tout ce que vous devez savoir pour maitriser AudiBot — de l&apos;installation à l&apos;automatisation
          complète de votre tiers payant, avec bilan visuel, FAQ et résolution de problèmes.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Timer className="w-3.5 h-3.5" /> ~18 min de lecture
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <Badge color="green">Débutant → Avancé</Badge>
          <Badge color="blue">Mis à jour avril 2026</Badge>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {tocItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
                <ArrowRight className="w-3 h-3 ml-auto opacity-30 shrink-0" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
