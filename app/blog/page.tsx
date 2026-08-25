'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Search, BookOpen, Rss } from 'lucide-react';
import { getBlogPosts, BlogPost } from '@/lib/content';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingState, EmptyState } from '@/components/ui/states';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    getBlogPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['all', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean) as string[]))], [posts]);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = !searchTerm || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.find((p) => p.featured) ?? filteredPosts[0];
  const restPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  if (loading) return <LoadingState label="Loading posts..." />;

  return (
    <div>
      {/* Editorial masthead — a newspaper/magazine flag (rule, serif
          wordmark, rule) with category tabs and search/RSS tucked into the
          same band, instead of the generic icon+eyebrow+title hero every
          other list page opens with. */}
      <div className="border-b-4 border-double border-foreground bg-background">
        <div className="mx-auto max-w-[1680px] px-4 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-foreground pb-4">
            <h1 className="font-serif text-display-md tracking-tight text-foreground">The Salem PBC Journal</h1>
            <a href="/blog/feed.xml" className="hidden items-center gap-1.5 text-body-sm font-medium text-foreground-muted hover:text-accent sm:flex">
              <Rss className="h-4 w-4" /> RSS
            </a>
          </div>
          <p className="mt-3 max-w-lg font-serif text-body-md italic text-foreground-muted">Reflections, updates, and stories from our church family.</p>

          {posts.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 pb-5">
              {categories.length > 2 && categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  style={{ borderBottomColor: selectedCategory === c ? undefined : 'transparent' }}
                  className={`border-b-2 pb-1 text-body-sm font-semibold uppercase tracking-wide transition-colors ${selectedCategory === c ? 'border-accent text-accent' : 'text-foreground-muted hover:text-foreground'}`}
                >
                  {c === 'all' ? 'All Stories' : c}
                </button>
              ))}
              <div className="ml-auto">
                <Input placeholder="Search posts..." aria-label="Search posts" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-56" />
              </div>
            </div>
          )}
        </div>
      </div>

      <Section spacing="lg">
        {filteredPosts.length === 0 ? (
          <EmptyState icon={BookOpen} title="No posts found" description="Check back soon for new stories and updates." />
        ) : (
          <div className="mx-auto max-w-6xl">
            {featuredPost && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
                <Card padding="none" className="overflow-hidden md:flex">
                  {featuredPost.imageUrl && (
                    <Link href={`/blog/${featuredPost.slug}`} className="relative block h-56 shrink-0 bg-surface-active md:h-auto md:w-1/2">
                      <Image src={featuredPost.imageUrl} alt={featuredPost.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
                    </Link>
                  )}
                  <div className="flex-1 p-8">
                    {featuredPost.category && (
                      <Link href={`/blog/category/${encodeURIComponent(featuredPost.category)}`}>
                        <Badge variant="accent" className="mb-3">{featuredPost.category}</Badge>
                      </Link>
                    )}
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <h2 className="text-headline-sm text-foreground hover:text-accent">{featuredPost.title}</h2>
                    </Link>
                    {featuredPost.excerpt && <p className="mt-3 line-clamp-3 text-body-md text-foreground-muted">{featuredPost.excerpt}</p>}
                    <p className="mt-4 text-caption text-foreground-subtle">
                      {featuredPost.authorName ? (
                        <Link href={`/blog/author/${encodeURIComponent(featuredPost.authorName)}`} className="hover:text-accent hover:underline dark:text-accent-hover">
                          {featuredPost.authorName}
                        </Link>
                      ) : null}
                      {featuredPost.authorName ? ' · ' : ''}
                      {new Date(featuredPost.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            <Grid cols={3} gap={6}>
              {restPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
                >
                  <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                    {post.imageUrl && (
                      <Link href={`/blog/${post.slug}`} className="relative block aspect-16/10 bg-surface-active">
                        <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </Link>
                    )}
                    <div className="p-5">
                      {post.category && (
                        <Link href={`/blog/category/${encodeURIComponent(post.category)}`} className="text-caption font-semibold uppercase tracking-wide text-accent hover:underline dark:text-accent-hover">
                          {post.category}
                        </Link>
                      )}
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="mt-1.5 line-clamp-2 text-title-md text-foreground hover:text-accent">{post.title}</h2>
                      </Link>
                      {post.excerpt && <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{post.excerpt}</p>}
                      <p className="mt-3 text-caption text-foreground-subtle">
                        {post.authorName ? (
                          <Link href={`/blog/author/${encodeURIComponent(post.authorName)}`} className="hover:text-accent hover:underline dark:text-accent-hover">
                            {post.authorName}
                          </Link>
                        ) : null}
                        {post.authorName ? ' · ' : ''}{new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </Grid>
          </div>
        )}
      </Section>
    </div>
  );
}
