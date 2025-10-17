import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'jon2drzn',
  dataset: 'production',
  useCdn: false, // set to `false` to bypass the edge cache
  apiVersion: '2023-05-03', // use current date (YYYY-MM-DD) to target the latest API version
  token: process.env.SANITY_STUDIO_TOKEN,
});
