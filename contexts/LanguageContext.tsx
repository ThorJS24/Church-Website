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
    
    // Home Page
    'home.welcome': 'Welcome to Salem Primitive Baptist Church',
    'home.subtitle': 'A place of faith, hope, and love',
    'home.liveStream': 'Live Stream',
    'home.upcomingEvents': 'Upcoming Events',
    'home.latestSermons': 'Latest Sermons',
    
    // Services
    'services.wedding': 'Wedding',
    'services.baptism': 'Baptism',
    'services.request': 'Request Service',
    'services.title': 'Our Services',
    
    // Forms
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.message': 'Message',
    'form.submit': 'Submit',
    'form.required': 'Required',
    
    // Donations
    'donations.history': 'Donation History',
    'donations.amount': 'Amount',
    'donations.date': 'Date',
    'donations.type': 'Type',
    'donations.status': 'Status',
    'donations.receipt': 'Receipt',
    'donations.total': 'Total Donated',
    
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
    'common.no': 'No'
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
    
    // Home Page
    'home.welcome': 'சேலம் பிரிமிட்டிவ் பாப்டிஸ்ட் தேவாலயத்திற்கு வரவேற்கிறோம்',
    'home.subtitle': 'நம்பிக்கை, நம்பிக்கை மற்றும் அன்பின் இடம்',
    'home.liveStream': 'நேரடி ஒளிபரப்பு',
    'home.upcomingEvents': 'வரவிருக்கும் நிகழ்வுகள்',
    'home.latestSermons': 'சமீபத்திய பிரசங்கங்கள்',
    
    // Services
    'services.wedding': 'திருமணம்',
    'services.baptism': 'ஞானஸ்நானம்',
    'services.request': 'சேவை கோரிக்கை',
    'services.title': 'எங்கள் சேவைகள்',
    
    // Forms
    'form.firstName': 'முதல் பெயர்',
    'form.lastName': 'கடைசி பெயர்',
    'form.email': 'மின்னஞ்சல்',
    'form.phone': 'தொலைபேசி',
    'form.message': 'செய்தி',
    'form.submit': 'சமர்ப்பிக்கவும்',
    'form.required': 'தேவையான',
    
    // Donations
    'donations.history': 'நன்கொடை வரலாறு',
    'donations.amount': 'தொகை',
    'donations.date': 'தேதி',
    'donations.type': 'வகை',
    'donations.status': 'நிலை',
    'donations.receipt': 'ரசீது',
    'donations.total': 'மொத்த நன்கொடை',
    
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
    'common.no': 'இல்லை'
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