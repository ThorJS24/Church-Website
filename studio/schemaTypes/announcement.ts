import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'date',
      title: 'Date & Time',
      type: 'datetime',
      validation: Rule => Rule.required(),
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'expiryDate',
      title: 'Expiry Date',
      type: 'date',
      description: 'When this announcement should stop showing'
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: 'Low', value: 'low'},
          {title: 'Normal', value: 'normal'},
          {title: 'High', value: 'high'},
          {title: 'Urgent', value: 'urgent'},
        ],
      },
      initialValue: 'normal',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'General', value: 'general'},
          {title: 'Service', value: 'service'},
          {title: 'Event', value: 'event'},
          {title: 'Ministry', value: 'ministry'},
          {title: 'Emergency', value: 'emergency'},
        ],
      },
      initialValue: 'general',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'array',
      of: [{
        type: 'string',
        options: {
          list: [
            {title: 'Everyone', value: 'everyone'},
            {title: 'Members Only', value: 'members'},
            {title: 'Visitors', value: 'visitors'},
            {title: 'Youth', value: 'youth'},
            {title: 'Children', value: 'children'},
            {title: 'Adults', value: 'adults'},
          ],
        }
      }],
      initialValue: ['everyone']
    }),
  ],
  orderings: [
    {
      title: 'Date, New',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}]
    },
    {
      title: 'Priority',
      name: 'priority',
      by: [{field: 'priority', direction: 'desc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      priority: 'priority',
      active: 'active',
    },
    prepare({title, date, priority, active}) {
      return {
        title,
        subtitle: `${new Date(date).toLocaleDateString()} - ${priority} ${!active ? '(Inactive)' : ''}`,
      }
    },
  },
})