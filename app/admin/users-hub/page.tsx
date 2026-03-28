"use client";
import { useState } from "react";
import { Users, Building2, TrendingDown, Star } from "lucide-react";
import dynamic from "next/dynamic";

const UsersContent = dynamic(() => import("../users/UsersContent"), { ssr: false });
const TeamsContent = dynamic(() => import("../teams/TeamsContent"), { ssr: false });
const ChurnContent = dynamic(() => import("../churn/ChurnContent"), { ssr: false });
const NpsContent = dynamic(() => import("./NpsContent"), { ssr: false });

export default function UsersHubPage() {
  const [tab, setTab] = useState("users");
  const tabs = [
    { id: "users",  label: "Utilisateurs", icon: Users },
    { id: "teams",  label: "Équipes",       icon: Building2 },
    { id: "churn",  label: "Churn",         icon: TrendingDown },
    { id: "nps",    label: "NPS",           icon: Star },
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
      {tab === "users" && <UsersContent />}
      {tab === "teams" && <TeamsContent />}
      {tab === "churn" && <ChurnContent />}
      {tab === "nps" && <NpsContent />}
    </div>
  );
}
