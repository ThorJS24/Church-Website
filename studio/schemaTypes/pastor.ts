import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pastor',
  title: 'Pastor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      placeholder: 'e.g., Senior Pastor, Associate Pastor'
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 4
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string'
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string'
    }),
    defineField({
      name: 'yearsOfService',
      title: 'Years of Service',
      type: 'number'
    }),
    defineField({
      name: 'ordainedDate',
      title: 'Ordained Date',
      type: 'date',
      description: 'Date ordained to ministry'
    }),
    defineField({
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [{type: 'string'}]
    }),
    defineField({
      name: 'specialties',
      title: 'Ministry Specialties',
      type: 'array',
      of: [{type: 'string'}]
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'image'
    }
  }
})