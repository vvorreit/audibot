"use client";
/**
 * Stats hub with contextual tabs based on user permissions.
 * Exports: StatsHub (default)
 * ~110 lines
 */

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useFeatures } from "@/hooks/useFeatures";
import { ClipboardList, Euro, Store, BarChart3, ArrowRight, LayoutDashboard, ScanLine, TrendingUp, Brain } from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import BilanStatsPanel from "./BilanStatsPanel";
import TPStatsPanel from "./TPStatsPanel";
import EquipeStatsPanel from "./EquipeStatsPanel";
import OcrStatsPanel from "./OcrStatsPanel";
import ROIPanel from "@/app/tiers-payant/roi/ROIDashboard";
import MutuelleIntelPanel from "./mutuelle-intel/MutuelleIntelPanel";
import SynthesePanel from "./SynthesePanel";

type TabDef = { id: string; label: string; icon: React.ElementType };

function UpsellEmpty() {
  return (
    <DashboardShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Statistiques avancees</h1>
          <p className="text-slate-600 font-medium max-w-md mx-auto">
            Accedez a vos rapports de bilans auditifs, suivi tiers-payant et analytics d&apos;equipe avec un plan Pro ou superieur.
          </p>
        </div>
        <Link href="/dashboard/account" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-colors">
          Voir les plans <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </DashboardShell>
  );
}

export default function StatsHub({ defaultTab: propTab }: { defaultTab?: string } = {}) {
  const { data: session } = useSession();
  const { features } = useFeatures();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? propTab;
  const user = session?.user;

  const effectivePlan = user?.plan ?? "FREE";
  const effectiveTeamPlan = (user as Record<string, unknown>)?.teamPlan as string ?? "";
  const isAdmin = user?.role === "ADMIN";
  const isTeamOwner = user?.teamRole === "OWNER";
  const isEquipePlan = ["EQUIPE", "TEAM_5", "TEAM_3"].includes(effectivePlan) || ["EQUIPE", "TEAM_5", "TEAM_3"].includes(effectiveTeamPlan);
  const isProPlan = effectivePlan === "PRO";
  const isCabinetPlan = ["CABINET", "RESEAU", "ENTERPRISE"].includes(effectivePlan) || ["CABINET", "RESEAU", "ENTERPRISE"].includes(effectiveTeamPlan);
  const hasTPAccess = isProPlan || isEquipePlan || isCabinetPlan || isAdmin || user?.isPro;
  const hasBilanAccess = isAdmin || features.bilanAuditif;
  const hasEquipeAccess = ((isEquipePlan || isCabinetPlan) && isTeamOwner) || isAdmin;

  const tabs: TabDef[] = [];
  tabs.push({ id: "ocr", label: "Scans OCR", icon: ScanLine });
  if (hasBilanAccess) tabs.push({ id: "bilans", label: "Bilans", icon: ClipboardList });
  if (hasTPAccess) tabs.push({ id: "tiers-payant", label: "Tiers-Payant", icon: Euro });
  if (hasTPAccess) tabs.push({ id: "roi", label: "ROI", icon: TrendingUp });
  if (isAdmin) tabs.push({ id: "mutuelles", label: "Mutuelles", icon: Brain });
  if (hasEquipeAccess) tabs.push({ id: "equipe", label: "Mon equipe", icon: Store });

  /* Synthese toujours en premier si au moins un acces */
  if (tabs.length > 0) {
    tabs.unshift({ id: "synthese", label: "Synthese", icon: LayoutDashboard });
  }

  /* Support ?tab=equipe (redirect depuis /dashboard/franchise) */
  const defaultTab = initialTab && tabs.some(t => t.id === initialTab) ? initialTab : (tabs[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  if (tabs.length === 0) return <UpsellEmpty />;

  return (
    <DashboardShell>
      {/* Page header */}
      <div className="pb-4 border-b border-slate-100 mb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Statistiques</h1>
        <p className="text-slate-600 text-xs font-medium mt-0.5">Vos indicateurs cles et rapports de performance</p>
      </div>

      {/* Tab bar (only if 2+ tabs) */}
      {tabs.length >= 2 && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === "synthese" && (
        <SynthesePanel
          hasBilanAccess={hasBilanAccess}
          hasTPAccess={!!hasTPAccess}
          hasEquipeAccess={hasEquipeAccess}
        />
      )}
      {activeTab === "ocr" && <OcrStatsPanel />}
      {activeTab === "bilans" && <BilanStatsPanel />}
      {activeTab === "tiers-payant" && <TPStatsPanel />}
      {activeTab === "roi" && <ROIPanel />}
      {activeTab === "mutuelles" && <MutuelleIntelPanel />}
      {activeTab === "equipe" && <EquipeStatsPanel />}
    </DashboardShell>
  );
}
