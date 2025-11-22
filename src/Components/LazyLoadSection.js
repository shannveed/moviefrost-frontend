// src/Components/LazyLoadSection.js
import React, { useState, useEffect, useRef } from 'react';

const LazyLoadSection = ({ children, height = '300px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Start loading when the section is 100px away from entering the viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      {
        rootMargin: '100px', // Pre-load slightly before it comes into view
        threshold: 0.0,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div ref={elementRef} style={{ minHeight: isVisible ? 'auto' : height }} className="w-full">
      {isVisible ? (
        children
      ) : (
        // Skeleton / Placeholder while waiting to scroll
        <div className="w-full flex flex-col gap-4 animate-pulse my-8 px-4">
           {/* Title Skeleton */}
           <div className="h-8 w-48 bg-dry rounded bg-opacity-50"></div>
           {/* Cards Skeleton */}
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-64 bg-dry rounded bg-opacity-50 ${i > 1 ? 'hidden md:block' : ''}`}></div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default LazyLoadSection;
