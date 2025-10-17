import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Page Subtitle',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'mission',
      title: 'Mission Statement',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'vision',
      title: 'Vision Statement',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'valuesSectionTitle',
      title: 'Values Section Title',
      type: 'string',
    }),
    defineField({
      name: 'values',
      title: 'Values',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
          defineField({name: 'description', title: 'Description', type: 'text', validation: Rule => Rule.required()}),
        ],
      }],
    }),
    defineField({
      name: 'storySectionTitle',
      title: 'Story Section Title',
      type: 'string',
    }),
    defineField({
      name: 'timeline',
      title: 'Timeline',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'year', title: 'Year', type: 'string', validation: Rule => Rule.required()}),
          defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
          defineField({name: 'description', title: 'Description', type: 'text', validation: Rule => Rule.required()}),
        ],
      }],
    }),
    defineField({
      name: 'stats',
      title: 'Statistics',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'number', title: 'Number', type: 'string', validation: Rule => Rule.required()}),
          defineField({name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required()}),
        ],
      }],
    }),
    defineField({
      name: 'beliefsSectionTitle',
      title: 'Beliefs Section Title',
      type: 'string',
    }),
    defineField({
      name: 'beliefs',
      title: 'Beliefs',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required()}),
          defineField({name: 'description', title: 'Description', type: 'text', validation: Rule => Rule.required()}),
        ],
      }],
    }),
  ],
})