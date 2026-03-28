import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Clock } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

// Contenu statique (fichiers MDX) — génération statique au build
export const revalidate = 3600; // revalider toutes les heures max

export const metadata: Metadata = {
  title: "Blog OptiBot — Conseils tiers payant et automatisation pour opticiens",
  description:
    "Guides pratiques pour opticiens indépendants : automatiser la saisie tiers payant, réduire les rejets mutuelles, gagner du temps sur Almerys, Wemind, Viamedis. Conseils concrets et retours terrain.",
  alternates: { canonical: "https://optibot.fr/blog" },
  openGraph: {
    title: "Blog OptiBot — Conseils tiers payant pour opticiens",
    description: "Guides pratiques pour opticiens : automatiser la saisie tiers payant, réduire les rejets mutuelles, gagner 1h30/jour sur Almerys, Wemind, Viamedis.",
    url: "https://optibot.fr/blog",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon.png" alt="OptiBot logo" width={36} height={36} className="rounded-xl shadow-sm" />
            <span className="text-xl font-bold tracking-tight uppercase text-slate-900">
              OptiBot
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 mb-4">
            Blog
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Conseils tiers payant
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              pour opticiens
            </span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Des articles pratiques pour gagner du temps sur votre saisie tiers
            payant, éviter les rejets, et vous concentrer sur vos clients.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <article className="group p-8 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-4">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-3">
                  {post.title}
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                  Lire l&apos;article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4">
            Prêt à gagner du temps ?
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            Essayez OptiBot gratuitement et récupérez 1h par jour sur votre
            saisie tiers payant.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Essayer gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
