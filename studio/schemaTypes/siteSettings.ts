import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'churchName',
      title: 'Church Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
  ],
})