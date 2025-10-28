export default {
  name: 'ambientAudio',
  title: 'Ambient Audio',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'audioFile',
      title: 'Audio File',
      type: 'file',
      options: {
        accept: 'audio/*'
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'isActive',
      title: 'Use as Active Ambient Audio',
      type: 'boolean',
      description: 'Only one audio can be active at a time',
      initialValue: false
    },
    {
      name: 'volume',
      title: 'Volume (0-100)',
      type: 'number',
      initialValue: 20,
      validation: (Rule: any) => Rule.min(0).max(100)
    }
  ]
}