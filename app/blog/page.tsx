'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, BlogPost } from '@/lib/content';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts().then(setPosts).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Blog</h1>
          <p className="text-lg text-blue-100">Reflections, updates, and stories from our church family</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No posts yet — check back soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {post.imageUrl && (
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{post.category}</span>
                    )}
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{post.excerpt}</p>}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      {post.authorName ? `${post.authorName} · ` : ''}{new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
