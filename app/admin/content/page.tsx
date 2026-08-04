'use client';

import { useEffect, useState } from 'react';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';
import GalleryTab from '@/components/admin/content/GalleryTab';
import SiteSettingsTab from '@/components/admin/content/SiteSettingsTab';
import ContentTypesTab from '@/components/admin/content/ContentTypesTab';
import { adminFetch } from '@/lib/adminApi';
import { ContentTypeDefinition } from '@/types/contentType';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';

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

const RESOURCE_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'fileUrl', label: 'File', type: 'url', accept: 'file', required: true },
  { key: 'category', label: 'Category', type: 'text' },
];

const ANNOUNCEMENT_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'content', label: 'Content', type: 'textarea', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'expiresAt', label: 'Expires At (stops showing publicly after this, even if still Published)', type: 'datetime' },
];

const MINISTRY_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'category', label: 'Category (children, youth, adults, worship, outreach)', type: 'text' },
  { key: 'ageGroup', label: 'Age Group', type: 'text' },
  { key: 'meetingTime', label: 'Meeting Time', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
];

const BUILT_IN_TABS = [
  { key: 'sermons', label: 'Sermons' },
  { key: 'events', label: 'Events' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'pastors', label: 'Pastors' },
  { key: 'ministries', label: 'Ministries' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'blog', label: 'Blog' },
  { key: 'small-groups', label: 'Small Groups' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'resources', label: 'Resources' },
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
      <h1 className="mb-6 text-headline-md text-foreground">Content</h1>

      <Tabs value={tab} onChange={(v) => setTab(v as TabKey)} className="mb-6">
        <TabList className="flex-wrap">
          {BUILT_IN_TABS.map((t) => (
            <Tab key={t.key} value={t.key}>{t.label}</Tab>
          ))}
          {customTypes.map((ct) => (
            <Tab key={ct.id} value={`custom:${ct.id}`}>{ct.pluralLabel}</Tab>
          ))}
        </TabList>

        <TabPanel value="sermons">
          <GenericContentTab type="sermons" label="Sermons" fields={SERMON_FIELDS} columns={['title', 'speakerName', 'date']} />
        </TabPanel>
        <TabPanel value="events">
          <GenericContentTab type="events" label="Events" fields={EVENT_FIELDS} columns={['title', 'startDate', 'location']} />
        </TabPanel>
        <TabPanel value="gallery"><GalleryTab /></TabPanel>
        <TabPanel value="pastors">
          <GenericContentTab type="pastors" label="Pastors" fields={PASTOR_FIELDS} columns={['name', 'title', 'email']} />
        </TabPanel>
        <TabPanel value="ministries">
          <GenericContentTab type="ministries" label="Ministries" fields={MINISTRY_FIELDS} columns={['title', 'category', 'meetingTime']} />
        </TabPanel>
        <TabPanel value="announcements">
          <GenericContentTab type="announcements" label="Announcements" fields={ANNOUNCEMENT_FIELDS} columns={['title', 'date']} />
        </TabPanel>
        <TabPanel value="blog">
          <GenericContentTab type="blog" label="Blog Posts" fields={BLOG_FIELDS} columns={['title', 'authorName', 'category']} apiBase="/api/admin" />
        </TabPanel>
        <TabPanel value="small-groups">
          <GenericContentTab type="smallGroups" label="Small Groups" fields={SMALL_GROUP_FIELDS} columns={['name', 'leaderName', 'meetingSchedule']} />
        </TabPanel>
        <TabPanel value="testimonials">
          <GenericContentTab type="testimonials" label="Testimonials" fields={TESTIMONIAL_FIELDS} columns={['authorName', 'content']} />
        </TabPanel>
        <TabPanel value="resources">
          <GenericContentTab type="resources" label="Resources" fields={RESOURCE_FIELDS} columns={['title', 'category']} />
        </TabPanel>
        <TabPanel value="redirects">
          <p className="mb-4 rounded-lg border border-warning/30 bg-warning-subtle p-3 text-body-sm text-warning">
            Redirects take effect on the next deploy, not immediately — they&apos;re resolved at build time, not on every request.
          </p>
          <GenericContentTab type="redirects" label="Redirects" fields={REDIRECT_FIELDS} columns={['fromPath', 'toPath', 'statusCode']} supportsVersions={false} />
        </TabPanel>
        <TabPanel value="settings"><SiteSettingsTab /></TabPanel>
        <TabPanel value="content-types"><ContentTypesTab onChange={loadCustomTypes} /></TabPanel>
        {activeCustomType && (
          <TabPanel value={tab}>
            <GenericContentTab
              key={activeCustomType.id}
              type={activeCustomType.id}
              label={activeCustomType.pluralLabel}
              fields={activeCustomType.fields}
              columns={activeCustomType.columns}
              apiBase="/api/admin/custom-content"
            />
          </TabPanel>
        )}
      </Tabs>
    </div>
  );
}
