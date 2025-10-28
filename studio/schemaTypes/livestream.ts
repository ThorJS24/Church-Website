export default {
  name: 'livestream',
  title: 'Live Stream',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Stream Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'streamType',
      title: 'Stream Type',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube Live', value: 'youtube' },
          { title: 'RTMP Stream', value: 'rtmp' },
          { title: 'Direct URL', value: 'direct' }
        ]
      },
      initialValue: 'youtube'
    },
    {
      name: 'streamUrl',
      title: 'Stream URL',
      type: 'url',
      description: 'YouTube URL, RTMP URL (rtmp://a.rtmp.youtube.com/live2/KEY), or direct stream URL'
    },
    {
      name: 'streamKey',
      title: 'Stream Key (for RTMP)',
      type: 'string',
      description: 'Your YouTube stream key for RTMP streaming'
    },
    {
      name: 'isLive',
      title: 'Is Currently Live',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'scheduledStart',
      title: 'Scheduled Start Time',
      type: 'datetime'
    },
    {
      name: 'thumbnail',
      title: 'Stream Thumbnail',
      type: 'image'
    },
    {
      name: 'chatEnabled',
      title: 'Enable Chat',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'viewerCount',
      title: 'Viewer Count',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'autoRefresh',
      title: 'Auto Refresh Viewer Count',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'refreshInterval',
      title: 'Refresh Interval (seconds)',
      type: 'number',
      initialValue: 30
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Sunday Service', value: 'sunday_service' },
          { title: 'Bible Study', value: 'bible_study' },
          { title: 'Prayer Meeting', value: 'prayer_meeting' },
          { title: 'Special Event', value: 'special_event' }
        ]
      }
    }
  ]
}