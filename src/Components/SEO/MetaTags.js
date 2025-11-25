// Frontend/src/Components/SEO/MetaTags.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({
  title = 'MovieFrost - Watch Free Movies & Web Series Online',
  description = 'Watch movies online free in HD quality. Stream latest movies and web series without registration.',
  keywords = 'watch movies online, free movies, stream movies, HD movies, web series, MovieFrost',
  image = 'https://www.moviefrost.com/og-image.jpg',
  url,
  type = 'website',
  noindex = false,           // NEW: allow pages to opt-out of indexing
}) => {
  const siteName = 'MovieFrost';
  const baseUrl = 'https://www.moviefrost.com';
  const canonical = url || baseUrl;
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const ogImage = image || `${baseUrl}/og-image.jpg`;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      {/* Canonical & title */}
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonical} />

      {/* Indexing control */}
      <meta name="robots" content={robotsContent} />

      {/* Basic meta */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default MetaTags;
