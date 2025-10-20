import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'series',
  title: 'Sermon Series',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Series Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
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
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'date',
    }),
    defineField({
      name: 'image',
      title: 'Series Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'color',
      title: 'Theme Color',
      type: 'string',
      description: 'Primary color for this series (hex code)',
      placeholder: '#3B82F6'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'featured',
      title: 'Featured Series',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active Series',
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
            {title: 'Adults', value: 'adults'},
            {title: 'Youth', value: 'youth'},
            {title: 'Children', value: 'children'},
            {title: 'New Believers', value: 'new-believers'},
            {title: 'Mature Christians', value: 'mature'},
          ],
        }
      }],
      initialValue: ['everyone']
    }),
  ],
  orderings: [
    {
      title: 'Start Date, New',
      name: 'startDateDesc',
      by: [{field: 'startDate', direction: 'desc'}]
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [{field: 'featured', direction: 'desc'}, {field: 'startDate', direction: 'desc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      endDate: 'endDate',
      media: 'image',
      featured: 'featured',
    },
    prepare({title, startDate, endDate, media, featured}) {
      const dateRange = endDate 
        ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        : `Started ${new Date(startDate).toLocaleDateString()}`;
      
      return {
        title: `${title} ${featured ? '⭐' : ''}`,
        subtitle: dateRange,
        media,
      }
    },
  },
})