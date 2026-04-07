interface DashboardShellProps {
  children: React.ReactNode;
  /** Classes supplémentaires appliquées au conteneur interne (optionnel). */
  innerClassName?: string;
}

/**
 * Conteneur standard de toutes les pages /dashboard.
 * Référentiel : max-w-7xl mx-auto px-6 pt-20 pb-10
 */
export default function DashboardShell({ children, innerClassName }: DashboardShellProps) {
  return (
    <main className="bg-slate-50 min-h-screen pb-10">
      <div className={`max-w-7xl mx-auto px-6 pt-20 pb-10${innerClassName ? ` ${innerClassName}` : ""}`}>
        {children}
      </div>
    </main>
  );
}
