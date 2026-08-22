import Image from 'next/image';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { BlogPost } from '@/lib/content';
import { Badge } from '@/components/ui/badge';

// An editorial featured-post + compact-list layout instead of a 3-up card
// grid — the homepage already has one image-top card grid (the events
// strip above); repeating the identical pattern here read as the same
// section twice. This reads as a magazine "latest articles" module instead.
export default function BlogHighlights({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Link href={`/blog/${featured.slug}`} className="group block">
        <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-surface-active">
          {featured.imageUrl ? (
            <Image src={featured.imageUrl} alt={featured.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-foreground-subtle" />
            </div>
          )}
        </div>
        {featured.category && <Badge variant="neutral" className="mt-4">{featured.category}</Badge>}
        <h3 className="mt-3 font-serif text-headline-sm text-foreground group-hover:text-accent">{featured.title}</h3>
        {featured.excerpt && <p className="mt-2 line-clamp-2 text-body-md text-foreground-muted">{featured.excerpt}</p>}
      </Link>

      {rest.length > 0 && (
        <ul className="flex flex-col divide-y divide-border">
          {rest.map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex items-start gap-4 py-4 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-active">
                  {post.imageUrl ? (
                    <Image src={post.imageUrl} alt={post.title} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-5 w-5 text-foreground-subtle" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-title-sm text-foreground group-hover:text-accent line-clamp-2">{post.title}</h4>
                  {post.category && <p className="mt-1 text-caption text-foreground-subtle">{post.category}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
