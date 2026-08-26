// Runtime validation for the new domain entities, enforced at the
// repository boundary (lib/repositories/*). Firestore being schemaless does
// not mean arbitrary documents are acceptable — every write to one of these
// collections goes through the matching schema's `.parse()`.
import { z } from 'zod';

const id = z.string().min(1);
const optionalId = z.string().min(1).nullable().optional();

export const PersonInputSchema = z.object({
  displayName: z.string().min(1, 'Name is required'),
  photoUrl: z.string().url().nullable().optional(),
  bio: z.string().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  title: z.string().optional(),
  isStaff: z.boolean().optional(),
  userId: optionalId,
  status: z.enum(['active', 'inactive']).default('active'),
});

export const LocationInputSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
  geo: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(),
  accessibilityInfo: z.string().optional(),
  notes: z.string().optional(),
});

export const MembershipRoleSchema = z.enum(['leader', 'member']);
export const MembershipStatusSchema = z.enum(['active', 'inactive']);

export const MinistryMembershipInputSchema = z.object({
  personId: id,
  ministryId: id,
  roleInMinistry: MembershipRoleSchema.default('member'),
  status: MembershipStatusSchema.default('active'),
});

export const GroupMembershipInputSchema = z.object({
  personId: id,
  groupId: id,
  roleInGroup: MembershipRoleSchema.default('member'),
  status: MembershipStatusSchema.default('active'),
});

export const VolunteerOpportunityInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  ministryId: optionalId,
  eventId: optionalId,
  area: z.string().optional(),
  spotsNeeded: z.coerce.number().int().nonnegative().optional(),
  shiftDate: z.string().optional(),
  shiftTime: z.string().optional(),
  locationId: optionalId,
  location: z.string().optional(),
  status: z.enum(['open', 'filled', 'closed']).default('open'),
});

export const VolunteerAssignmentInputSchema = z.object({
  opportunityId: id,
  personId: id,
  status: z.enum(['applied', 'confirmed', 'completed', 'cancelled']).default('applied'),
  hoursLogged: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const EventAttendanceInputSchema = z.object({
  eventId: id,
  personId: optionalId,
  guestName: z.string().nullable().optional(),
  checkedInBy: id,
  method: z.enum(['self', 'staff']).default('staff'),
}).refine((v) => !!v.personId || !!v.guestName, {
  message: 'Attendance record needs either a personId or a guestName',
});

export const MediaAssetInputSchema = z.object({
  type: z.enum(['video', 'audio', 'image', 'document']),
  sourceProvider: z.enum(['cloudinary', 'youtube', 'external']),
  url: z.string().url(),
  cloudinaryPublicId: z.string().nullable().optional(),
  youtubeId: z.string().nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  altText: z.string().optional(),
  duration: z.coerce.number().nonnegative().optional(),
  fileSize: z.coerce.number().nonnegative().optional(),
  mimeType: z.string().optional(),
  uploadedBy: optionalId,
  contentHash: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const GivingFundInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  goalAmount: z.coerce.number().nonnegative().optional(),
  isActive: z.boolean().default(true),
});

// GivingRecord intentionally has no public/admin write route yet — no
// payment provider is integrated (see architecture doc §2, §9). This
// schema exists so the collection has an enforced shape the moment one is.
export const GivingRecordInputSchema = z.object({
  fundId: id,
  donorPersonId: optionalId,
  amount: z.coerce.number().positive(),
  currency: z.string().min(1).default('INR'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  externalProvider: z.string().optional(),
  externalTransactionId: z.string().optional(),
});

export type PersonInput = z.infer<typeof PersonInputSchema>;
export type LocationInput = z.infer<typeof LocationInputSchema>;
export type MinistryMembershipInput = z.infer<typeof MinistryMembershipInputSchema>;
export type GroupMembershipInput = z.infer<typeof GroupMembershipInputSchema>;
export type VolunteerOpportunityInput = z.infer<typeof VolunteerOpportunityInputSchema>;
export type VolunteerAssignmentInput = z.infer<typeof VolunteerAssignmentInputSchema>;
export type EventAttendanceInput = z.infer<typeof EventAttendanceInputSchema>;
export type MediaAssetInput = z.infer<typeof MediaAssetInputSchema>;
export type GivingFundInput = z.infer<typeof GivingFundInputSchema>;
export type GivingRecordInput = z.infer<typeof GivingRecordInputSchema>;
