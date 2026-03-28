import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import AdminNav from "@/components/AdminNav";
import AdminTabHeader from "@/components/AdminTabHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <NavMenu />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
          {/* Titre + sous-titre entre NavMenu et AdminNav */}
          <AdminTabHeader />
          <AdminNav />
          {children}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
