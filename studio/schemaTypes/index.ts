import blockContent from './blockContent'
import siteSettings from './siteSettings'
import homePage from './homePage'
import aboutPage from './aboutPage'
import staffMember from './staffMember'
import speaker from './speaker'
import series from './series'
import sermon from './sermon'
import service from './service'
import ministry from './ministry'
import event from './event'
import announcement from './announcement'
import galleryImage from './galleryImage'

export const schemaTypes = [
  // Site Configuration
  siteSettings,
  
  // Page Content
  homePage,
  aboutPage,
  
  // People
  staffMember,
  speaker,
  
  // Content
  sermon,
  series,
  service,
  ministry,
  event,
  announcement,
  galleryImage,
  
  // Utilities
  blockContent,
]