// Allowlist of editable content collections — prevents the [type] route
// param from being used to reach arbitrary Firestore collections (users,
// auditLog, etc). Gallery has its own routes (app/api/admin/gallery/*)
// because it also carries moderation state; site settings has its own
// singleton route (app/api/admin/settings).
export const COLLECTIONS: Record<string, string> = {
  sermons: 'sermons',
  events: 'events',
  pastors: 'pastors',
  series: 'series',
  speakers: 'speakers',
  ministries: 'ministries',
  announcements: 'announcements',
  services: 'services',
  smallGroups: 'smallGroups',
  testimonials: 'testimonials',
  redirects: 'redirects',
  resources: 'resources',
  staffMembers: 'staffMembers',
  prayerRequests: 'prayerRequests',
};

export function resolveCollection(type: string): string | null {
  return COLLECTIONS[type] ?? null;
}
