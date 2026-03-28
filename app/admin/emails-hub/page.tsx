"use client";
import { useState } from "react";
import { Mail, Send, Inbox, UserX } from "lucide-react";
import dynamic from "next/dynamic";

const EmailsClient = dynamic(() => import("../emails/EmailsClient"), { ssr: false });
const CampagnesContent = dynamic(() => import("../campagnes/CampagnesContent"), { ssr: false });
const InboxContent = dynamic(() => import("../inbox/InboxContent"), { ssr: false });
const UnsubscribesContent = dynamic(() => import("../unsubscribes/UnsubscribesContent"), { ssr: false });

export default function EmailsHubPage() {
  const [tab, setTab] = useState("templates");
  const tabs = [
    { id: "templates",  label: "Templates",  icon: Mail },
    { id: "campagnes",  label: "Campagnes",  icon: Send },
    { id: "inbox",      label: "Inbox",      icon: Inbox },
    { id: "desinscrits",label: "Désinscrits",icon: UserX },
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
      {tab === "templates"   && <EmailsClient />}
      {tab === "campagnes"   && <CampagnesContent />}
      {tab === "inbox"       && <InboxContent />}
      {tab === "desinscrits" && <UnsubscribesContent />}
    </div>
  );
}
