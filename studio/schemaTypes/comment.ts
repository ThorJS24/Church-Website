export default {
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    {
      name: 'text',
      title: 'Comment Text',
      type: 'text',
      validation: (Rule: any) => Rule.required().max(500)
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'image',
      title: 'Image',
      type: 'reference',
      to: [{ type: 'galleryImage' }],
      validation: (Rule: any) => Rule.required()
    }
  ]
}