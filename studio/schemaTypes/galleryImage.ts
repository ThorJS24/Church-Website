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
      name: 'alt',
      title: 'Alt Text',
      type: 'string',
      description: 'Alternative text for accessibility',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Categories',
      type: 'array',
      of: [{
        type: 'string',
        options: {
          list: [
            {title: 'Worship Services', value: 'services'},
            {title: 'Special Events', value: 'events'},
            {title: 'Ministry Activities', value: 'ministry'},
            {title: 'Community Outreach', value: 'community'},
            {title: 'Youth Activities', value: 'youth'},
            {title: 'Children Programs', value: 'children'},
            {title: 'Baptisms', value: 'baptisms'},
            {title: 'Weddings', value: 'weddings'},
            {title: 'Holidays', value: 'holidays'},
            {title: 'Church Building', value: 'building'},
          ],
        }
      }],
      validation: Rule => Rule.required().min(1)
    }),
    defineField({
      name: 'dateTaken',
      title: 'Date Taken',
      type: 'date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'string',
    }),
    defineField({
      name: 'event',
      title: 'Related Event',
      type: 'reference',
      to: {type: 'event'},
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
      title: 'Featured Image',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isPublic',
      title: 'Public Image',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide from public gallery'
    }),
    defineField({
      name: 'allowDownload',
      title: 'Allow Download',
      type: 'boolean',
      initialValue: true,
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
      category: 'category',
      dateTaken: 'dateTaken',
      media: 'image',
      featured: 'featured',
      isPublic: 'isPublic',
    },
    prepare({title, category, dateTaken, media, featured, isPublic}) {
      const categoryText = Array.isArray(category) ? category.join(', ') : category;
      return {
        title: `${title} ${featured ? '⭐' : ''} ${!isPublic ? '🔒' : ''}`,
        subtitle: `${new Date(dateTaken).toLocaleDateString()} - ${categoryText || 'No category'}`,
        media,
      }
    },
  },
})