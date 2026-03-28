"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavCTA() {
  const { status } = useSession();
  if (status === "authenticated") {
    return (
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
      >
        Tableau de Bord
      </Link>
    );
  }
  return (
    <Link
      href="/dashboard"
      className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
    >
      Essai Gratuit
    </Link>
  );
}
