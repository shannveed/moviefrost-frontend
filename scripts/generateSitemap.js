const fs = require('fs');
const path = require('path');
const https = require('https');

const BACKEND_SITEMAP = 'https://moviefrost-backend.vercel.app/api/movies/sitemap.xml';

(async function() {
  console.log('🔄 Generating sitemap...');
  
  const staticUrls = [
    '',                 // /
    'about-us',
    'contact-us',
    'movies',
    'movies?page=2',
    'movies?browseBy=Hollywood%20(English)',
    'movies?browseBy=Hollywood%20(Hindi%20Dubbed)',
    'movies?browseBy=Bollywood',
    'movies?browseBy=South%20Indian%20(Hindi%20Dubbed)',
    'login',
    'register'
  ];

  try {
    // Fetch backend sitemap
    const backendXml = await new Promise((resolve, reject) => {
      https.get(BACKEND_SITEMAP, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    // Extract URLs from backend XML
    const dynamicUrls = backendXml.match(/<loc>(.*?)<\/loc>/g)
      ?.map(x => x.replace(/<\/?loc>/g, '').replace('https://moviefrost.com/', ''))
      .filter(url => url.includes('movie/')) || [];

    const allUrls = [...new Set([...staticUrls, ...dynamicUrls])];

    // Build final sitemap
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => {
  const fullUrl = url ? `https://moviefrost.com/${url}` : 'https://moviefrost.com/';
  const priority = url === '' ? '1.0' : url.includes('movie/') ? '0.8' : '0.7';
  const changefreq = url === '' ? 'daily' : url.includes('movie/') ? 'weekly' : 'weekly';
  
  return `  <url>
    <loc>${fullUrl}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    // Ensure build directory exists
    const buildDir = path.join(__dirname, '..', 'build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemapXml);
    console.log('✅ sitemap.xml generated –', allUrls.length, 'URLs');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
})();
