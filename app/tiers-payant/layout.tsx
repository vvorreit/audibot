import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import TiersPayantTabHeader from "@/components/TiersPayantTabHeader";
import TiersPayantNav from "@/components/TiersPayantNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TiersPayantLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const plan = session.user?.plan ?? "FREE";
  const isAdmin = session.user?.role === "ADMIN";
  const hasTPAccess = isAdmin || session.user?.isPro || ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"].includes(plan);
  if (!hasTPAccess) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
          {/* Titre + sous-titre entre NavMenu et nav secondaire */}
          <TiersPayantTabHeader />
          <TiersPayantNav />
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
