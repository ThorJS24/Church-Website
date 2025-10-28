import blockContent from './blockContent'
import siteSettings from './siteSettings'
import aboutPage from './aboutPage'
import communityPage from './communityPage'
import branchesPage from './branchesPage'
import staffMember from './staffMember'
import speaker from './speaker'
import pastor from './pastor'
import series from './series'
import sermon from './sermon'
import service from './service'
import ministry from './ministry'
import ministriesPage from './ministriesPage'
import servicesPage from './servicesPage'
import event from './event'
import announcement from './announcement'
import galleryImage from './galleryImage'
import comment from './comment'
import user from './user'
import livestream from './livestream'
import chatMessage from './chatMessage'
import prayerRequest from './prayerRequest'
import ambientAudio from './ambientAudio'
import historyTimeline from './historyTimeline'

export const schemaTypes = [
  // Site Configuration
  siteSettings,
  
  // Page Content
  aboutPage,
  communityPage,
  branchesPage,
  ministriesPage,
  servicesPage,
  historyTimeline,
  
  // People
  staffMember,
  speaker,
  pastor,
  
  // Content
  sermon,
  series,
  service,
  ministry,
  event,
  announcement,
  galleryImage,
  comment,
  user,
  livestream,
  chatMessage,
  prayerRequest,
  ambientAudio,
  blockContent,
]