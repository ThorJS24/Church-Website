// Admin-panel permission tiers. This is the single `role` field on each
// user's Firestore doc (users/{uid}.role) — the same field lib/api-auth.ts
// verifies server-side and firestore.rules checks for direct client access.
// There is no second role mechanism; congregational titles (e.g. "Pastor")
// are display-only metadata, not a privilege level.
export enum UserRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

const ROLE_LEVEL: Record<UserRole, number> = {
  [UserRole.MEMBER]: 0,
  [UserRole.MODERATOR]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

/** True if `role` is at or above `min` in the hierarchy (member < moderator < admin < super_admin). */
export function roleAtLeast(role: UserRole | undefined | null, min: UserRole): boolean {
  const level = role ? ROLE_LEVEL[role] : ROLE_LEVEL[UserRole.MEMBER];
  return level >= ROLE_LEVEL[min];
}

export function isValidRole(value: unknown): value is UserRole {
  return typeof value === 'string' && Object.values(UserRole).includes(value as UserRole);
}

export enum Permission {
  MODERATE = 'moderate', // approve/reject prayer requests, gallery submissions, comments
  MANAGE_CONTENT = 'manage_content', // sermons/events/gallery/pastors CRUD
  MANAGE_SETTINGS = 'manage_settings', // site settings, feature toggles
  MANAGE_USERS = 'manage_users', // view/suspend/delete users, not role changes
  MANAGE_ROLES = 'manage_roles', // change another user's role
  VIEW_AUDIT_LOG = 'view_audit_log',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.MEMBER]: [],
  [UserRole.MODERATOR]: [Permission.MODERATE],
  [UserRole.ADMIN]: [
    Permission.MODERATE,
    Permission.MANAGE_CONTENT,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOG,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.MODERATE,
    Permission.MANAGE_CONTENT,
    Permission.MANAGE_SETTINGS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.VIEW_AUDIT_LOG,
  ],
};

export function hasPermission(userRole: UserRole | undefined | null, permission: Permission): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function getUserPermissions(userRole: UserRole | undefined | null): Permission[] {
  return userRole ? (ROLE_PERMISSIONS[userRole] ?? []) : [];
}

export function canAccessAdminPanel(userRole: UserRole | undefined | null): boolean {
  return roleAtLeast(userRole ?? undefined, UserRole.MODERATOR);
}
