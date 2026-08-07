import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';
import { getBlogPosts } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/states';

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const authorName = decodeURIComponent(name);
  return { title: `Posts by ${authorName} — Salem Primitive Baptist Church` };
}

export default async function AuthorPage({ params }: Props) {
  const { name } = await params;
  const authorName = decodeURIComponent(name);
  const allPosts = await getBlogPosts(100);
  const posts = allPosts.filter((p) => p.authorName === authorName);

  return (
    <div>
      <PageHero
        icon={<User />}
        eyebrow="Author"
        title={authorName}
        description={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'} on the blog`}
      />

      <Section spacing="lg">
        {posts.length === 0 ? (
          <EmptyState icon={User} title="No posts found" description="This author hasn't published anything yet." />
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
                    {post.category && <span className="text-caption font-semibold uppercase tracking-wide text-accent">{post.category}</span>}
                    <h2 className="mt-1.5 line-clamp-2 text-title-md text-foreground">{post.title}</h2>
                    {post.excerpt && <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{post.excerpt}</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar name={authorName} size="sm" />
                      <p className="text-caption text-foreground-subtle">{new Date(post.date).toLocaleDateString()}</p>
                    </div>
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
