export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: any) => Rule.required().email()
    },
    {
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'avatar',
      title: 'Avatar',
      type: 'image'
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Member', value: 'member' },
          { title: 'Moderator', value: 'moderator' },
          { title: 'Admin', value: 'admin' },
          { title: 'Pastor', value: 'pastor' }
        ]
      },
      initialValue: 'member'
    },
    {
      name: 'permissions',
      title: 'Permissions',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Upload Images', value: 'upload_images' },
          { title: 'Moderate Comments', value: 'moderate_comments' },
          { title: 'Manage Events', value: 'manage_events' },
          { title: 'Manage Users', value: 'manage_users' }
        ]
      }
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'joinedAt',
      title: 'Joined At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime'
    }
  ]
}