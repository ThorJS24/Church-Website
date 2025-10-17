import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'ministriesPage',
  title: 'Ministries Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Page Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'getInvolvedSectionTitle',
      title: 'Get Involved Section Title',
      type: 'string',
    }),
    defineField({
      name: 'getInvolved',
      title: 'Get Involved',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'title', title: 'Title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text'}),
      ]}]
    }),
    defineField({
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
    }),
    defineField({
      name: 'ctaDescription',
      title: 'CTA Description',
      type: 'text',
    }),
  ],
})
