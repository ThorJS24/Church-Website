import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'Beliefs & About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'Our Beliefs & About Us'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      initialValue: 'Learn about our church family and what we believe'
    }),

    defineField({
      name: 'mission',
      title: 'Mission Statement',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'vision',
      title: 'Vision Statement',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'beliefsSectionTitle',
      title: 'Beliefs Section Title',
      type: 'string',
      initialValue: 'What We Believe'
    }),
    defineField({
      name: 'beliefs',
      title: 'What We Believe (Simple List)',
      type: 'array',
      description: 'Simple beliefs list for the main about section',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Belief Title',
              type: 'string'
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text'
            },
            {
              name: 'scriptureReferences',
              title: 'Scripture References',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'reference',
                      title: 'Scripture Reference (e.g., John 3:16)',
                      type: 'string'
                    },
                    {
                      name: 'verse',
                      title: 'Full Verse Text',
                      type: 'text'
                    },
                    {
                      name: 'version',
                      title: 'Bible Version',
                      type: 'string',
                      initialValue: 'NKJV'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'valuesSectionTitle',
      title: 'Values Section Title',
      type: 'string',
      initialValue: 'Core Values'
    }),
    defineField({
      name: 'values',
      title: 'Core Values',
      type: 'array',
      description: 'Main core values section',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Value Title',
              type: 'string'
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text'
            },
            {
              name: 'scriptureReferences',
              title: 'Scripture References',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'reference',
                      title: 'Scripture Reference (e.g., John 3:16)',
                      type: 'string'
                    },
                    {
                      name: 'verse',
                      title: 'Full Verse Text',
                      type: 'text'
                    },
                    {
                      name: 'version',
                      title: 'Bible Version',
                      type: 'string',
                      initialValue: 'NKJV'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),

    defineField({
      name: 'guidingScripture',
      title: 'Main Guiding Scripture',
      type: 'object',
      description: 'Main scripture for the about section',
      fields: [
        {
          name: 'verse',
          title: 'Bible Verse',
          type: 'text'
        },
        {
          name: 'reference',
          title: 'Scripture Reference',
          type: 'string'
        }
      ]
    }),

    defineField({
      name: 'history',
      title: 'History Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
          initialValue: 'Our History'
        },
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'string'
        },
        {
          name: 'foundingYear',
          title: 'Founding Year',
          type: 'number'
        },
        {
          name: 'foundingStory',
          title: 'Founding Story',
          type: 'blockContent'
        },
        {
          name: 'milestones',
          title: 'Historical Milestones',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'year',
                  title: 'Year',
                  type: 'number'
                },
                {
                  name: 'date',
                  title: 'Exact Date (Optional)',
                  type: 'date'
                },
                {
                  name: 'title',
                  title: 'Milestone Title',
                  type: 'string'
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'text'
                },
                {
                  name: 'image',
                  title: 'Milestone Image',
                  type: 'image',
                  options: {
                    hotspot: true
                  }
                }
              ]
            }
          ]
        },
        {
          name: 'historicalImages',
          title: 'Historical Images Gallery',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  options: {
                    hotspot: true
                  }
                },
                {
                  name: 'caption',
                  title: 'Caption',
                  type: 'string'
                }
              ]
            }
          ]
        }
      ]
    }),

  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    }
  }
})