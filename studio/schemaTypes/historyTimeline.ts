import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'historyTimeline',
  title: 'History Timeline',
  type: 'document',
  fields: [
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: {
        hotspot: true,
      }
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Foundation', value: 'foundation'},
          {title: 'Growth', value: 'growth'},
          {title: 'Ministry', value: 'ministry'},
          {title: 'Building', value: 'building'},
          {title: 'Leadership', value: 'leadership'},
          {title: 'Community', value: 'community'},
          {title: 'Milestone', value: 'milestone'},
        ],
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'featured',
      title: 'Featured Event',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Year, Oldest',
      name: 'yearAsc',
      by: [{field: 'year', direction: 'asc'}]
    },
    {
      title: 'Year, Newest',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      category: 'category',
      media: 'image',
      featured: 'featured',
    },
    prepare({title, year, category, media, featured}) {
      return {
        title: `${year} - ${title} ${featured ? '⭐' : ''}`,
        subtitle: category,
        media,
      }
    },
  },
})