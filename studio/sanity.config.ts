import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Church Website',

  projectId: 'jon2drzn',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },

  cors: {
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://church-website-nextjs.vercel.app',
      'https://*.vercel.app'
    ]
  },

  api: {
    projectId: 'jon2drzn',
    dataset: 'production'
  }
})
