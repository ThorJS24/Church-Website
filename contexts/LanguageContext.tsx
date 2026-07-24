'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.events': 'Events',
    'nav.sermons': 'Sermons',
    'nav.gallery': 'Gallery',
    'nav.contact': 'Contact',
    'nav.give': 'Give',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.register': 'Register',
    'nav.ministries': 'Ministries',
    'nav.community': 'Community',
    'nav.announcements': 'News',
    'nav.more': 'More',
    'nav.profile': 'My Profile',
    'nav.dashboard': 'Dashboard',
    'nav.toggleTheme': 'Toggle Theme',
    'nav.tagline': 'Faith • Hope • Love',
    
    // About submenu
    'nav.beliefs': 'Our Beliefs',
    'nav.branches': 'Our Branches', 
    'nav.pastors': 'Our Pastors',
    'nav.history': 'Our History',
    
    // Ministries submenu
    'nav.allMinistries': 'All Ministries',
    'nav.children': 'Children',
    'nav.youth': 'Youth',
    'nav.adults': 'Adults',
    
    // Home Page
    'home.welcome': 'Welcome to Salem Primitive Baptist Church',
    'home.subtitle': 'A place of faith, hope, and love',
    'home.liveStream': 'Live Stream',
    'home.upcomingEvents': 'Upcoming Events',
    'home.latestSermons': 'Latest Sermons',
    'home.joinUs': 'Join Us',
    'home.learnMore': 'Learn More',
    'home.watchLive': 'Watch Live',
    'home.ourMission': 'Our Mission',
    'home.ourVision': 'Our Vision',
    'home.ourValues': 'Our Values',
    
    // Services
    'services.wedding': 'Wedding',
    'services.baptism': 'Baptism',
    'services.request': 'Request Service',
    'services.title': 'Our Services',
    'services.description': 'We offer various services to serve our community',
    'services.schedule': 'Service Schedule',
    'services.sunday': 'Sunday Service',
    'services.prayer': 'Prayer Meeting',
    'services.bible': 'Bible Study',
    
    // Events
    'events.title': 'Upcoming Events',
    'events.noEvents': 'No upcoming events',
    'events.viewAll': 'View All Events',
    'events.register': 'Register',
    'events.details': 'Event Details',
    'events.date': 'Date',
    'events.time': 'Time',
    'events.location': 'Location',
    
    // Forms
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.message': 'Message',
    'form.submit': 'Submit',
    'form.required': 'Required',
    'form.optional': 'Optional',
    'form.sending': 'Sending...',
    'form.sent': 'Message Sent',
    'form.error': 'Error sending message',
    
    // Donations
    'donations.history': 'Donation History',
    'donations.amount': 'Amount',
    'donations.date': 'Date',
    'donations.type': 'Type',
    'donations.status': 'Status',
    'donations.receipt': 'Receipt',
    'donations.total': 'Total Donated',
    'donations.donate': 'Donate Now',
    'donations.oneTime': 'One-time',
    'donations.monthly': 'Monthly',
    'donations.thank': 'Thank you for your generosity',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.readMore': 'Read More',
    'common.showLess': 'Show Less'
  },
  ta: {
    // Navigation
    'nav.home': 'முகப்பு',
    'nav.about': 'எங்களைப் பற்றி',
    'nav.services': 'சேவைகள்',
    'nav.events': 'நிகழ்வுகள்',
    'nav.sermons': 'பிரசங்கங்கள்',
    'nav.gallery': 'படக்காட்சி',
    'nav.contact': 'தொடர்பு',
    'nav.give': 'நன்கொடை',
    'nav.login': 'உள்நுழைவு',
    'nav.logout': 'வெளியேறு',
    'nav.register': 'பதிவு செய்யவும்',
    'nav.ministries': 'ஊழியங்கள்',
    'nav.community': 'சமூகம்',
    'nav.announcements': 'செய்திகள்',
    'nav.more': 'மேலும்',
    'nav.profile': 'என் சுயவிவரம்',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.toggleTheme': 'தீம் மாற்று',
    'nav.tagline': 'நம்பிக்கை • நம்பிக்கை • அன்பு',
    
    // About submenu
    'nav.beliefs': 'எங்கள் நம்பிக்கைகள்',
    'nav.branches': 'எங்கள் கிளைகள்',
    'nav.pastors': 'எங்கள் போதகர்கள்',
    'nav.history': 'எங்கள் வரலாறு',
    
    // Ministries submenu
    'nav.allMinistries': 'அனைத்து ஊழியங்கள்',
    'nav.children': 'குழந்தைகள்',
    'nav.youth': 'இளைஞர்கள்',
    'nav.adults': 'பெரியவர்கள்',
    
    // Home Page
    'home.welcome': 'சேலம் பிரிமிட்டிவ் பாப்டிஸ்ட் தேவாலயத்திற்கு வரவேற்கிறோம்',
    'home.subtitle': 'நம்பிக்கை, நம்பிக்கை மற்றும் அன்பின் இடம்',
    'home.liveStream': 'நேரடி ஒளிபரப்பு',
    'home.upcomingEvents': 'வரவிருக்கும் நிகழ்வுகள்',
    'home.latestSermons': 'சமீபத்திய பிரசங்கங்கள்',
    'home.joinUs': 'எங்களுடன் சேரவும்',
    'home.learnMore': 'மேலும் அறிக',
    'home.watchLive': 'நேரடி பார்க்க',
    'home.ourMission': 'எங்கள் நோக்கம்',
    'home.ourVision': 'எங்கள் பார்வை',
    'home.ourValues': 'எங்கள் மதிப்புகள்',
    
    // Services
    'services.wedding': 'திருமணம்',
    'services.baptism': 'ஞானஸ்நானம்',
    'services.request': 'சேவை கோரிக்கை',
    'services.title': 'எங்கள் சேவைகள்',
    'services.description': 'எங்கள் சமூகத்திற்கு சேவை செய்ய பல்வேறு சேவைகளை வழங்குகிறோம்',
    'services.schedule': 'சேவை அட்டவணை',
    'services.sunday': 'ஞாயிறு சேவை',
    'services.prayer': 'ஜெப கூட்டம்',
    'services.bible': 'பைபிள் படிப்பு',
    
    // Events
    'events.title': 'வரவிருக்கும் நிகழ்வுகள்',
    'events.noEvents': 'வரவிருக்கும் நிகழ்வுகள் இல்லை',
    'events.viewAll': 'அனைத்து நிகழ்வுகளையும் பார்க்க',
    'events.register': 'பதிவு செய்யவும்',
    'events.details': 'நிகழ்வு விவரங்கள்',
    'events.date': 'தேதி',
    'events.time': 'நேரம்',
    'events.location': 'இடம்',
    
    // Forms
    'form.firstName': 'முதல் பெயர்',
    'form.lastName': 'கடைசி பெயர்',
    'form.email': 'மின்னஞ்சல்',
    'form.phone': 'தொலைபேசி',
    'form.message': 'செய்தி',
    'form.submit': 'சமர்ப்பிக்கவும்',
    'form.required': 'தேவையான',
    'form.optional': 'விருப்பமான',
    'form.sending': 'அனுப்புகிறது...',
    'form.sent': 'செய்தி அனுப்பப்பட்டது',
    'form.error': 'செய்தி அனுப்புவதில் பிழை',
    
    // Donations
    'donations.history': 'நன்கொடை வரலாறு',
    'donations.amount': 'தொகை',
    'donations.date': 'தேதி',
    'donations.type': 'வகை',
    'donations.status': 'நிலை',
    'donations.receipt': 'ரசீது',
    'donations.total': 'மொத்த நன்கொடை',
    'donations.donate': 'இப்போது நன்கொடை',
    'donations.oneTime': 'ஒரு முறை',
    'donations.monthly': 'மாதாந்திர',
    'donations.thank': 'உங்கள் தாராள மனதிற்கு நன்றி',
    
    // Common
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.cancel': 'ரத்து செய்',
    'common.save': 'சேமி',
    'common.edit': 'திருத்து',
    'common.delete': 'நீக்கு',
    'common.search': 'தேடு',
    'common.filter': 'வடிகட்டி',
    'common.all': 'அனைத்தும்',
    'common.yes': 'ஆம்',
    'common.no': 'இல்லை',
    'common.close': 'மூடு',
    'common.open': 'திற',
    'common.back': 'பின்',
    'common.next': 'அடுத்து',
    'common.previous': 'முந்தைய',
    'common.readMore': 'மேலும் படிக்க',
    'common.showLess': 'குறைவாக காட்டு'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ta';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'ta') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}