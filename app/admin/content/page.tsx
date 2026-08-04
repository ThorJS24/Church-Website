'use client';

import { useEffect, useState } from 'react';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';
import GalleryTab from '@/components/admin/content/GalleryTab';
import SiteSettingsTab from '@/components/admin/content/SiteSettingsTab';
import ContentTypesTab from '@/components/admin/content/ContentTypesTab';
import { adminFetch } from '@/lib/adminApi';
import { ContentTypeDefinition } from '@/types/contentType';

const SERMON_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'subtitle', label: 'Subtitle', type: 'text' },
  { key: 'speakerName', label: 'Speaker', type: 'text' },
  { key: 'seriesTitle', label: 'Series', type: 'text' },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'scripture', label: 'Scripture', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'youtubeUrl', label: 'YouTube URL', type: 'url' },
  { key: 'audioUrl', label: 'Audio File URL (MP3 — enables this sermon in the podcast feed)', type: 'url' },
  { key: 'imageUrl', label: 'Image', type: 'url', accept: 'image' },
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
  { key: 'imageUrl', label: 'Image', type: 'url', accept: 'image' },
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
  { key: 'imageUrl', label: 'Image', type: 'url', accept: 'image' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'yearsOfService', label: 'Years of Service', type: 'number' },
];

const BLOG_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'slug', label: 'URL Slug (leave blank to auto-generate from title)', type: 'text' },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
  { key: 'content', label: 'Content', type: 'textarea', required: true },
  { key: 'authorName', label: 'Author', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'imageUrl', label: 'Cover Image', type: 'url', accept: 'image' },
  { key: 'featured', label: 'Featured', type: 'checkbox' },
];

const SMALL_GROUP_FIELDS: FieldSchema[] = [
  { key: 'name', label: 'Group Name', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'leaderName', label: 'Leader', type: 'text' },
  { key: 'meetingSchedule', label: 'Meeting Schedule', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'capacity', label: 'Capacity', type: 'number' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'imageUrl', label: 'Image', type: 'url', accept: 'image' },
];

const TESTIMONIAL_FIELDS: FieldSchema[] = [
  { key: 'authorName', label: 'Name', type: 'text', required: true },
  { key: 'content', label: 'Testimony', type: 'textarea', required: true },
  { key: 'imageUrl', label: 'Photo', type: 'url', accept: 'image' },
  { key: 'featured', label: 'Featured', type: 'checkbox' },
];

const REDIRECT_FIELDS: FieldSchema[] = [
  { key: 'fromPath', label: 'From Path (e.g. /old-page)', type: 'text', required: true },
  { key: 'toPath', label: 'To Path or URL', type: 'text', required: true },
  { key: 'statusCode', label: 'Status Code (301 = permanent, 302 = temporary)', type: 'number' },
];

const BUILT_IN_TABS = [
  { key: 'sermons', label: 'Sermons' },
  { key: 'events', label: 'Events' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'pastors', label: 'Pastors' },
  { key: 'blog', label: 'Blog' },
  { key: 'small-groups', label: 'Small Groups' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'redirects', label: 'Redirects' },
  { key: 'settings', label: 'Site Settings' },
  { key: 'content-types', label: 'Content Types' },
] as const;

type BuiltInTabKey = typeof BUILT_IN_TABS[number]['key'];
type TabKey = BuiltInTabKey | `custom:${string}`;

export default function ContentEditorPage() {
  const [tab, setTab] = useState<TabKey>('sermons');
  const [customTypes, setCustomTypes] = useState<ContentTypeDefinition[]>([]);

  const loadCustomTypes = () => {
    adminFetch('/api/admin/content-types')
      .then((data) => setCustomTypes(data.types))
      .catch(() => setCustomTypes([]));
  };

  useEffect(() => { loadCustomTypes(); }, []);

  const activeCustomType = tab.startsWith('custom:')
    ? customTypes.find(t => t.id === tab.slice('custom:'.length))
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Content</h1>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-6 flex-wrap">
          {BUILT_IN_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
          {customTypes.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setTab(`custom:${ct.id}`)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                tab === `custom:${ct.id}`
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {ct.pluralLabel}
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
      {tab === 'blog' && (
        <GenericContentTab type="blog" label="Blog Posts" fields={BLOG_FIELDS} columns={['title', 'authorName', 'category']} apiBase="/api/admin" />
      )}
      {tab === 'small-groups' && (
        <GenericContentTab type="smallGroups" label="Small Groups" fields={SMALL_GROUP_FIELDS} columns={['name', 'leaderName', 'meetingSchedule']} />
      )}
      {tab === 'testimonials' && (
        <GenericContentTab type="testimonials" label="Testimonials" fields={TESTIMONIAL_FIELDS} columns={['authorName', 'content']} />
      )}
      {tab === 'redirects' && (
        <div>
          <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            Redirects take effect on the next deploy, not immediately — they&apos;re resolved at build time, not on every request.
          </p>
          <GenericContentTab type="redirects" label="Redirects" fields={REDIRECT_FIELDS} columns={['fromPath', 'toPath', 'statusCode']} supportsVersions={false} />
        </div>
      )}
      {tab === 'settings' && <SiteSettingsTab />}
      {tab === 'content-types' && <ContentTypesTab onChange={loadCustomTypes} />}
      {activeCustomType && (
        <GenericContentTab
          key={activeCustomType.id}
          type={activeCustomType.id}
          label={activeCustomType.pluralLabel}
          fields={activeCustomType.fields}
          columns={activeCustomType.columns}
          apiBase="/api/admin/custom-content"
        />
      )}
    </div>
  );
}
