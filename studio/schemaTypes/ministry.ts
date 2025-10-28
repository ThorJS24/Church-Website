import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'ministry',
  title: 'Ministry',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Ministry Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief description for cards and listings'
    }),
    defineField({
      name: 'leader',
      title: 'Ministry Leader',
      type: 'reference',
      to: {type: 'staffMember'},
    }),
    defineField({
      name: 'assistantLeaders',
      title: 'Assistant Leaders',
      type: 'array',
      of: [{type: 'reference', to: {type: 'staffMember'}}],
    }),
    defineField({
      name: 'category',
      title: 'Categories',
      type: 'array',
      of: [{
        type: 'string',
        options: {
          list: [
            {title: 'Children', value: 'children'},
            {title: 'Youth', value: 'youth'},
            {title: 'Adults', value: 'adults'},
            {title: 'Seniors', value: 'seniors'},
            {title: 'Worship', value: 'worship'},
            {title: 'Outreach', value: 'outreach'},
            {title: 'Education', value: 'education'},
            {title: 'Fellowship', value: 'fellowship'},
            {title: 'Service', value: 'service'},
          ],
        }
      }],
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'ageGroup',
      title: 'Age Group',
      type: 'string',
      options: {
        list: [
          {title: 'All Ages', value: 'all'},
          {title: 'Children (0-12)', value: 'children'},
          {title: 'Youth (13-18)', value: 'youth'},
          {title: 'Young Adults (19-35)', value: 'young-adults'},
          {title: 'Adults (36-64)', value: 'adults'},
          {title: 'Seniors (65+)', value: 'seniors'},
        ],
      },
    }),
    defineField({
      name: 'meetingSchedule',
      title: 'Meeting Schedule',
      type: 'object',
      fields: [
        defineField({name: 'dayOfWeek', title: 'Day of Week', type: 'string', options: {
          list: [
            {title: 'Sunday', value: 'sunday'},
            {title: 'Monday', value: 'monday'},
            {title: 'Tuesday', value: 'tuesday'},
            {title: 'Wednesday', value: 'wednesday'},
            {title: 'Thursday', value: 'thursday'},
            {title: 'Friday', value: 'friday'},
            {title: 'Saturday', value: 'saturday'},
          ],
        }}),
        defineField({name: 'time', title: 'Time', type: 'string', placeholder: 'e.g., 7:00 PM'}),
        defineField({name: 'frequency', title: 'Frequency', type: 'string', options: {
          list: [
            {title: 'Weekly', value: 'weekly'},
            {title: 'Bi-weekly', value: 'biweekly'},
            {title: 'Monthly', value: 'monthly'},
            {title: 'As Needed', value: 'as-needed'},
          ],
        }}),
      ]
    }),
    defineField({
      name: 'location',
      title: 'Meeting Location',
      type: 'string',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: Rule => Rule.email()
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Ministry Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements/Prerequisites',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'goals',
      title: 'Ministry Goals',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'isActive',
      title: 'Active Ministry',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'acceptingNewMembers',
      title: 'Accepting New Members',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Ministry',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{field: 'title', direction: 'asc'}]
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [{field: 'featured', direction: 'desc'}, {field: 'title', direction: 'asc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      leader: 'leader.name',
      media: 'image',
      featured: 'featured',
      isActive: 'isActive',
    },
    prepare({title, category, leader, media, featured, isActive}) {
      const categoryText = Array.isArray(category) ? category.join(', ') : category;
      return {
        title: `${title} ${featured ? '⭐' : ''} ${!isActive ? '(Inactive)' : ''}`,
        subtitle: `${leader ? `Led by ${leader}` : 'No leader assigned'} - ${categoryText || 'No category'}`,
        media,
      }
    },
  },
})