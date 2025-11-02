const BIBLE_API_KEY = process.env.BIBLE_API_KEY || process.env.NEXT_PUBLIC_BIBLE_API_KEY;
const BIBLE_ID = '61fd76eafa1577b2-01'; // New King James Version
const BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1';

// Validate API key on module load
if (BIBLE_API_KEY && BIBLE_API_KEY.length < 10) {
  console.warn('Bible API key appears to be invalid');
}

export interface BibleVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterIds: string[];
  reference: string;
  content: string;
  copyright: string;
}

import { getRandomFallbackVerse } from './bible-fallback';

const verseTranslations = {
  'jer-29-11': {
    NKJV: 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.',
    NIV: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
    ESV: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
    KJV: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',
    NLT: 'For I know the plans I have for you, says the Lord. They are plans for good and not for disaster, to give you a future and a hope.',
    CJB: 'For I know what plans I have in mind for you, says Adonai, plans for shalom and not calamity, to give you a future and a hope.',
    TAMIL: 'ஏனென்றால் நான் உங்களைக்குறித்து நினைக்கிற நினைவுகளை அறிவேன்; அவைகள் தீமைக்கல்ல, சமாதானத்திற்கும், உங்களுக்கு நம்பிக்கையையும் எதிர்காலத்தையும் கொடுக்கும் நினைவுகளே என்று கர்த்தர் அருளிச்செய்கிறார்.'
  },
  'jhn-3-16': {
    NKJV: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
    NIV: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    ESV: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    KJV: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    NLT: 'For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
    CJB: 'For God so loved the world that he gave his only and unique Son, so that everyone who trusts in him may have eternal life, instead of being utterly destroyed.',
    TAMIL: 'தேவன் உலகத்தின்மேல் அன்புகூர்ந்து, தம்முடைய ஒரே புத்திரனைக் கொடுத்தார்; அவர்மேல் விசுவாசமுள்ளவன் எவனும் நாசமாகாமல் நித்தியஜீவனை அடையும்படிக்கே.'
  },
  'psa-23-1': {
    NKJV: 'The Lord is my shepherd; I shall not want.',
    NIV: 'The Lord is my shepherd, I lack nothing.',
    ESV: 'The Lord is my shepherd; I shall not want.',
    KJV: 'The Lord is my shepherd; I shall not want.',
    NLT: 'The Lord is my shepherd; I have all that I need.',
    CJB: 'Adonai is my shepherd; I lack nothing.',
    TAMIL: 'கர்த்தர் என் மேய்ப்பன்; எனக்குக் குறைவில்லை.'
  }
};

const baseVerses = [
  {
    id: 'jer-29-11',
    orgId: 'fallback',
    bookId: 'JER',
    chapterIds: ['29'],
    reference: 'Jeremiah 29:11'
  },
  {
    id: 'jhn-3-16',
    orgId: 'fallback',
    bookId: 'JHN',
    chapterIds: ['3'],
    reference: 'John 3:16'
  },
  {
    id: 'psa-23-1',
    orgId: 'fallback',
    bookId: 'PSA',
    chapterIds: ['23'],
    reference: 'Psalm 23:1'
  }
];

export async function getRandomVerse(version: string = 'NKJV'): Promise<BibleVerse | null> {
  const randomIndex = Math.floor(Math.random() * baseVerses.length);
  const baseVerse = baseVerses[randomIndex];
  const translations = verseTranslations[baseVerse.id as keyof typeof verseTranslations];
  
  return {
    ...baseVerse,
    content: translations[version as keyof typeof translations] || translations.NKJV,
    copyright: version
  };
}

export function getVerseInVersion(verseId: string, version: string): BibleVerse | null {
  const baseVerse = baseVerses.find(v => v.id === verseId);
  if (!baseVerse) return null;
  
  const translations = verseTranslations[verseId as keyof typeof verseTranslations];
  if (!translations) return null;
  
  return {
    ...baseVerse,
    content: translations[version as keyof typeof translations] || translations.NKJV,
    copyright: version
  };
}

export async function searchVerses(query: string): Promise<any[]> {
  if (!BIBLE_API_KEY) {
    return mockVerseSearch(query);
  }

  try {
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/search?query=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          'api-key': BIBLE_API_KEY!
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search verses');
    }

    const data = await response.json();
    return data.data.passages || [];
  } catch (error) {
    console.error('Error searching verses:', error);
    return mockVerseSearch(query);
  }
}

const mockVerseSearch = (query: string): any[] => {
  const mockVerses = [
    {
      reference: 'John 3:16',
      content: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.'
    },
    {
      reference: 'Psalm 23:1', 
      content: 'The Lord is my shepherd; I shall not want.'
    },
    {
      reference: 'Proverbs 3:5-6',
      content: 'Trust in the Lord with all your heart, And lean not on your own understanding; In all your ways acknowledge Him, And He shall direct your paths.'
    },
    {
      reference: 'Romans 8:28',
      content: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.'
    },
    {
      reference: 'Philippians 4:13',
      content: 'I can do all things through Christ who strengthens me.'
    }
  ];
  
  return mockVerses.filter(verse => 
    verse.reference.toLowerCase().includes(query.toLowerCase()) ||
    verse.content.toLowerCase().includes(query.toLowerCase())
  );
};