'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, CalendarDays, Tag as TagIcon, Users2 } from 'lucide-react';
import GenericContentTab, { FieldSchema } from '@/components/admin/content/GenericContentTab';
import GalleryTab from '@/components/admin/content/GalleryTab';
import SiteSettingsTab from '@/components/admin/content/SiteSettingsTab';
import ContentTypesTab from '@/components/admin/content/ContentTypesTab';
import ContentCalendarTab from '@/components/admin/content/ContentCalendarTab';
import TagsTab from '@/components/admin/content/TagsTab';
import EventRegistrationsModal from '@/components/admin/content/EventRegistrationsModal';
import { adminFetch } from '@/lib/adminApi';
import { ContentTypeDefinition } from '@/types/contentType';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';

const SERMON_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'subtitle', label: 'Subtitle', type: 'text' },
  { key: 'speakerName', label: 'Speaker', type: 'text' },
  { key: 'seriesTitle', label: 'Series', type: 'text' },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'scripture', label: 'Scripture', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'transcript', label: 'Transcript (enables the print-friendly transcript view)', type: 'textarea' },
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
  { key: 'membersOnly', label: 'Members-Only Photo Album (requires sign-in to view photos)', type: 'checkbox' },
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
  { key: 'leaderEmail', label: 'Leader Email', type: 'email' },
  { key: 'meetingSchedule', label: 'Meeting Schedule (e.g. "Wednesdays at 7pm")', type: 'text' },
  { key: 'dayOfWeek', label: 'Day of Week (Sunday–Saturday)', type: 'text' },
  { key: 'lifeStage', label: 'Life Stage (e.g. Young Adults, Families, Seniors)', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'capacity', label: 'Capacity', type: 'number' },
  { key: 'currentMembers', label: 'Current Members', type: 'number' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'imageUrl', label: 'Image', type: 'url', accept: 'image' },
  { key: 'hideFromDirectory', label: 'Hide from Public Directory (still reachable by direct link)', type: 'checkbox' },
  { key: 'resourceLinks', label: 'Group Resources (one per line: Title|URL)', type: 'textarea' },
];

const TESTIMONIAL_FIELDS: FieldSchema[] = [
  { key: 'authorName', label: 'Name', type: 'text', required: true },
  { key: 'content', label: 'Testimony', type: 'textarea', required: true },
  { key: 'category', label: 'Category (e.g. Healing, Salvation, Family, Provision)', type: 'text' },
  { key: 'displayPreference', label: 'Display Preference (full, first, or anonymous)', type: 'text' },
  { key: 'imageUrl', label: 'Photo', type: 'url', accept: 'image' },
  { key: 'featured', label: 'Featured', type: 'checkbox' },
];

const PRAYER_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Request', type: 'textarea', required: true },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'authorName', label: 'Author Name', type: 'text' },
  { key: 'isPrivate', label: 'Private (pastors only)', type: 'checkbox' },
  { key: 'isAnonymous', label: 'Anonymous', type: 'checkbox' },
  { key: 'status', label: 'Status (praying, ongoing, or answered)', type: 'text' },
  { key: 'answeredNote', label: 'Answered Note (shown on the public answered-prayer archive)', type: 'textarea' },
  { key: 'followUpRequested', label: 'Follow-Up Requested (submitter asked for a private check-in)', type: 'checkbox' },
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
  { key: 'resourceType', label: 'Type (PDF, Video, Audio, Link)', type: 'text' },
  { key: 'ageGroup', label: 'Age Group (Children, Youth, Adults, All Ages)', type: 'text' },
];

const ANNOUNCEMENT_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'content', label: 'Content', type: 'textarea', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'expiresAt', label: 'Expires At (stops showing publicly after this, even if still Published)', type: 'datetime' },
];

const SERIES_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Series Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'imageUrl', label: 'Cover Image', type: 'url', accept: 'image' },
];

const SPEAKER_FIELDS: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'bio', label: 'Bio', type: 'textarea' },
  { key: 'imageUrl', label: 'Photo', type: 'url', accept: 'image' },
];

const STAFF_FIELDS: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'position', label: 'Position / Role', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'handlesCategory', label: 'Handles Contact Category (spiritual, administrative, media, or outreach)', type: 'text' },
];

const MINISTRY_FIELDS: FieldSchema[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'category', label: 'Category (children, youth, adults, worship, outreach)', type: 'text' },
  { key: 'ageGroup', label: 'Age Group', type: 'text' },
  { key: 'meetingTime', label: 'Meeting Time', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'imageUrl', label: 'Ministry Photo', type: 'url', accept: 'image' },
  { key: 'leaderName', label: 'Leader Name', type: 'text' },
  { key: 'leaderTitle', label: 'Leader Title', type: 'text' },
  { key: 'leaderEmail', label: 'Leader Email', type: 'email' },
  { key: 'leaderPhone', label: 'Leader Phone', type: 'text' },
  { key: 'leaderImageUrl', label: 'Leader Photo', type: 'url', accept: 'image' },
  { key: 'testimonialQuote', label: 'Testimonial Quote', type: 'textarea' },
  { key: 'testimonialAuthor', label: 'Testimonial Author', type: 'text' },
  { key: 'volunteerNeeds', label: 'Volunteer Opportunities (one per line)', type: 'textarea' },
  { key: 'teamPhotos', label: 'Team Photos (one per line: Name|ImageURL)', type: 'textarea' },
];

const BUILT_IN_TABS = [
  { key: 'sermons', label: 'Sermons' },
  { key: 'series', label: 'Series' },
  { key: 'speakers', label: 'Speakers' },
  { key: 'events', label: 'Events' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'pastors', label: 'Pastors' },
  { key: 'staff', label: 'Staff' },
  { key: 'ministries', label: 'Ministries' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'blog', label: 'Blog' },
  { key: 'small-groups', label: 'Small Groups' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'resources', label: 'Resources' },
  { key: 'prayer-requests', label: 'Prayer Requests' },
  { key: 'redirects', label: 'Redirects' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'tags', label: 'Tags' },
  { key: 'settings', label: 'Site Settings' },
  { key: 'content-types', label: 'Content Types' },
] as const;

type BuiltInTabKey = typeof BUILT_IN_TABS[number]['key'];
type TabKey = BuiltInTabKey | `custom:${string}`;

interface SearchResult { id: string; type: string; tab: string; title: string; snippet: string }

export default function ContentEditorPage() {
  const [tab, setTab] = useState<TabKey>('sermons');
  const [customTypes, setCustomTypes] = useState<ContentTypeDefinition[]>([]);
  const [autoOpenId, setAutoOpenId] = useState<string | null>(null);
  const [registrationsTarget, setRegistrationsTarget] = useState<{ id: string; title: string } | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const loadCustomTypes = () => {
    adminFetch('/api/admin/content-types')
      .then((data) => setCustomTypes(data.types))
      .catch(() => setCustomTypes([]));
  };

  useEffect(() => { loadCustomTypes(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const handle = setTimeout(() => {
      adminFetch(`/api/admin/content-search?q=${encodeURIComponent(query.trim())}`)
        .then((data) => setResults(data.results))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const openSearchResult = (result: SearchResult) => {
    setTab(result.tab as TabKey);
    setAutoOpenId(result.id);
    setShowResults(false);
    setQuery('');
  };

  const openCalendarItem = (calendarTab: string, id: string) => {
    setTab(calendarTab as TabKey);
    setAutoOpenId(id);
  };

  const activeCustomType = tab.startsWith('custom:')
    ? customTypes.find(t => t.id === tab.slice('custom:'.length))
    : null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-headline-md text-foreground">Content</h1>
        <div ref={searchBoxRef} className="relative w-full max-w-xs">
          <Input
            leftIcon={<Search className="h-4 w-4" />}
            placeholder="Search all content..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
          />
          {showResults && query.trim().length >= 2 && (
            <div className="absolute right-0 top-full z-20 mt-1 max-h-80 w-96 max-w-[90vw] overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
              {searching ? (
                <p className="p-3 text-body-sm text-foreground-subtle">Searching...</p>
              ) : results.length === 0 ? (
                <p className="p-3 text-body-sm text-foreground-subtle">No matches across content types.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {results.map((r) => (
                    <li key={`${r.type}-${r.id}`}>
                      <button
                        onClick={() => openSearchResult(r)}
                        className="block w-full px-3 py-2 text-left hover:bg-surface-hover"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-body-sm font-medium text-foreground">{r.title}</span>
                          <span className="shrink-0 rounded-full bg-accent-subtle px-2 py-0.5 text-caption text-accent">
                            {BUILT_IN_TABS.find((t) => t.key === r.tab)?.label ?? r.type}
                          </span>
                        </div>
                        {r.snippet && <p className="truncate text-caption text-foreground-subtle">{r.snippet}</p>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="mb-6">
        <TabsList variant="line" className="h-auto flex-wrap justify-start">
          {BUILT_IN_TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.key === 'calendar' && <CalendarDays className="mr-1 inline h-3.5 w-3.5" />}
              {t.key === 'tags' && <TagIcon className="mr-1 inline h-3.5 w-3.5" />}
              {t.label}
            </TabsTrigger>
          ))}
          {customTypes.map((ct) => (
            <TabsTrigger key={ct.id} value={`custom:${ct.id}`}>{ct.pluralLabel}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="sermons">
          <GenericContentTab type="sermons" label="Sermons" fields={SERMON_FIELDS} columns={['title', 'speakerName', 'date']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="series">
          <p className="mb-4 rounded-lg border border-accent/30 bg-accent-subtle p-3 text-body-sm text-accent">
            Series titles here power the &quot;Series&quot; filter dropdown on the public Sermons page — a sermon joins a series when its Series field matches one of these titles exactly.
          </p>
          <GenericContentTab type="series" label="Series" fields={SERIES_FIELDS} columns={['title']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="speakers">
          <p className="mb-4 rounded-lg border border-accent/30 bg-accent-subtle p-3 text-body-sm text-accent">
            Speaker names here power the &quot;Speaker&quot; filter dropdown on the public Sermons page — a sermon is attributed when its Speaker field matches one of these names exactly.
          </p>
          <GenericContentTab type="speakers" label="Speakers" fields={SPEAKER_FIELDS} columns={['name']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="events">
          <GenericContentTab
            type="events"
            label="Events"
            fields={EVENT_FIELDS}
            columns={['title', 'startDate', 'location']}
            autoOpenId={autoOpenId}
            onAutoOpened={() => setAutoOpenId(null)}
            extraRowAction={(item) => (
              <IconButton label="Registrations" size="sm" onClick={() => setRegistrationsTarget({ id: item.id, title: item.title })}>
                <Users2 className="h-3.5 w-3.5" />
              </IconButton>
            )}
          />
        </TabsContent>
        <TabsContent value="gallery"><GalleryTab /></TabsContent>
        <TabsContent value="pastors">
          <GenericContentTab type="pastors" label="Pastors" fields={PASTOR_FIELDS} columns={['name', 'title', 'email']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="staff">
          <p className="mb-4 rounded-lg border border-accent/30 bg-accent-subtle p-3 text-body-sm text-accent">
            Powers the department-routing list on the public Contact page and the Leadership listing on the Pastors page.
          </p>
          <GenericContentTab type="staffMembers" label="Staff" fields={STAFF_FIELDS} columns={['name', 'position', 'email']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="ministries">
          <GenericContentTab type="ministries" label="Ministries" fields={MINISTRY_FIELDS} columns={['title', 'category', 'meetingTime']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="announcements">
          <GenericContentTab type="announcements" label="Announcements" fields={ANNOUNCEMENT_FIELDS} columns={['title', 'date']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="blog">
          <GenericContentTab type="blog" label="Blog Posts" fields={BLOG_FIELDS} columns={['title', 'authorName', 'category']} apiBase="/api/admin" autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="small-groups">
          <GenericContentTab type="smallGroups" label="Small Groups" fields={SMALL_GROUP_FIELDS} columns={['name', 'leaderName', 'meetingSchedule']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="testimonials">
          <GenericContentTab type="testimonials" label="Testimonials" fields={TESTIMONIAL_FIELDS} columns={['authorName', 'content']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="resources">
          <GenericContentTab type="resources" label="Resources" fields={RESOURCE_FIELDS} columns={['title', 'category']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="prayer-requests">
          <p className="mb-4 rounded-lg border border-info/30 bg-info-subtle p-3 text-body-sm text-info">
            New public submissions land in the Moderation Queue first. Once approved, manage their status (praying/ongoing/answered) here.
          </p>
          <GenericContentTab type="prayerRequests" label="Prayer Requests" fields={PRAYER_FIELDS} columns={['title', 'category', 'status', 'followUpRequested']} autoOpenId={autoOpenId} onAutoOpened={() => setAutoOpenId(null)} />
        </TabsContent>
        <TabsContent value="redirects">
          <p className="mb-4 rounded-lg border border-warning/30 bg-warning-subtle p-3 text-body-sm text-warning">
            Redirects take effect on the next deploy, not immediately — they&apos;re resolved at build time, not on every request.
          </p>
          <GenericContentTab type="redirects" label="Redirects" fields={REDIRECT_FIELDS} columns={['fromPath', 'toPath', 'statusCode']} supportsVersions={false} />
        </TabsContent>
        <TabsContent value="calendar">
          <ContentCalendarTab onOpenItem={openCalendarItem} />
        </TabsContent>
        <TabsContent value="tags">
          <TagsTab />
        </TabsContent>
        <TabsContent value="settings"><SiteSettingsTab /></TabsContent>
        <TabsContent value="content-types"><ContentTypesTab onChange={loadCustomTypes} /></TabsContent>
        {activeCustomType && (
          <TabsContent value={tab}>
            <GenericContentTab
              key={activeCustomType.id}
              type={activeCustomType.id}
              label={activeCustomType.pluralLabel}
              fields={activeCustomType.fields}
              columns={activeCustomType.columns}
              apiBase="/api/admin/custom-content"
            />
          </TabsContent>
        )}
      </Tabs>

      <EventRegistrationsModal
        eventId={registrationsTarget?.id ?? null}
        eventTitle={registrationsTarget?.title}
        isOpen={!!registrationsTarget}
        onClose={() => setRegistrationsTarget(null)}
      />
    </div>
  );
}
