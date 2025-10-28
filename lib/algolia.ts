import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

export const searchIndex = searchClient.initIndex('church_content');

export interface SearchResult {
  objectID: string;
  title: string;
  content: string;
  type: 'sermon' | 'event' | 'ministry' | 'page';
  url: string;
  date?: string;
  speaker?: string;
}

export const searchContent = async (query: string): Promise<SearchResult[]> => {
  try {
    // Fallback to local search if Algolia isn't configured
    if (!process.env.ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY) {
      return mockSearch(query);
    }
    
    const { hits } = await searchIndex.search(query, {
      hitsPerPage: 10,
      attributesToRetrieve: ['title', 'content', 'type', 'url', 'date', 'speaker'],
      attributesToHighlight: ['title', 'content'],
    });
    
    return hits as SearchResult[];
  } catch (error) {
    console.error('Search error:', error);
    return mockSearch(query);
  }
};

// Mock search for development
const mockSearch = (query: string): SearchResult[] => {
  const mockData: SearchResult[] = [
    {
      objectID: '1',
      title: 'Sunday Morning Worship',
      content: 'Join us for our weekly Sunday morning worship service at 10:30 AM',
      type: 'event',
      url: '/events',
      date: '2024-01-07'
    },
    {
      objectID: '2', 
      title: 'The Power of Prayer',
      content: 'A sermon about the importance of prayer in our daily lives',
      type: 'sermon',
      url: '/sermons',
      date: '2024-01-01',
      speaker: 'Pastor John'
    },
    {
      objectID: '3',
      title: 'Youth Ministry',
      content: 'Engaging activities and Bible study for young people',
      type: 'ministry',
      url: '/ministries#youth'
    },
    {
      objectID: '4',
      title: 'About Our Church',
      content: 'Learn about Salem Primitive Baptist Church history and beliefs',
      type: 'page',
      url: '/about'
    }
  ];
  
  return mockData.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.content.toLowerCase().includes(query.toLowerCase())
  );
};

export const indexContent = async (content: SearchResult) => {
  // Indexing requires admin API key, skip for now
  console.log('Content indexing skipped - requires admin setup');
};