'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';
import { getBlogPosts, BlogPost } from '@/lib/content';
import { PageHero } from '@/components/ui/PageHero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Grid } from '@/components/ui/Grid';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';

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
      <PageHero icon={<BookOpen />} eyebrow="Stories & Reflections" title="Blog" description="Reflections, updates, and stories from our church family" />

      {posts.length > 0 && (
        <Section spacing="sm" className="bg-surface">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Input placeholder="Search posts..." aria-label="Search posts" leftIcon={<Search />} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
            {categories.length > 2 && (
              <Select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categories.map((c) => ({ value: c, label: c === 'all' ? 'All Categories' : c }))}
                className="w-auto capitalize"
              />
            )}
          </div>
        </Section>
      )}

      <Section spacing="lg">
        {filteredPosts.length === 0 ? (
          <EmptyState icon={BookOpen} title="No posts found" description="Check back soon for new stories and updates." />
        ) : (
          <div className="mx-auto max-w-6xl">
            {featuredPost && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <Card padding="none" className="overflow-hidden md:flex">
                    {featuredPost.imageUrl && (
                      <div className="relative h-56 shrink-0 bg-surface-active md:h-auto md:w-1/2">
                        <Image src={featuredPost.imageUrl} alt={featuredPost.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
                      </div>
                    )}
                    <div className="flex-1 p-8">
                      {featuredPost.category && <Badge variant="accent" className="mb-3">{featuredPost.category}</Badge>}
                      <h2 className="text-headline-sm text-foreground">{featuredPost.title}</h2>
                      {featuredPost.excerpt && <p className="mt-3 line-clamp-3 text-body-md text-foreground-muted">{featuredPost.excerpt}</p>}
                      <p className="mt-4 text-caption text-foreground-subtle">
                        {featuredPost.authorName ? `${featuredPost.authorName} · ` : ''}
                        {new Date(featuredPost.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </Card>
                </Link>
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
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <Card variant="interactive" padding="none" className="h-full overflow-hidden">
                      {post.imageUrl && (
                        <div className="relative aspect-[16/10] bg-surface-active">
                          <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                      )}
                      <div className="p-5">
                        {post.category && <span className="text-caption font-semibold uppercase tracking-wide text-accent">{post.category}</span>}
                        <h2 className="mt-1.5 line-clamp-2 text-title-md text-foreground">{post.title}</h2>
                        {post.excerpt && <p className="mt-2 line-clamp-3 text-body-sm text-foreground-muted">{post.excerpt}</p>}
                        <p className="mt-3 text-caption text-foreground-subtle">
                          {post.authorName ? `${post.authorName} · ` : ''}{new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </Grid>
          </div>
        )}
      </Section>
    </div>
  );
}
