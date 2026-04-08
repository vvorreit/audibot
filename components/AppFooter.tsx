"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Produit: [
    { label: "Fonctionnalités", href: "/fonctionnalites" },
    { label: "Portails compatibles", href: "/portails" },
    { label: "Guide Recorder", href: "/recorder" },
    { label: "Installer l'extension", href: "/extension" },
  ],
  Support: [
    { label: "Centre d'aide", href: "/support" },
    { label: "Statut", href: "/status" },
    { label: "Blog", href: "/blog" },
  ],
  Légal: [
    { label: "Confidentialité", href: "/legal/confidentialite" },
    { label: "CGU", href: "/legal/cgu" },
    { label: "CGV", href: "/legal/cgv" },
    { label: "Mentions légales", href: "/legal/mentions-legales" },
  ],
};

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Partie haute — logo + colonnes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">

          {/* Logo + baseline */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Image src="/icon.png" alt="AudiBot" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">AudiBot</span>
            </Link>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[160px]">
              L&apos;assistant robotisé des opticiens français.
            </p>
          </div>

          {/* Colonnes liens */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Séparateur */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-medium">
            © {year} AudiBot — Pour les opticiens français
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("audibot_cookie_consent");
              localStorage.removeItem("audibot_analytics_consent");
              localStorage.removeItem("audibot_marketing_consent");
              window.location.reload();
            }}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Gérer mes cookies
          </button>
        </div>

      </div>
    </footer>
  );
}
