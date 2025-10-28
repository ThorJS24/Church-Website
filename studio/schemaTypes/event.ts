import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date & Time',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'endDate',
      title: 'End Date & Time',
      type: 'datetime',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Brief description for cards and listings'
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'address',
      title: 'Full Address',
      type: 'text',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Worship Service', value: 'worship'},
          {title: 'Ministry Event', value: 'ministry'},
          {title: 'Outreach', value: 'outreach'},
          {title: 'Social/Fellowship', value: 'social'},
          {title: 'Education/Study', value: 'education'},
          {title: 'Special Service', value: 'special'},
          {title: 'Conference', value: 'conference'},
          {title: 'Youth Event', value: 'youth'},
          {title: 'Children Event', value: 'children'},
        ],
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'organizer',
      title: 'Organizer',
      type: 'reference',
      to: {type: 'staffMember'},
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      validation: Rule => Rule.email()
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'registrationRequired',
      title: 'Registration Required',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration URL',
      type: 'url',
      hidden: ({document}) => !document?.registrationRequired
    }),
    defineField({
      name: 'maxAttendees',
      title: 'Maximum Attendees',
      type: 'number',
      hidden: ({document}) => !document?.registrationRequired
    }),
    defineField({
      name: 'cost',
      title: 'Cost',
      type: 'number',
      initialValue: 0,
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
      title: 'Featured Event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'recurring',
      title: 'Recurring Event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'recurrencePattern',
      title: 'Recurrence Pattern',
      type: 'string',
      options: {
        list: [
          {title: 'Weekly', value: 'weekly'},
          {title: 'Monthly', value: 'monthly'},
          {title: 'Yearly', value: 'yearly'},
        ],
      },
      hidden: ({document}) => !document?.recurring
    }),
    defineField({
      name: 'isPublic',
      title: 'Public Event',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showInGallery',
      title: 'Show in Gallery',
      type: 'boolean',
      initialValue: true,
      description: 'Display this event in the photo gallery section'
    }),
    defineField({
      name: 'galleryDescription',
      title: 'Gallery Description',
      type: 'text',
      rows: 3,
      description: 'Optional description specifically for the gallery view'
    }),
  ],
  orderings: [
    {
      title: 'Start Date, New',
      name: 'startDateDesc',
      by: [{field: 'startDate', direction: 'desc'}]
    },
    {
      title: 'Featured First',
      name: 'featured',
      by: [{field: 'featured', direction: 'desc'}, {field: 'startDate', direction: 'asc'}]
    }
  ],
  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      category: 'category',
      media: 'image',
      featured: 'featured',
    },
    prepare({title, startDate, category, media, featured}) {
      return {
        title: `${title} ${featured ? '⭐' : ''}`,
        subtitle: `${new Date(startDate).toLocaleDateString()} - ${category}`,
        media,
      }
    },
  },
})