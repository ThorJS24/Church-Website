'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  t: (key: string) => string;
}

const translations = {
  welcome: 'Welcome to',
  tagline: 'Where faith meets community, and hope comes alive',
  joinSunday: 'Join Us Sunday 10:00 AM',
  learnMore: 'Learn More About Us',
  latestAnnouncements: 'Latest Announcements',
  connectWithUs: 'Connect With Us',
  findUs: 'Find Us',
  joinUsSunday: 'Join Us Sunday',
  joinUsSundayDesc: 'Worship with us every Sunday at 10:00 AM',
  giveOnline: 'Give Online',
  giveOnlineDesc: 'Support our mission with a secure donation',
  prayerRequest: 'Prayer Request',
  prayerRequestDesc: 'Share your prayer needs with our community',
  getInTouch: 'Get In Touch',
  getInTouchDesc: 'Contact us with questions or to learn more',
  home: 'Home',
  about: 'About',
  services: 'Services',
  ministries: 'Ministries',
  events: 'Events',
  sermons: 'Sermons',
  gallery: 'Gallery',
  give: 'Give',
  contact: 'Contact',
  login: 'Login',
  register: 'Register',
  welcomeAnnouncementTitle: 'Welcome to Our Church Family!',
  welcomeAnnouncementContent: 'We are delighted to have you with us. Explore our community and join our services.',
  christmasServiceTitle: 'Christmas Eve Special Service',
  christmasServiceContent: 'Join us for a special candlelight service to celebrate the birth of Jesus Christ.',
  youthCampRegistrationTitle: 'Youth Camp Registration Now Open',
  youthCampRegistrationContent: 'Sign up your children for an exciting and spiritually enriching experience at our annual youth camp.',
  always: 'Always',
  dec25: 'Dec 25',
  jan15: 'Jan 15',
  members: 'Members',
  ministries: 'Ministries',
  yearsServing: 'Years Serving',
  livesTouched: 'Lives Touched',
  addressLine1: '123 Main Street',
  addressLine2: 'Anytown, USA 12345',
  addressLine3: 'Building A, Suite 100',
  addressLine4: 'United States',
  interactiveMap: 'Interactive Map',
  mapLocation: 'Find us on Google Maps'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string): string => {
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return { t: (key: string) => key };
  }
  return context;
}