import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title = 'MovieFrost - Watch Free Movies & Web Series Online',
  description = 'Watch movies online free in HD quality. Stream latest movies, web series without registration.',
  keywords = 'watch movies online, free movies, stream movies, HD movies',
  image = 'https://moviefrost.com/og-image.jpg',
  url = 'https://moviefrost.com',
  type = 'website',
  jsonLd = null // NEW
}) => {
  const fullTitle = title.includes('MovieFrost') ? title : `${title} | MovieFrost`;
  
  return (
    <Helmet>
      {/* Canonical URL MUST be first for Google's canonicalization */}
      <link rel="canonical" href={url} />
      
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default MetaTags;
