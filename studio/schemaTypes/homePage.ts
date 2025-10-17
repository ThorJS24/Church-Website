import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'welcomeMessage',
      title: 'Welcome Message',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      validation: Rule => Rule.required()
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
  ],
})