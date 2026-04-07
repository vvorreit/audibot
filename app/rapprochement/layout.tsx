import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RapprochementLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const plan = session.user?.plan ?? "FREE";
  const isAdmin = session.user?.role === "ADMIN";
  const hasAccess = isAdmin || session.user?.isPro || ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"].includes(plan);
  if (!hasAccess) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">Rapprochement bancaire</h1>
            <p className="text-sm text-slate-600 font-medium mt-1">Associez vos encaissements aux dossiers tiers-payant</p>
          </div>
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
