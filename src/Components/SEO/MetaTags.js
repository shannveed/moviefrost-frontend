import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title = 'MovieFrost – Watch Movies & Web-Series Free',
  description = 'Stream thousands of Hollywood, Bollywood & Web-Series in HD quality. No sign-up needed.',
  keywords = 'watch movies online free, stream movies, HD movies, web series',
  image = 'https://moviefrost.com/og-image.jpg',
  url = 'https://moviefrost.com',
  type = 'website',
  published = null,
  updated = null
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
      
      {/* Article meta tags for movies */}
      {published && <meta property="article:published_time" content={published} />}
      {updated && <meta property="article:modified_time" content={updated} />}
    </Helmet>
  );
};

export default MetaTags;
