export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { ArrowLeft, Ear } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — AudiBot`,
    description: post.description,
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

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
              className="hover:text-indigo-600 transition-colors"
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

      {/* Article */}
      <article className="pt-36 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-8 hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour au blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>
          </header>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-li:text-slate-600 prose-table:text-sm prose-th:text-left prose-th:text-slate-900 prose-td:text-slate-600">
            <MDXRemote source={post.content} />
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              Marre de la saisie manuelle ?
            </h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              AudiBot automatise votre tiers payant et vos prescriptions ORL.
              Essayez gratuitement, sans engagement.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex px-8 py-4 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
            >
              Essayez AudiBot gratuitement
            </Link>
          </div>
        </div>
      </article>

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
