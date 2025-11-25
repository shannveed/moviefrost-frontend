// Frontend/src/Components/OptimizedImage.js
import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Remember which image URLs were already loaded in this session.
// Once an image URL is loaded, we never show the placeholder for it again.
const loadedImages = new Set();

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  placeholder = '/images/placeholder.jpg',
  onLoad,
  ...props
}) => {
  const [imageRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // If we've already loaded this src before, start directly with it.
  const [imageSrc, setImageSrc] = useState(
    src && loadedImages.has(src) ? src : placeholder
  );
  const [isLoaded, setIsLoaded] = useState(
    !!src && loadedImages.has(src)
  );

  useEffect(() => {
    if (!src) return;

    // Already known as loaded → sync state & skip placeholder.
    if (loadedImages.has(src)) {
      setImageSrc(src);
      setIsLoaded(true);
      if (onLoad) onLoad();
      return;
    }

    // Otherwise, lazy‑load when visible.
    if (!isVisible) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      loadedImages.add(src);
      setImageSrc(src);
      setIsLoaded(true);
      if (onLoad) onLoad();
    };
  }, [isVisible, src, onLoad]);

  return (
    <div
      ref={imageRef}
      className={className}
      style={
        width && height
          ? { aspectRatio: `${width}/${height}`, overflow: 'hidden' }
          : { overflow: 'hidden' }
      }
    >
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
