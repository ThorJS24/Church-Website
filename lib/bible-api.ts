const BIBLE_API_KEY = process.env.NEXT_PUBLIC_BIBLE_API_KEY || process.env.BIBLE_API_KEY;
const BIBLE_ID = '61fd76eafa1577b2-01'; // New King James Version

export interface BibleVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterIds: string[];
  reference: string;
  content: string;
  copyright: string;
}

export async function getRandomVerse(): Promise<BibleVerse | null> {
  // Return random blessing verse if no API key
  if (!BIBLE_API_KEY) {
    const blessingVerses = [
      {
        id: 'num-6-24',
        orgId: 'fallback',
        bookId: 'NUM',
        chapterIds: ['6'],
        reference: 'Numbers 6:24-26',
        content: 'The Lord bless you and keep you; The Lord make His face shine upon you, And be gracious to you; The Lord lift up His countenance upon you, And give you peace.',
        copyright: 'NKJV'
      },
      {
        id: 'jer-29-11',
        orgId: 'fallback',
        bookId: 'JER',
        chapterIds: ['29'],
        reference: 'Jeremiah 29:11',
        content: 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.',
        copyright: 'NKJV'
      },
      {
        id: 'rom-15-13',
        orgId: 'fallback',
        bookId: 'ROM',
        chapterIds: ['15'],
        reference: 'Romans 15:13',
        content: 'Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope by the power of the Holy Spirit.',
        copyright: 'NKJV'
      },
      {
        id: 'eph-3-20',
        orgId: 'fallback',
        bookId: 'EPH',
        chapterIds: ['3'],
        reference: 'Ephesians 3:20-21',
        content: 'Now to Him who is able to do exceedingly abundantly above all that we ask or think, according to the power that works in us, to Him be glory in the church by Christ Jesus to all generations, forever and ever. Amen.',
        copyright: 'NKJV'
      },
      {
        id: 'isa-40-31',
        orgId: 'fallback',
        bookId: 'ISA',
        chapterIds: ['40'],
        reference: 'Isaiah 40:31',
        content: 'But those who wait on the Lord Shall renew their strength; They shall mount up with wings like eagles, They shall run and not be weary, They shall walk and not faint.',
        copyright: 'NKJV'
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * blessingVerses.length);
    return blessingVerses[randomIndex];
  }

  try {
    // Popular blessing verses (excluding Proverbs 3:5)
    const blessingVerses = [
      'NUM.6.24-NUM.6.26', // Numbers 6:24-26 (Priestly Blessing)
      'JER.29.11', // Jeremiah 29:11
      'ROM.15.13', // Romans 15:13
      'EPH.3.20-EPH.3.21', // Ephesians 3:20-21
      'PHP.4.19', // Philippians 4:19
      'PSA.23.1', // Psalm 23:1
      'PSA.121.1-PSA.121.2', // Psalm 121:1-2
      'ISA.40.31', // Isaiah 40:31
      'JHN.3.16', // John 3:16
      'ROM.8.28' // Romans 8:28
    ];

    const randomIndex = Math.floor(Math.random() * blessingVerses.length);
    const verseId = blessingVerses[randomIndex];

    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/passages/${verseId}?content-type=text&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      {
        headers: {
          'api-key': BIBLE_API_KEY!
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch verse');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    // Return random blessing verse on error
    const blessingVerses = [
      {
        id: 'num-6-24',
        orgId: 'fallback',
        bookId: 'NUM',
        chapterIds: ['6'],
        reference: 'Numbers 6:24-26',
        content: 'The Lord bless you and keep you; The Lord make His face shine upon you, And be gracious to you; The Lord lift up His countenance upon you, And give you peace.',
        copyright: 'NKJV'
      },
      {
        id: 'jer-29-11',
        orgId: 'fallback',
        bookId: 'JER',
        chapterIds: ['29'],
        reference: 'Jeremiah 29:11',
        content: 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.',
        copyright: 'NKJV'
      },
      {
        id: 'rom-15-13',
        orgId: 'fallback',
        bookId: 'ROM',
        chapterIds: ['15'],
        reference: 'Romans 15:13',
        content: 'Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope by the power of the Holy Spirit.',
        copyright: 'NKJV'
      }
    ];
    
    const randomIndex = Math.floor(Math.random() * blessingVerses.length);
    return blessingVerses[randomIndex];
  }
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