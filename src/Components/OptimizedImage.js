// Frontend/src/Components/OptimizedImage.js
import React, { useState, useEffect, useRef } from 'react';

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
  fetchPriority, // 'high' | 'low' | 'auto' (optional)
  ...props
}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // If we've already loaded this src before, start directly with it.
  const alreadyCached = src && loadedImages.has(src);
  const [imageSrc, setImageSrc] = useState(alreadyCached ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(alreadyCached);

  // Custom intersection observer that stays visible once triggered
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already cached, mark as visible immediately
    if (alreadyCached) {
      setIsVisible(true);
      return;
    }

    // If IntersectionObserver is not supported, default to visible
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [alreadyCached]);

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
    img.onerror = () => {
      // Keep placeholder on error
      setIsLoaded(true);
    };
  }, [isVisible, src, onLoad]);

  // Build extra attributes for the <img> tag
  // Use lowercase 'fetchpriority' to avoid React 18.2 warning
  const imgExtraProps = {};
  if (fetchPriority) {
    imgExtraProps.fetchpriority = fetchPriority;
  }

  return (
    <div
      ref={elementRef}
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
        decoding="async"
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-60'
        }`}
        {...imgExtraProps}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
