const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03'
});

async function testSanityConnection() {
  try {
    console.log('🔍 Testing Sanity connection...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
    console.log('Token exists:', !!process.env.SANITY_API_TOKEN);
    
    // Test basic connection
    const servicesPage = await client.fetch('*[_type == "servicesPage"][0]');
    console.log('✅ Services page found:', !!servicesPage);
    if (servicesPage) {
      console.log('📄 Services page title:', servicesPage.title);
    }
    
    // Test services
    const services = await client.fetch('*[_type == "service"]');
    console.log('✅ Services found:', services.length);
    services.forEach(service => {
      console.log(`  - ${service.title} at ${service.time}`);
    });
    
    // Test site settings
    const siteSettings = await client.fetch('*[_type == "siteSettings"][0]');
    console.log('✅ Site settings found:', !!siteSettings);
    
    console.log('\n🎉 Sanity connection test complete!');
    
  } catch (error) {
    console.error('❌ Sanity connection error:', error);
  }
}

testSanityConnection();