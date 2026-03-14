"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  CheckCircle, Zap, ShieldCheck, ArrowRight, 
  CreditCard, Layers, ChevronDown, ChevronUp, 
  Timer, MousePointerClick, Search, FileText,
  Lock, ZapOff, Bot, Ear, Activity, HeartPulse
} from "lucide-react";

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-indigo-600 transition-colors group"
      >
        <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-600">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
        <p className="text-slate-500 leading-relaxed font-medium">
          {answer}
        </p>
      </div>
    </div>
  );
}

function LandingContent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen bg-white flex items-center justify-center text-indigo-600 font-bold">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 text-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
              <Ear className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">AudiBot</span>
          </div>
          <div className="hidden lg:flex gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <a href="#comment-ca-marche" className="hover:text-indigo-600 transition-colors">La Solution</a>
            <a href="#avantages" className="hover:text-indigo-600 transition-colors">Avantages</a>
            <a href="#tarifs" className="hover:text-indigo-600 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <Link href="/dashboard" className="px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
                Tableau de Bord
              </Link>
            ) : (
              <Link href="/dashboard" className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
                Essai Gratuit
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent -z-10"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Bot className="w-3 h-3" />
            L'assistant robotisé des audioprothésistes
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.95] text-slate-900">
            Moins de clavier,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">plus d'écoute.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium italic">
            "Je passais 15 minutes par dossier à recopier la prescription ORL et la carte mutuelle…<br className="hidden md:block"/>
            Aujourd'hui, AudiBot le fait en 10 secondes."
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/dashboard" className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 text-lg group active:scale-95 uppercase tracking-widest">
              Démarrer l'essai gratuit
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-14 bg-white border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "3 500+", label: "Centres audio FR"   },
            { value: "15 min", label: "Économisées/dossier" },
            { value: "10s",    label: "Par dossier"         },
            { value: "0",      label: "Donnée stockée"      },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-slate-900">{s.value}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section id="comment-ca-marche" className="py-24 bg-slate-50 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">La Solution</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Comment ça marche ?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: "01", title: "Déposez le document", 
                desc: "Glissez la prescription ORL ou la carte mutuelle (PDF/Photo) sur votre tableau de bord AudiBot.",
                icon: FileText
              },
              { 
                step: "02", title: "Le Bot analyse", 
                desc: "AudiBot extrait instantanément le patient, l'audiogramme (OD/OG), la classe d'appareillage et les données mutuelle.",
                icon: Activity
              },
              { 
                step: "03", title: "C'est rempli !", 
                desc: "Un clic sur l'extension et votre logiciel métier (Auditdata…) ou votre portail mutuelle (Almerys, Viamedis, Ameli Pro) est rempli automatiquement.",
                icon: MousePointerClick
              }
            ].map((s, idx) => (
              <div key={idx} className="relative group">
                <div className="text-8xl font-black text-slate-100 absolute -top-10 -left-4 group-hover:text-indigo-50 transition-colors">{s.step}</div>
                <div className="relative z-10 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 group-hover:shadow-xl group-hover:-translate-y-2 transition-all">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                    <s.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black mb-4">{s.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="avantages" className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Pourquoi AudiBot ?</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">La sécurité d'un outil local, la vitesse d'un Bot.</h3>
              
              <div className="space-y-8">
                {[
                  { 
                    title: "Confidentialité Totale (OCR Local)", 
                    desc: "Contrairement aux solutions cloud, l'analyse se fait sur VOTRE ordinateur. Aucune donnée de santé de vos patients — NSS, audiogramme, données médicales — ne transite par nos serveurs.",
                    icon: Lock 
                  },
                  { 
                    title: "Zéro Erreur de Saisie", 
                    desc: "Fini les inversions de chiffres sur le NSS ou les erreurs de classe d'appareillage. Le Bot lit la prescription ORL avec une précision chirurgicale.",
                    icon: ZapOff 
                  },
                  { 
                    title: "Intégration ERP & Mutuelles", 
                    desc: "Spécialisé pour Auditdata, et compatible avec Almerys, Viamedis et Ameli Pro (SCOR) — tous les portails de tiers-payant audioprothèse.",
                    icon: Layers 
                  }
                ].map((a, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <a.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black mb-2">{a.title}</h4>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-[60px] p-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px]"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                        <Timer className="w-6 h-6" />
                     </div>
                     <p className="text-2xl font-black tracking-tight">Le comparatif</p>
                  </div>
                  <div className="space-y-12">
                     <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Saisie Manuelle</p>
                        <div className="flex items-center gap-4">
                           <div className="h-4 bg-red-500 rounded-full w-full"></div>
                           <span className="font-black text-red-500 shrink-0">15 MIN</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Avec AudiBot</p>
                        <div className="flex items-center gap-4">
                           <div className="h-4 bg-indigo-600 rounded-full w-12"></div>
                           <span className="font-black text-indigo-400 shrink-0">10 SEC</span>
                        </div>
                     </div>
                  </div>
                  <div className="mt-16 pt-10 border-t border-white/10">
                     <p className="text-xl font-bold italic text-slate-300">"C'est comme avoir un secrétaire robotisé ultra-rapide dédié à la saisie administrative."</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-24 bg-slate-50 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Tarifs</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Investissez dans votre temps.</h3>
            <p className="text-slate-500 font-medium mt-4">Sans engagement. Annulable en un clic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch text-slate-900">
            
            <div className="p-10 rounded-[40px] border border-slate-100 bg-white flex flex-col group hover:shadow-2xl transition-all duration-500">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Pack Solo <br/><span className="text-indigo-600">Mutuelle</span></h3>
              <p className="text-slate-500 text-sm mb-8 font-medium italic">Spécialiste du Tiers-Payant audioprothèse.</p>
              <div className="text-4xl sm:text-5xl font-black mb-8 whitespace-nowrap">32,90€<span className="text-base sm:text-lg text-slate-400 font-bold">/mois HT</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Saisie Mutuelles Illimitée</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Almerys, Viamedis & +</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-indigo-600" /> Extension Chrome Pro</li>
              </ul>
              <Link href="/dashboard" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all text-center uppercase tracking-widest text-xs">
                Commencer l'essai
              </Link>
            </div>

            <div className="p-12 rounded-[50px] border-4 border-indigo-600 bg-white shadow-[0_50px_80px_-20px_rgba(99,102,241,0.25)] flex flex-col relative scale-105 z-10">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-full shadow-xl">Recommandé</div>
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Pack Duo <br/><span className="text-indigo-600">Complet</span></h3>
              <p className="text-slate-500 text-sm mb-8 font-medium italic">Saisie complète dossier audioprothèse.</p>
              <div className="text-4xl sm:text-5xl font-black mb-8 whitespace-nowrap">49,90€<span className="text-base sm:text-lg text-slate-400 font-bold">/mois HT</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> <strong>Saisie ERP Inclus (Auditdata)</strong></li>
                <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> Toutes Mutuelles + Ameli Pro</li>
                <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> Support Prioritaire</li>
                <li className="flex items-center gap-3 text-sm font-black text-slate-800"><CheckCircle className="w-5 h-5 text-indigo-600" /> Multi-postes inclus</li>
              </ul>
              <Link href="/dashboard" className="w-full py-5 bg-indigo-600 text-white font-black rounded-[24px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 text-lg uppercase tracking-widest text-sm">
                Essayer le Pack Duo
              </Link>
            </div>

            <div className="p-10 rounded-[40px] border border-slate-100 bg-white flex flex-col group hover:shadow-2xl transition-all duration-500">
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Pack Solo <br/><span className="text-violet-600">ERP / Auditdata</span></h3>
              <p className="text-slate-500 text-sm mb-8 font-medium italic">Spécialiste de la fiche patient audio.</p>
              <div className="text-4xl sm:text-5xl font-black mb-8 whitespace-nowrap">32,90€<span className="text-base sm:text-lg text-slate-400 font-bold">/mois HT</span></div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-violet-500" /> Saisie ERP Illimitée</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-violet-500" /> Spécialisé Auditdata</li>
                <li className="flex items-center gap-3 text-sm font-bold text-slate-700"><CheckCircle className="w-5 h-5 text-violet-500" /> Autofill Prescription ORL</li>
              </ul>
              <Link href="/dashboard" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-violet-600 transition-all text-center uppercase tracking-widest text-xs">
                Commencer l'essai
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Questions Fréquentes</h2>
            <p className="text-slate-500 font-medium italic">On répond à tout.</p>
          </div>
          <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100 text-slate-900">
            <FAQItem 
              question="Pourquoi c'est plus sûr qu'une solution cloud ?" 
              answer="L'analyse OCR se fait directement dans votre navigateur, sur votre ordinateur. Les données de santé de vos patients — audiogramme, NSS, données ORL — ne transitent jamais par nos serveurs. Conformité RGPD native, sans compromis." 
            />
            <FAQItem 
              question="Quels logiciels métiers sont compatibles ?" 
              answer="Nous sommes spécialisés sur Auditdata pour une intégration parfaite. Nous supportons également Ameli Pro (SCOR) pour la télétransmission. Le support Otosuite et Easyaudio est en développement." 
            />
            <FAQItem 
              question="Est-ce que ça lit bien les prescriptions ORL ?" 
              answer="Oui. Le Bot est entraîné sur les formats de prescriptions ORL françaises. Il extrait l'audiogramme complet (250Hz à 4kHz, OD et OG), la classe d'appareillage (1 ou 2), le type d'appareil et les informations patient automatiquement." 
            />
            <FAQItem 
              question="Peut-on tester avant de payer ?" 
              answer="Absolument. Chaque nouvel inscrit bénéficie de 5 scans gratuits sans carte bancaire pour tester AudiBot en conditions réelles dans son centre." 
            />
            <FAQItem 
              question="Ça fonctionne avec une simple photo de prescription ?" 
              answer="Oui. Que ce soit un PDF généré par le logiciel de l'ORL ou une photo prise avec votre smartphone, AudiBot redresse et nettoie l'image pour une lecture optimale." 
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-indigo-500/50">
            <Ear className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Moins de clavier,<br /> plus d'écoute.</h2>
          <Link href="/dashboard" className="px-12 py-6 bg-white text-slate-900 font-black rounded-[32px] hover:bg-indigo-50 transition-all text-2xl shadow-2xl active:scale-95 inline-block uppercase tracking-widest">
             Essayer AudiBot Gratuitement
          </Link>
          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Link href="/legal/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/legal/cgu" className="hover:text-white transition-colors">Conditions</Link>
              <Link href="/legal/mentions-legales" className="hover:text-white transition-colors">Mentions</Link>
            </div>
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
              © 2026 AudiBot — Pour les Audioprothésistes
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return <LandingContent />;
}
