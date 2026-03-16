export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, BookOpen, Ear } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog AudiBot — Conseils gestion pour audioprothésistes",
  description:
    "Articles pratiques pour audioprothésistes : tiers payant, 100% Santé, gain de temps.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 text-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
              <Ear className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">
              AudiBot
            </span>
          </Link>
          <div className="hidden lg:flex gap-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Link
              href="/#comment-ca-marche"
              className="hover:text-indigo-600 transition-colors"
            >
              La Solution
            </Link>
            <Link
              href="/#avantages"
              className="hover:text-indigo-600 transition-colors"
            >
              Avantages
            </Link>
            <Link
              href="/#tarifs"
              className="hover:text-indigo-600 transition-colors"
            >
              Tarifs
            </Link>
            <Link
              href="/blog"
              className="text-indigo-600 transition-colors"
            >
              Blog
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Essai Gratuit
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-36 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <BookOpen className="w-3 h-3" />
            Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Conseils pratiques pour audioprothésistes
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Tiers payant, 100% Santé, gain de temps au quotidien. Des articles
            écrits par des gens qui connaissent le terrain.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group p-8 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-indigo-600 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                    Lire l&apos;article
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} AudiBot. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
