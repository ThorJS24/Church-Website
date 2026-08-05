import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar } from 'lucide-react';
import { getBlogPost, getBlogPosts } from '@/lib/content';
import { parseBlogContent, estimateReadingTime } from '@/lib/blogContent';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ShareButton } from '@/components/ShareButton';
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
import { PrintButton } from '@/components/PrintButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post not found — Salem Primitive Baptist Church' };

  const title = `${post.title} — Salem Primitive Baptist Church`;
  const description = post.excerpt || post.content.slice(0, 160);
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://salempbc.in/blog/${post.slug}`,
      images: post.imageUrl ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }] : undefined,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const blocks = parseBlogContent(post.content);
  const headings = blocks.filter((b) => b.type === 'heading');
  const readingTime = estimateReadingTime(post.content);

  const allPosts = await getBlogPosts(12);
  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => (a.category === post.category ? -1 : 0) - (b.category === post.category ? -1 : 0))
    .slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    image: post.imageUrl || undefined,
    datePublished: post.date,
    author: post.authorName ? { '@type': 'Person', name: post.authorName } : undefined,
    publisher: { '@type': 'Organization', name: 'Salem Primitive Baptist Church' },
    mainEntityOfPage: `https://salempbc.in/blog/${post.slug}`,
  };

  return (
    <div>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Section spacing="lg">
        <Container size="md">
          <Breadcrumbs items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} className="mb-6 no-print" />

          {post.category && (
            <Link href={`/blog/category/${encodeURIComponent(post.category)}`}>
              <Badge variant="accent" className="mb-3">{post.category}</Badge>
            </Link>
          )}
          <h1 className="text-display-sm text-foreground">{post.title}</h1>

          <div className="mt-5 flex items-center gap-4">
            {post.authorName && <Avatar name={post.authorName} size="sm" />}
            <div className="text-body-sm text-foreground-muted">
              {post.authorName && (
                <Link href={`/blog/author/${encodeURIComponent(post.authorName)}`} className="font-medium text-foreground hover:text-accent hover:underline">
                  {post.authorName}
                </Link>
              )}
              <p className="flex items-center gap-3 text-caption text-foreground-subtle">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readingTime} min read</span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 no-print">
              <PrintButton />
              <ShareButton title={post.title} />
            </div>
          </div>

          {post.imageUrl && (
            <div className="relative mt-8 h-64 w-full overflow-hidden rounded-xl bg-surface-active sm:h-96">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
          )}

          <div className="mt-10 grid gap-10 md:grid-cols-[1fr_220px]">
            <article className="max-w-none">
              {blocks.map((block, i) =>
                block.type === 'heading' ? (
                  <h2 key={i} id={block.id} className="mt-8 text-headline-sm text-foreground scroll-mt-24">
                    {block.text}
                  </h2>
                ) : (
                  <p key={i} className="mt-4 text-body-lg leading-relaxed text-foreground-muted">
                    {block.text}
                  </p>
                )
              )}
            </article>

            {headings.length >= 2 && (
              <aside className="hidden no-print md:block">
                <div className="sticky top-24 rounded-xl border border-border bg-surface p-5">
                  <p className="mb-3 text-label uppercase tracking-wide text-foreground-subtle">On this page</p>
                  <nav className="space-y-2">
                    {headings.map((h) => (
                      <a key={h.id} href={`#${h.id}`} className="block text-body-sm text-foreground-muted hover:text-accent">
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </Section>

      {relatedPosts.length > 0 && (
        <Section spacing="lg" className="bg-surface no-print">
          <Container size="md">
            <h2 className="mb-6 text-title-lg text-foreground">Related Posts</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="block">
                  <Card padding="none" className="h-full overflow-hidden transition-shadow hover:shadow-md">
                    {related.imageUrl && (
                      <div className="relative aspect-video bg-surface-active">
                        <Image src={related.imageUrl} alt={related.title} fill sizes="300px" className="object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="line-clamp-2 text-body-sm font-medium text-foreground">{related.title}</p>
                      <p className="mt-1 text-caption text-foreground-subtle">{new Date(related.date).toLocaleDateString()}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </div>
  );
}
