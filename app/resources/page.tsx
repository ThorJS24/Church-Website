'use client';

import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { getResources, Resource } from '@/lib/content';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResources().then(setResources).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  const byCategory = resources.reduce<Record<string, Resource[]>>((acc, r) => {
    const cat = r.category || 'General';
    (acc[cat] ||= []).push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Resources</h1>
          <p className="text-lg text-blue-100">Bible studies, devotionals, and downloads</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {resources.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No resources available yet.</p>
          ) : (
            Object.entries(byCategory).map(([category, items]) => (
              <div key={category} className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{category}</h2>
                <div className="space-y-3">
                  {items.map((r) => (
                    <a
                      key={r.id}
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                    >
                      <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                        {r.description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{r.description}</p>}
                      </div>
                      <Download className="w-5 h-5 text-gray-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
