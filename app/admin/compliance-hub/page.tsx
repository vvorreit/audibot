"use client";
import { useState } from "react";
import { ShieldCheck, FileText } from "lucide-react";
import dynamic from "next/dynamic";

const AuditContent = dynamic(() => import("../audit/AuditContent"), { ssr: false });
const RgpdContent = dynamic(() => import("./RgpdContent"), { ssr: false });

export default function ComplianceHubPage() {
  const [tab, setTab] = useState("audit");
  const tabs = [
    { id: "audit", label: "Logs audit",  icon: ShieldCheck },
    { id: "rgpd",  label: "RGPD",        icon: FileText },
  ];
  return (
    <div>
      <div className="flex flex-wrap bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm mb-6 gap-1 w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${tab === t.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>
      {tab === "audit" && <AuditContent />}
      {tab === "rgpd"  && <RgpdContent />}
    </div>
  );
}
