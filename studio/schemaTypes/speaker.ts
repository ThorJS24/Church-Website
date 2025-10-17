import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'speaker',
  title: 'Speaker',
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
      title: 'Title/Position',
      type: 'string',
      placeholder: 'e.g., Pastor, Guest Speaker, Evangelist'
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'blockContent',
    }),
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      description: 'Brief description for sermon listings'
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
      type: 'string',
      validation: Rule => Rule.email()
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media',
      type: 'object',
      fields: [
        defineField({name: 'facebook', title: 'Facebook', type: 'url'}),
        defineField({name: 'twitter', title: 'Twitter', type: 'url'}),
        defineField({name: 'instagram', title: 'Instagram', type: 'url'}),
        defineField({name: 'youtube', title: 'YouTube', type: 'url'}),
      ]
    }),
    defineField({
      name: 'isStaff',
      title: 'Is Church Staff',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active Speaker',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}]
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({title, subtitle, media, isActive}) {
      return {
        title,
        subtitle: `${subtitle || 'Speaker'} ${!isActive ? '(Inactive)' : ''}`,
        media,
      }
    },
  },
})