import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'communityPage',
  title: 'Community & Outreach Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'Community & Outreach'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      initialValue: 'Serving our community with love and compassion'
    }),
    defineField({
      name: 'missions',
      title: 'Missions & Local Outreach',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Mission Title',
              type: 'string'
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text'
            },
            {
              name: 'location',
              title: 'Location',
              type: 'string'
            },
            {
              name: 'image',
              title: 'Mission Image',
              type: 'image',
              options: {
                hotspot: true
              }
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'outreachStories',
      title: 'Outreach Stories',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Story Title',
              type: 'string'
            },
            {
              name: 'story',
              title: 'Story Content',
              type: 'text',
              rows: 4
            },
            {
              name: 'date',
              title: 'Date',
              type: 'date'
            },
            {
              name: 'image',
              title: 'Story Image',
              type: 'image',
              options: {
                hotspot: true
              }
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'communityResources',
      title: 'Community Resources',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Resource Title',
              type: 'string'
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text'
            },
            {
              name: 'schedule',
              title: 'Schedule/Timing',
              type: 'string'
            },
            {
              name: 'contactInfo',
              title: 'Contact Information',
              type: 'string'
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'testimonies',
      title: 'Testimonies & Life Change Stories',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Person Name',
              type: 'string'
            },
            {
              name: 'testimony',
              title: 'Testimony',
              type: 'text',
              rows: 4
            },
            {
              name: 'date',
              title: 'Date',
              type: 'date'
            },
            {
              name: 'image',
              title: 'Person Image (Optional)',
              type: 'image',
              options: {
                hotspot: true
              }
            }
          ]
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle'
    }
  }
})