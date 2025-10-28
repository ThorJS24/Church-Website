export default {
  name: 'chatMessage',
  title: 'Chat Message',
  type: 'document',
  fields: [
    {
      name: 'message',
      title: 'Message',
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
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'livestream',
      title: 'Livestream',
      type: 'reference',
      to: [{ type: 'livestream' }],
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'isVisible',
      title: 'Visible',
      type: 'boolean',
      initialValue: true
    }
  ]
}