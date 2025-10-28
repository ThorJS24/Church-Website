export enum UserRole {
  VISITOR = 'visitor',
  MEMBER = 'member',
  VOLUNTEER = 'volunteer',
  STAFF = 'staff',
  PASTOR = 'pastor',
  ADMIN = 'admin'
}

export enum Permission {
  // Content permissions
  VIEW_CONTENT = 'view_content',
  CREATE_CONTENT = 'create_content',
  EDIT_CONTENT = 'edit_content',
  DELETE_CONTENT = 'delete_content',
  
  // User management
  VIEW_MEMBERS = 'view_members',
  MANAGE_MEMBERS = 'manage_members',
  
  // Events
  CREATE_EVENTS = 'create_events',
  MANAGE_EVENTS = 'manage_events',
  
  // Financial
  VIEW_DONATIONS = 'view_donations',
  MANAGE_DONATIONS = 'manage_donations',
  
  // Prayer requests
  VIEW_PRAYERS = 'view_prayers',
  MANAGE_PRAYERS = 'manage_prayers',
  
  // Admin
  SYSTEM_ADMIN = 'system_admin',
  CHILD_PROTECTION = 'child_protection'
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.VISITOR]: [Permission.VIEW_CONTENT],
  
  [UserRole.MEMBER]: [
    Permission.VIEW_CONTENT,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PRAYERS
  ],
  
  [UserRole.VOLUNTEER]: [
    Permission.VIEW_CONTENT,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_PRAYERS,
    Permission.CREATE_EVENTS
  ],
  
  [UserRole.STAFF]: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.VIEW_MEMBERS,
    Permission.MANAGE_MEMBERS,
    Permission.CREATE_EVENTS,
    Permission.MANAGE_EVENTS,
    Permission.VIEW_PRAYERS,
    Permission.MANAGE_PRAYERS,
    Permission.CHILD_PROTECTION
  ],
  
  [UserRole.PASTOR]: [
    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.VIEW_MEMBERS,
    Permission.MANAGE_MEMBERS,
    Permission.CREATE_EVENTS,
    Permission.MANAGE_EVENTS,
    Permission.VIEW_PRAYERS,
    Permission.MANAGE_PRAYERS,
    Permission.VIEW_DONATIONS,
    Permission.CHILD_PROTECTION
  ],
  
  [UserRole.ADMIN]: Object.values(Permission)
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function getUserPermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

export function canAccessChildProtectedContent(userRole: UserRole): boolean {
  return hasPermission(userRole, Permission.CHILD_PROTECTION);
}