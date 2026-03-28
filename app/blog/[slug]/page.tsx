import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://optibot.fr/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `https://optibot.fr/blog/${slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ["OptiBot"],
      images: [{ url: "/icon.png", width: 800, height: 600, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/icon.png"],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "author": { "@type": "Organization", "name": "OptiBot", "url": "https://optibot.fr" },
    "publisher": { "@type": "Organization", "name": "OptiBot", "url": "https://optibot.fr", "logo": { "@type": "ImageObject", "url": "https://optibot.fr/icon.png" } },
    "url": `https://optibot.fr/blog/${slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://optibot.fr/blog/${slug}` },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
            href="/blog"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tous les articles
          </Link>
        </div>
      </nav>

      {/* Article */}
      <article className="pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-6">
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
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              {post.title}
            </h1>
          </header>

          {/* Content */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-strong:text-slate-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-li:text-slate-600 prose-li:font-medium prose-blockquote:border-blue-600 prose-blockquote:text-slate-500">
            <MDXRemote source={post.content} />
          </div>
        </div>
      </article>

      {/* Voir aussi */}
      {(() => {
        const all = getAllPosts().filter(p => p.slug !== slug);
        /* Scorer par mots communs dans le slug */
        const slugWords = slug.split("-").filter(w => w.length > 4);
        const scored = all.map(p => ({
          ...p,
          score: slugWords.filter(w => p.slug.includes(w) || p.title.toLowerCase().includes(w)).length
        }));
        scored.sort((a, b) => b.score - a.score);
        const relatedPosts = scored.slice(0, 3);
        if (relatedPosts.length === 0) return null;
        return (
          <section className="py-12 px-6 border-t border-slate-100">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-black text-slate-900 mb-6">Voir aussi</h2>
              <div className="space-y-4">
                {relatedPosts.map((p) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="block group p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{p.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{p.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-4">
            Essayez OptiBot gratuitement
          </h2>
          <p className="text-slate-500 font-medium mb-8">
            Automatisez votre saisie tiers payant et récupérez du temps pour vos
            clients. Sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Commencer l&apos;essai gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/portails"
              className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:border-blue-300 transition-colors"
            >
              Voir les portails compatibles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
