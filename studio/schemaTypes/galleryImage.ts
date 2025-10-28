import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Image Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'event',
      title: 'Related Event',
      type: 'reference',
      to: {type: 'event'},
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'dateTaken',
      title: 'Date Taken',
      type: 'date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'string',
    }),
    defineField({
      name: 'isPublic',
      title: 'Public Image',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide from public gallery'
    }),
  ],
  orderings: [
    {
      title: 'Date Taken, New',
      name: 'dateTakenDesc',
      by: [{field: 'dateTaken', direction: 'desc'}]
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [{field: 'featured', direction: 'desc'}, {field: 'dateTaken', direction: 'desc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      dateTaken: 'dateTaken',
      media: 'image',
      isPublic: 'isPublic',
      event: 'event.title'
    },
    prepare({title, dateTaken, media, isPublic, event}) {
      return {
        title: `${title} ${!isPublic ? '🔒' : ''}`,
        subtitle: `${new Date(dateTaken).toLocaleDateString()} - ${event || 'No event'}`,
        media,
      }
    },
  },
})