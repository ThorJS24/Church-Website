export const sanityFetch = async (query: string) => {
  try {
    const response = await fetch(`/api/sanity-proxy?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      console.error(`Sanity fetch failed with status ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
};
