import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title = 'MovieFrost - Watch Free Movies & Web Series Online',
  description = 'Watch movies online free in HD quality. Stream the latest movies and web series without registration.',
  keywords = 'watch movies online, free movies, stream movies, HD movies, moviefrost',
  image = 'https://www.moviefrost.com/og-image.jpg',
  url = 'https://www.moviefrost.com', // Default to home page
  type = 'website'
}) => {
  // SEO Improvement: Ensure the brand name is consistently in the title
  const fullTitle = title.includes('MovieFrost') ? title : `${title} | MovieFrost`;
  
  // SEO Improvement: Ensure URL is absolute and uses www
  const canonicalUrl = url.startsWith('http') ? url : `https://www.moviefrost.com${url}`;

  return (
    <Helmet>
      {/* SEO Improvement: Set the primary title for the page */}
      <title>{fullTitle}</title>
      
      {/* SEO Improvement: Set the canonical URL to avoid duplicate content */}
      <link rel="canonical" href={canonicalUrl} />
      
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph (for social sharing on Facebook, etc.) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MovieFrost" />
      
      {/* Twitter Card (for social sharing on Twitter) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={canonicalUrl} />
    </Helmet>
  );
};

export default MetaTags;
