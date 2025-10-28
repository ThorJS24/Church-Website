import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'jon2drzn',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
});