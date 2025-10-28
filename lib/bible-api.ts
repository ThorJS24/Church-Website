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
  // Return fallback verse if no API key
  if (!BIBLE_API_KEY) {
    return {
      id: 'fallback',
      orgId: 'fallback',
      bookId: 'PRO',
      chapterIds: ['3'],
      reference: 'Proverbs 3:5',
      content: 'Trust in the Lord with all your heart, And lean not on your own understanding.',
      copyright: 'NKJV'
    };
  }

  try {
    // Popular blessing verses
    const blessingVerses = [
      'PRO.3.5', // Proverbs 3:5
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
    // Return fallback verse on error
    return {
      id: 'fallback',
      orgId: 'fallback', 
      bookId: 'PRO',
      chapterIds: ['3'],
      reference: 'Proverbs 3:5',
      content: 'Trust in the Lord with all your heart, And lean not on your own understanding.',
      copyright: 'NKJV'
    };
  }
}

export async function searchVerses(query: string): Promise<BibleVerse[]> {
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
    return [];
  }
}