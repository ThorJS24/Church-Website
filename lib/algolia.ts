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
    const { hits } = await searchIndex.search(query, {
      hitsPerPage: 10,
      attributesToRetrieve: ['title', 'content', 'type', 'url', 'date', 'speaker'],
      attributesToHighlight: ['title', 'content'],
    });
    
    return hits as SearchResult[];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const indexContent = async (content: SearchResult) => {
  // Indexing requires admin API key, skip for now
  console.log('Content indexing skipped - requires admin setup');
};