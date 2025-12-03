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
  fetchPriority = 'auto', // 'high' | 'low' | 'auto'
  ...props
}) => {
  const elementRef = useRef(null);

  // Determine if this is a high-priority image (LCP candidate)
  const isHighPriority = fetchPriority === 'high' || loading === 'eager';
  const alreadyCached = src && loadedImages.has(src);

  // If high-priority or already cached, treat as visible immediately.
  const [isVisible, setIsVisible] = useState(isHighPriority || !!alreadyCached);
  const [imageSrc, setImageSrc] = useState(
    (isHighPriority || alreadyCached) && src ? src : placeholder
  );
  const [isLoaded, setIsLoaded] = useState(!!alreadyCached);

  // IntersectionObserver for non-priority images only
  useEffect(() => {
    // Skip IO for LCP / eager images
    if (isHighPriority) return;

    const element = elementRef.current;
    if (!element) return;

    // If IntersectionObserver is not supported, default to visible
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
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
  }, [isHighPriority]);

  // Switch to real src when visible / high-priority / cached
  useEffect(() => {
    if (!src) return;

    if ((isVisible || isHighPriority || alreadyCached) && src !== imageSrc) {
      setImageSrc(src);
    }
  }, [src, isVisible, isHighPriority, alreadyCached, imageSrc]);

  // Build extra attributes for the <img> tag
  // Use lowercase 'fetchpriority' to avoid React 18.2 warning
  const imgExtraProps = {};
  if (fetchPriority && fetchPriority !== 'auto') {
    imgExtraProps.fetchpriority = fetchPriority;
  }

  // Determine the actual loading attribute
  const actualLoading = isHighPriority ? 'eager' : loading;

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
        loading={actualLoading}
        decoding={isHighPriority ? 'sync' : 'async'}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-60'
        }`}
        onLoad={(e) => {
          if (src && !loadedImages.has(src)) {
            loadedImages.add(src);
          }
          setIsLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={() => {
          // Keep placeholder on error, but stop the fade-in animation
          setIsLoaded(true);
        }}
        {...imgExtraProps}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
