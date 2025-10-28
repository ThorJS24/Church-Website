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
      name: 'tagline',
      title: 'Church Tagline',
      type: 'string',
      description: 'Short description that appears on the homepage',
      initialValue: 'A place where faith meets community, and hope comes alive'
    }),
    defineField({
      name: 'statistics',
      title: 'Homepage Statistics',
      type: 'object',
      fields: [
        defineField({ name: 'members', title: 'Members Count', type: 'string', initialValue: '500+' }),
        defineField({ name: 'yearsServing', title: 'Years Serving', type: 'string', initialValue: '25+' }),
        defineField({ name: 'weeklyServices', title: 'Weekly Services', type: 'string', initialValue: '3' }),
        defineField({ name: 'ministries', title: 'Ministries Count', type: 'string', initialValue: '15+' })
      ]
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