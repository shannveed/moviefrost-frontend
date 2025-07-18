import React, { useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

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
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        if (onLoad) onLoad();
      };
    }
  }, [isVisible, src, onLoad]);

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'blur-sm' : ''} transition-all duration-300`}
      width={width}
      height={height}
      loading={loading}
      {...props}
    />
  );
};

export default OptimizedImage;
