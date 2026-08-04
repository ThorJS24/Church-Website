import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPost } from '@/lib/content';

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
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <article className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/blog" className="text-sm text-blue-600 hover:underline">&larr; Back to Blog</Link>

          {post.category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-6">{post.category}</p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-3">{post.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {post.authorName ? `${post.authorName} · ` : ''}{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {post.imageUrl && (
            <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-8">
              <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
            </div>
          )}

          <div className="max-w-none">
            {post.content.split('\n').filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
