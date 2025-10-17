import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'jon2drzn',
    dataset: 'production'
  },
  studioHost: 'salempbc',
  deployment: {
    appId: 'wx6at23u87vyuz4mfquqti42',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
  }
})
