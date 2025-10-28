import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'branchesPage',
  title: 'Our Branches Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'Our Branches'
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      initialValue: 'Spreading God\'s love across communities'
    }),
    defineField({
      name: 'branches',
      title: 'Church Branches',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Branch Name',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3
            },
            {
              name: 'established',
              title: 'Year Established',
              type: 'string'
            },
            {
              name: 'location',
              title: 'Location Details',
              type: 'object',
              description: 'Enter the full address and GPS coordinates for map integration',
              fields: [
                {
                  name: 'address',
                  title: 'Full Address',
                  type: 'text',
                  rows: 2,
                  validation: Rule => Rule.required(),
                  description: 'Complete address including street, city, state, and postal code'
                },
                {
                  name: 'coordinates',
                  title: 'GPS Coordinates',
                  type: 'object',
                  description: 'Get coordinates from Google Maps by right-clicking on the location',
                  fields: [
                    {
                      name: 'lat',
                      title: 'Latitude',
                      type: 'number',
                      validation: Rule => Rule.required().min(-90).max(90),
                      description: 'Latitude value (e.g., 11.678131)'
                    },
                    {
                      name: 'lng',
                      title: 'Longitude', 
                      type: 'number',
                      validation: Rule => Rule.required().min(-180).max(180),
                      description: 'Longitude value (e.g., 78.165600)'
                    }
                  ]
                },
                {
                  name: 'googleMapsUrl',
                  title: 'Google Maps URL (Optional)',
                  type: 'url',
                  description: 'Direct link to Google Maps location for easy sharing'
                }
              ]
            },
            {
              name: 'pastors',
              title: 'Branch Pastors',
              type: 'array',
              of: [{
                type: 'reference',
                to: [{type: 'pastor'}]
              }],
              description: 'Select pastors assigned to this branch'
            },
            {
              name: 'contact',
              title: 'Contact Information',
              type: 'object',
              fields: [
                {
                  name: 'phone',
                  title: 'Phone Number',
                  type: 'string'
                },
                {
                  name: 'email',
                  title: 'Email Address',
                  type: 'string'
                }
              ]
            },
            {
              name: 'images',
              title: 'Branch Images',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'asset',
                      title: 'Image',
                      type: 'image',
                      options: {
                        hotspot: true
                      }
                    },
                    {
                      name: 'alt',
                      title: 'Alt Text',
                      type: 'string'
                    }
                  ]
                }
              ]
            },
            {
              name: 'services',
              title: 'Service Times',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'day',
                      title: 'Day',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Sunday', value: 'Sunday'},
                          {title: 'Monday', value: 'Monday'},
                          {title: 'Tuesday', value: 'Tuesday'},
                          {title: 'Wednesday', value: 'Wednesday'},
                          {title: 'Thursday', value: 'Thursday'},
                          {title: 'Friday', value: 'Friday'},
                          {title: 'Saturday', value: 'Saturday'}
                        ]
                      }
                    },
                    {
                      name: 'time',
                      title: 'Time',
                      type: 'string'
                    },
                    {
                      name: 'type',
                      title: 'Service Type',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Morning Worship', value: 'Morning Worship'},
                          {title: 'Evening Service', value: 'Evening Service'},
                          {title: 'Bible Study', value: 'Bible Study'},
                          {title: 'Prayer Meeting', value: 'Prayer Meeting'},
                          {title: 'Youth Service', value: 'Youth Service'}
                        ]
                      }
                    }
                  ]
                }
              ]
            },
            {
              name: 'memberCount',
              title: 'Member Count (Optional)',
              type: 'number'
            },
            {
              name: 'parentBranch',
              title: 'Parent Branch',
              type: 'string',
              description: 'Name of parent church that established this branch'
            },
            {
              name: 'isMainChurch',
              title: 'Main Church',
              type: 'boolean',
              initialValue: false,
              description: 'Check if this is the main/parent church'
            }
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'location.address',
              media: 'images.0.asset'
            }
          }
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