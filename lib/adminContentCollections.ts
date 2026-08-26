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
  people: 'people',
  locations: 'locations',
  volunteerOpportunities: 'volunteerOpportunities',
};

export function resolveCollection(type: string): string | null {
  return COLLECTIONS[type] ?? null;
}

// Runtime validation for the new domain entities reachable through this
// generic route (see lib/domain/schemas.ts). Most COLLECTIONS entries are
// legacy free-form content with no schema — these three are the ones the
// Domain Architecture Redesign added structured Zod validation for, so a
// write here must go through the same schema the repository layer uses,
// not just Firestore's schemaless "whatever the client sent" behavior.
import { PersonInputSchema, LocationInputSchema, VolunteerOpportunityInputSchema } from '@/lib/domain/schemas';
import type { ZodSchema } from 'zod';

const VALIDATORS: Record<string, ZodSchema> = {
  people: PersonInputSchema,
  locations: LocationInputSchema,
  volunteerOpportunities: VolunteerOpportunityInputSchema,
};

// Fields the generic content form (components/admin/content/GenericContentTab)
// always sends — the Publishing/SEO section every content type gets, e.g.
// `status: 'published' | 'draft'`. Person/Location/VolunteerOpportunity
// don't use that draft/publish lifecycle (VolunteerOpportunity has its own
// `status` meaning 'open' | 'filled' | 'closed'; Person's `status` means
// 'active' | 'inactive') — validating the CMS toggle's value against
// either schema would fail every save. These keys are stripped before
// validation for any type with a registered schema, not merged into the
// write, so the domain schema's own field (and its default) wins instead.
const GENERIC_CMS_ONLY_FIELDS = ['status', 'publishAt', 'tags', 'metaDescription', 'shareImageUrl'];

/**
 * Validates `body` against the entity's schema when one is registered
 * (partial for updates, since PUT here sends only changed fields), after
 * stripping the generic CMS-only fields listed above so they can't
 * collide with a same-named domain field. Collections with no registered
 * schema pass through unchanged — this is additive, not a retrofit of
 * validation onto every legacy content type. Throws a ZodError on
 * failure; callers should catch and return 400.
 */
export function validateContentBody(type: string, body: Record<string, unknown>, opts: { partial?: boolean } = {}): Record<string, unknown> {
  const schema = VALIDATORS[type];
  if (!schema) return body;

  const domainFields = { ...body };
  GENERIC_CMS_ONLY_FIELDS.forEach((key) => delete domainFields[key]);

  return (opts.partial && 'partial' in schema && typeof (schema as any).partial === 'function'
    ? (schema as any).partial()
    : schema
  ).parse(domainFields);
}
