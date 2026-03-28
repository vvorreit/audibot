export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import { CreditCard, Eye, Trash2, Plus } from "lucide-react";

export default async function DesignPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* Header */}
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-blue-600 mb-2">OptiBot</p>
          <h1 className="text-4xl font-black text-slate-900">Living Style Guide</h1>
          <p className="text-slate-400 font-medium mt-2">Référence visuelle — ADMIN uniquement</p>
        </div>

        {/* Couleurs */}
        <Section title="Couleurs">
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "blue-600", cls: "bg-blue-600" },
              { label: "blue-50", cls: "bg-blue-50 border" },
              { label: "slate-900", cls: "bg-slate-900" },
              { label: "slate-500", cls: "bg-slate-500" },
              { label: "slate-100", cls: "bg-slate-100 border" },
              { label: "green-600", cls: "bg-green-600" },
              { label: "red-600", cls: "bg-red-600" },
              { label: "amber-500", cls: "bg-amber-500" },
              { label: "violet-600", cls: "bg-violet-600" },
              { label: "white", cls: "bg-white border" },
            ].map(({ label, cls }) => (
              <Tooltip key={label} tip={cls}>
                <div className={`h-12 rounded-xl ${cls}`} />
                <p className="text-2xs font-semibold text-slate-500 mt-1">{label}</p>
              </Tooltip>
            ))}
          </div>
        </Section>

        {/* Typographie */}
        <Section title="Typographie">
          <div className="space-y-3 bg-white p-6 rounded-2xl border border-slate-100">
            {[
              { cls: "text-4xl font-black", label: "text-4xl font-black", text: "Heading XL" },
              { cls: "text-2xl font-black", label: "text-2xl font-black", text: "Heading L" },
              { cls: "text-xl font-bold", label: "text-xl font-bold", text: "Heading M" },
              { cls: "text-base font-semibold", label: "text-base font-semibold", text: "Body large" },
              { cls: "text-sm font-medium", label: "text-sm font-medium", text: "Body" },
              { cls: "text-xs font-medium", label: "text-xs", text: "Small / label" },
              { cls: "text-2xs font-medium", label: "text-2xs (10px)", text: "Micro / badge" },
            ].map(({ cls, label, text }) => (
              <Tooltip key={label} tip={cls}>
                <div className="flex items-baseline gap-4">
                  <p className={`${cls} text-slate-900`}>{text}</p>
                  <code className="text-2xs text-slate-400 font-mono">{cls}</code>
                </div>
              </Tooltip>
            ))}
          </div>
        </Section>

        {/* Boutons */}
        <Section title="Boutons">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Tooltip tip="variant=primary size=lg"><Button size="lg">Primaire LG</Button></Tooltip>
              <Tooltip tip="variant=primary size=md"><Button size="md">Primaire MD</Button></Tooltip>
              <Tooltip tip="variant=primary size=sm"><Button size="sm">Primaire SM</Button></Tooltip>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Tooltip tip="variant=secondary"><Button variant="secondary">Secondaire</Button></Tooltip>
              <Tooltip tip="variant=danger"><Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>Danger</Button></Tooltip>
              <Tooltip tip="variant=ghost"><Button variant="ghost">Ghost</Button></Tooltip>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Tooltip tip="loading=true"><Button loading>Chargement</Button></Tooltip>
              <Tooltip tip="disabled=true"><Button disabled>Désactivé</Button></Tooltip>
              <Tooltip tip="icon=Plus"><Button icon={<Plus className="w-4 h-4" />}>Avec icône</Button></Tooltip>
            </div>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Tooltip tip="<Input />">
                <div>
                  <Label>Label standard</Label>
                  <Input placeholder="Texte placeholder" defaultValue="" onChange={() => {}} />
                </div>
              </Tooltip>
              <Tooltip tip="<Input error=... />">
                <div>
                  <Label required>Champ requis</Label>
                  <Input error="Ce champ est requis" defaultValue="" onChange={() => {}} />
                </div>
              </Tooltip>
              <Tooltip tip="<Input hint=... />">
                <div>
                  <Label>Avec hint</Label>
                  <Input hint="Exemple : 13 chiffres sans espaces" defaultValue="" onChange={() => {}} />
                </div>
              </Tooltip>
              <Tooltip tip="<Select />">
                <div>
                  <Label>Select</Label>
                  <Select defaultValue="">
                    <option value="">Choisir...</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                  </Select>
                </div>
              </Tooltip>
            </div>
            <Tooltip tip="<Textarea />">
              <div>
                <Label>Textarea</Label>
                <Textarea rows={3} placeholder="Remarques..." defaultValue="" onChange={() => {}} />
              </div>
            </Tooltip>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-wrap gap-3">
            {[
              { cls: "bg-blue-600 text-white", label: "PRO" },
              { cls: "bg-blue-50 text-blue-700 border border-blue-100", label: "Actif" },
              { cls: "bg-green-50 text-green-700 border border-green-100", label: "Succès" },
              { cls: "bg-red-50 text-red-700 border border-red-100", label: "Erreur" },
              { cls: "bg-amber-50 text-amber-700 border border-amber-100", label: "Attention" },
              { cls: "bg-slate-100 text-slate-600", label: "Neutre" },
            ].map(({ cls, label }) => (
              <Tooltip key={label} tip={cls}>
                <span className={`inline-flex items-center px-3 py-1 rounded-badge text-2xs font-black uppercase tracking-wide ${cls}`}>
                  {label}
                </span>
              </Tooltip>
            ))}
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tooltip tip="rounded-card border border-slate-100 bg-white shadow-sm p-6">
              <div className="rounded-card border border-slate-100 bg-white shadow-sm p-6 space-y-2">
                <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Section</p>
                <p className="text-xl font-black text-slate-900">Card standard</p>
                <p className="text-sm text-slate-500">Fond blanc, border slate-100, rounded-card.</p>
              </div>
            </Tooltip>
            <Tooltip tip="rounded-card border-2 border-blue-600 bg-white p-6">
              <div className="rounded-card border-2 border-blue-600 bg-white p-6 space-y-2">
                <p className="text-2xs font-black uppercase tracking-widest text-blue-600">Highlight</p>
                <p className="text-xl font-black text-slate-900">Card highlight</p>
                <p className="text-sm text-slate-500">Border blue-600, utilisé pour le bloc validation.</p>
              </div>
            </Tooltip>
          </div>
        </Section>

        {/* Toasts */}
        <Section title="Toasts">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-green-600 text-white text-sm font-semibold max-w-sm">
              ✓ Données copiées avec succès
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-semibold max-w-sm">
              ✕ Erreur lors de l&apos;envoi
            </div>
            <code className="text-2xs text-slate-400 font-mono block">{"showToast('message', 'success' | 'error')"}</code>
          </div>
        </Section>

        {/* Icônes */}
        <Section title="Icônes (Lucide)">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-wrap gap-4">
            {[CreditCard, Eye, Trash2, Plus].map((Icon, i) => (
              <div key={i} className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Icon className="w-5 h-5" />
              </div>
            ))}
            <p className="w-full text-2xs text-slate-400 font-mono mt-2">{"<Icon className=\"w-5 h-5\" /> dans <div className=\"w-10 h-10 bg-blue-50 rounded-2xl\">"}</p>
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        {title}
        <span className="h-px flex-1 bg-slate-200" />
      </h2>
      {children}
    </section>
  );
}

function Tooltip({ tip, children }: { tip: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      {children}
      <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-2xs font-mono px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {tip}
      </div>
    </div>
  );
}
