import Link from "next/link";
import { Wand2, CircleDot, Users } from "lucide-react";

export default function SmartFillSection() {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Adaptabilité</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            OptiBot s&apos;adapte à votre portail,<br className="hidden md:block" /> pas l&apos;inverse.
          </h3>
          <p className="text-slate-700 font-medium mt-4 max-w-xl mx-auto">
            Deux fonctionnalités qui suppriment définitivement le mur <em>&quot;portail non supporté&quot;</em>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Smart Fill */}
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-card p-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Wand2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Universel</div>
                <h4 className="text-2xl font-black text-slate-900">Smart Fill</h4>
              </div>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Sur n&apos;importe quel portail mutuelle — même un que vous n&apos;avez jamais configuré — OptiBot analyse chaque champ de la page, comprend ce qu&apos;on lui demande, et le remplit.
            </p>
            <div className="space-y-3">
              {[
                "Reconnaît les champs par leur nom, leur label ou leur contexte",
                "Fonctionne avec React, Angular, Vue, jQuery et les portails legacy",
                "Colore en jaune les champs incertains pour que vous vérifiez",
                "Se corrige automatiquement si le portail renvoie une erreur",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-blue-100">
              <p className="text-sm font-black text-blue-700 italic">
                &quot;Aucun portail ne lui résiste.&quot;
              </p>
            </div>
          </div>

          {/* Recorder */}
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-card p-10 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                <CircleDot className="w-7 h-7" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-1">Enregistrez une fois</div>
                <h4 className="text-2xl font-black text-slate-900">Recorder</h4>
              </div>
            </div>
            <p className="text-slate-600 font-medium leading-relaxed">
              Vous travaillez sur un portail qu&apos;OptiBot ne connaît pas encore ? Faites le parcours manuellement une seule fois pendant qu&apos;OptiBot regarde. Il enregistre tout et le rejoue automatiquement pour tous vos prochains dossiers.
            </p>
            <div className="space-y-3">
              {[
                "Enregistre chaque clic, chaque champ, chaque navigation de page",
                "Lie automatiquement vos saisies aux données du patient (NSS, corrections...)",
                "Survit aux navigations multi-pages et aux rechargements",
                "Wizard guidé pour nommer et valider le parcours avant envoi",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black">✓</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-slate-200">
              <p className="text-sm font-black text-slate-700 italic">
                &quot;Faites-le une fois. OptiBot s&apos;en souvient pour toujours.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Effet réseau */}
        <div className="bg-slate-900 rounded-card p-10 text-white flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900">
            <Users className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl font-black mb-2">L&apos;intelligence collective</h4>
            <p className="text-slate-700 font-medium leading-relaxed">
              Chaque opticien qui enregistre un nouveau parcours l&apos;améliore pour tous les autres. Une fois validé, le parcours est partagé à tous les utilisateurs OptiBot sur ce portail. Plus la communauté grandit, plus OptiBot devient puissant.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className="shrink-0 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-blue-50 transition-colors text-sm uppercase tracking-widest whitespace-nowrap"
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>
    </section>
  );
}
