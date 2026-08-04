'use client';

import { useEffect, useState } from 'react';
import { Users, Clock, MapPin } from 'lucide-react';
import { getSmallGroups, SmallGroup } from '@/lib/content';

export default function SmallGroupsPage() {
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSmallGroups().then(setGroups).finally(() => setLoading(false));
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Small Groups</h1>
          <p className="text-lg text-blue-100">Connect, grow, and study scripture together in a smaller setting</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {groups.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No small groups are listed yet — <a href="/contact" className="text-blue-600 underline">contact us</a> to find one.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {groups.map((group) => (
                <div key={group.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  {group.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">{group.category}</span>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-2">{group.name}</h2>
                  {group.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>}
                  <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {group.leaderName && (
                      <p className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> Led by {group.leaderName}</p>
                    )}
                    {group.meetingSchedule && (
                      <p className="flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> {group.meetingSchedule}</p>
                    )}
                    {group.location && (
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> {group.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
