import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ArticlePage } from "@/components/help/article-page";
import { LiveChatWidget } from "@/components/support/live-chat-widget";
import { getArticleBySlug, getRelatedArticles, estimateReadingTime, helpArticles } from "@/lib/help-data";
import { BreadcrumbSchema } from "@/lib/json-ld";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return helpArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title} - Plugr Help`,
    description: article.description,
    alternates: {
      canonical: `https://useplugr.app/help/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} - Plugr Help`,
      description: article.description,
      type: "article",
      url: `https://useplugr.app/help/${article.slug}`,
    },
  };
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const relatedArticles = getRelatedArticles(article);
  const readingTime = estimateReadingTime(article);

  return (
    <>
      {BreadcrumbSchema([
        { name: "Home", url: "https://useplugr.app" },
        { name: "Help Center", url: "https://useplugr.app/help" },
        { name: article.title, url: `https://useplugr.app/help/${article.slug}` },
      ])}
      <main className="page-shell px-5 pt-4 sm:px-8 lg:px-16">
        <AppHeader />
        <ArticlePage article={article} readingTime={readingTime} relatedArticles={relatedArticles} />
        <LiveChatWidget />
      </main>
    </>
  );
}
