import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'sermon',
  title: 'Sermon',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Sermon Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'speaker',
      title: 'Speaker',
      type: 'reference',
      to: {type: 'speaker'},
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'series',
      title: 'Sermon Series',
      type: 'reference',
      to: {type: 'series'},
    }),
    defineField({
      name: 'date',
      title: 'Date Preached',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'scripture',
      title: 'Scripture Reference',
      type: 'string',
      placeholder: 'e.g., John 3:16, Romans 8:28-30'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'keyPoints',
      title: 'Key Points',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'timestamp', title: 'Timestamp', type: 'string', placeholder: 'e.g., 01:23'}),
          defineField({name: 'description', title: 'Description', type: 'string'}),
        ],
      }],
    }),

    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste any YouTube URL format: watch URL, share URL, or embed URL',
      placeholder: 'https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https']
      })
    }),
    defineField({
      name: 'transcript',
      title: 'Transcript',
      type: 'blockContent',
    }),
    defineField({
      name: 'notes',
      title: 'Sermon Notes',
      type: 'file',
      options: {
        accept: '.pdf,.doc,.docx'
      }
    }),
    defineField({
      name: 'image',
      title: 'Sermon Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'featured',
      title: 'Featured Sermon',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'downloadCount',
      title: 'Download Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Date, New',
      name: 'dateDesc',
      by: [{field: 'date', direction: 'desc'}]
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [{field: 'featured', direction: 'desc'}, {field: 'date', direction: 'desc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      speaker: 'speaker.name',
      date: 'date',
      series: 'series.title',
      featured: 'featured',
    },
    prepare({title, speaker, date, series, featured}) {
      return {
        title: `${title} ${featured ? '⭐' : ''}`,
        subtitle: `${speaker} - ${new Date(date).toLocaleDateString()} ${series ? `(${series})` : ''}`,
      }
    },
  },
})