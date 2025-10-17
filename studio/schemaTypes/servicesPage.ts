import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'servicesPage',
  title: 'Services Page',
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
      name: 'whatToExpectSectionTitle',
      title: 'What to Expect Section Title',
      type: 'string',
    }),
    defineField({
      name: 'whatToExpect',
      title: 'What to Expect',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'title', title: 'Title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text'}),
      ]}]
    }),
    defineField({
      name: 'specialEventsSectionTitle',
      title: 'Special Events Section Title',
      type: 'string',
    }),
    defineField({
      name: 'specialEvents',
      title: 'Special Events',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'title', title: 'Title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text'}),
        defineField({name: 'date', title: 'Date', type: 'string'}),
      ]}]
    }),
    defineField({
      name: 'onlineServicesTitle',
      title: 'Online Services Title',
      type: 'string',
    }),
    defineField({
      name: 'onlineServicesDescription',
      title: 'Online Services Description',
      type: 'text',
    }),
    defineField({
      name: 'planYourVisitTitle',
      title: 'Plan Your Visit Title',
      type: 'string',
    }),
    defineField({
      name: 'planYourVisitDescription',
      title: 'Plan Your Visit Description',
      type: 'text',
    }),
    defineField({
      name: 'planYourVisit',
      title: 'Plan Your Visit',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'title', title: 'Title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text'}),
      ]}]
    }),
  ],
})