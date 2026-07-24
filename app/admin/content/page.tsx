'use client';

import { useState } from 'react';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';
import GalleryTab from '@/components/admin/content/GalleryTab';
import SiteSettingsTab from '@/components/admin/content/SiteSettingsTab';

const SERMON_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'subtitle', label: 'Subtitle', type: 'text' },
  { key: 'speakerName', label: 'Speaker', type: 'text' },
  { key: 'seriesTitle', label: 'Series', type: 'text' },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'scripture', label: 'Scripture', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'youtubeUrl', label: 'YouTube URL', type: 'url' },
  { key: 'imageUrl', label: 'Image URL', type: 'url' },
  { key: 'duration', label: 'Duration (minutes)', type: 'number' },
  { key: 'featured', label: 'Featured', type: 'checkbox' },
];

const EVENT_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'subtitle', label: 'Subtitle', type: 'text' },
  { key: 'startDate', label: 'Start Date/Time', type: 'datetime', required: true },
  { key: 'endDate', label: 'End Date/Time', type: 'datetime' },
  { key: 'location', label: 'Location', type: 'text', required: true },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'shortDescription', label: 'Short Description', type: 'textarea' },
  { key: 'imageUrl', label: 'Image URL', type: 'url' },
  { key: 'organizerName', label: 'Organizer', type: 'text' },
  { key: 'cost', label: 'Cost', type: 'number' },
  { key: 'registrationRequired', label: 'Registration Required', type: 'checkbox' },
  { key: 'registrationUrl', label: 'Registration URL', type: 'url' },
  { key: 'featured', label: 'Featured', type: 'checkbox' },
  { key: 'isPublic', label: 'Public Event', type: 'checkbox' },
];

const PASTOR_FIELDS: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'bio', label: 'Biography', type: 'textarea' },
  { key: 'imageUrl', label: 'Image URL', type: 'url' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'yearsOfService', label: 'Years of Service', type: 'number' },
];

const TABS = [
  { key: 'sermons', label: 'Sermons' },
  { key: 'events', label: 'Events' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'pastors', label: 'Pastors' },
  { key: 'settings', label: 'Site Settings' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function ContentEditorPage() {
  const [tab, setTab] = useState<TabKey>('sermons');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Content</h1>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'sermons' && (
        <GenericContentTab type="sermons" label="Sermons" fields={SERMON_FIELDS} columns={['title', 'speakerName', 'date']} />
      )}
      {tab === 'events' && (
        <GenericContentTab type="events" label="Events" fields={EVENT_FIELDS} columns={['title', 'startDate', 'location']} />
      )}
      {tab === 'gallery' && <GalleryTab />}
      {tab === 'pastors' && (
        <GenericContentTab type="pastors" label="Pastors" fields={PASTOR_FIELDS} columns={['name', 'title', 'email']} />
      )}
      {tab === 'settings' && <SiteSettingsTab />}
    </div>
  );
}
