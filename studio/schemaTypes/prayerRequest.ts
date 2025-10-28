import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'prayerRequest',
  title: 'Prayer Request',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Health', value: 'health' },
          { title: 'Family', value: 'family' },
          { title: 'Guidance', value: 'guidance' },
          { title: 'Thanksgiving', value: 'thanksgiving' },
          { title: 'Other', value: 'other' }
        ]
      }
    }),
    defineField({
      name: 'isPrivate',
      title: 'Private Request',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Anonymous Request',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string'
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Answered', value: 'answered' },
          { title: 'Archived', value: 'archived' }
        ]
      },
      initialValue: 'active'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'isPrivate'
    },
    prepare(selection) {
      const { title, subtitle, media } = selection
      return {
        title: title,
        subtitle: `${subtitle} ${media ? '(Private)' : ''}`,
      }
    }
  }
})