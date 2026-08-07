import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Tag } from 'lucide-react';
import { getBlogPosts } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { EmptyState } from '@/components/ui/states';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);
  return { title: `${categoryName} — Blog — Salem Primitive Baptist Church` };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);
  const allPosts = await getBlogPosts(100);
  const posts = allPosts.filter((p) => p.category === categoryName);

  return (
    <div>
      <PageHero
        icon={<Tag />}
        eyebrow="Category"
        title={categoryName}
        description={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'} in this category`}
        breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: categoryName }]}
      />

      <Section spacing="lg">
        {posts.length === 0 ? (
          <EmptyState icon={Tag} title="No posts found" description="Nothing in this category yet." />
        ) : (
          <Grid cols={3} gap={6}>
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block h-full">
                <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                  {post.imageUrl && (
                    <div className="relative aspect-16/10 bg-surface-active">
                      <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="line-clamp-2 text-title-md text-foreground">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{post.excerpt}</p>}
                    <p className="mt-3 text-caption text-foreground-subtle">
                      {post.authorName ? `${post.authorName} · ` : ''}{new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </Grid>
        )}
      </Section>
    </div>
  );
}
