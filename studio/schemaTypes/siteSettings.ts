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
    defineField({
      name: 'facebookUrl',
      title: 'Facebook Page URL',
      type: 'url',
      description: 'Full Facebook page URL'
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Page URL',
      type: 'url',
      description: 'Full Instagram page URL'
    }),
    defineField({
      name: 'youtubeChannelUrl',
      title: 'YouTube Channel URL',
      type: 'url',
      description: 'Full YouTube channel URL'
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps URL',
      type: 'url',
      description: 'Google Maps location URL for directions'
    }),
    defineField({
      name: 'zoomMeetingUrl',
      title: 'Zoom Meeting URL',
      type: 'url',
      description: 'Zoom meeting link for online services'
    }),
    defineField({
      name: 'whatsappGroupUrl',
      title: 'WhatsApp Group URL',
      type: 'url',
      description: 'WhatsApp group invitation link'
    }),
  ],
})