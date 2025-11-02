// Fallback Bible verses when API is not available
export const fallbackVerses = [
  {
    id: 'jhn-3-16',
    orgId: 'fallback',
    bookId: 'JHN',
    chapterIds: ['3'],
    reference: 'John 3:16',
    content: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
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
    id: 'eph-3-20-21',
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
    content: 'But those who wait on the Lord shall renew their strength; They shall mount up with wings like eagles, They shall run and not be weary, They shall walk and not faint.',
    copyright: 'NKJV'
  },
  {
    id: 'psa-23-1',
    orgId: 'fallback',
    bookId: 'PSA',
    chapterIds: ['23'],
    reference: 'Psalm 23:1',
    content: 'The Lord is my shepherd; I shall not want.',
    copyright: 'NKJV'
  },
  {
    id: 'php-4-13',
    orgId: 'fallback',
    bookId: 'PHP',
    chapterIds: ['4'],
    reference: 'Philippians 4:13',
    content: 'I can do all things through Christ who strengthens me.',
    copyright: 'NKJV'
  },
  {
    id: 'rom-8-28',
    orgId: 'fallback',
    bookId: 'ROM',
    chapterIds: ['8'],
    reference: 'Romans 8:28',
    content: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
    copyright: 'NKJV'
  },
  {
    id: 'num-6-24-26',
    orgId: 'fallback',
    bookId: 'NUM',
    chapterIds: ['6'],
    reference: 'Numbers 6:24-26',
    content: 'The Lord bless you and keep you; The Lord make His face shine upon you, And be gracious to you; The Lord lift up His countenance upon you, And give you peace.',
    copyright: 'NKJV'
  },
  {
    id: 'pro-3-5-6',
    orgId: 'fallback',
    bookId: 'PRO',
    chapterIds: ['3'],
    reference: 'Proverbs 3:5-6',
    content: 'Trust in the Lord with all your heart, And lean not on your own understanding; In all your ways acknowledge Him, And He shall direct your paths.',
    copyright: 'NKJV'
  }
];

export function getRandomFallbackVerse() {
  const randomIndex = Math.floor(Math.random() * fallbackVerses.length);
  return fallbackVerses[randomIndex];
}