import React, { useState, useEffect, useRef } from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  placeholder?: string;
  aspectRatio?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  srcSet,
  sizes,
  alt = '',
  fallback = '/images/restaurant-placeholder.jpg',
  placeholder,
  aspectRatio,
  className = '',
  style,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      setImgSrc(src || fallback);
      setIsError(false);
      setIsLoading(true);
    }
  }, [src, fallback, isVisible]);

  const handleError = () => {
    if (!isError) {
      setImgSrc(fallback);
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const combinedStyle: React.CSSProperties = {
    objectFit: 'cover',
    aspectRatio: aspectRatio,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-200 ${className}`}
      style={{ aspectRatio, width: props.width || '100%', height: props.height || '100%' }}
    >
      {(isLoading && placeholder) ? (
        <img
          src={placeholder}
          alt={`Placeholder for ${alt}`}
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      ) : null}
      {isVisible && (
        <img
          src={imgSrc}
          srcSet={isError ? undefined : srcSet}
          sizes={isError ? undefined : sizes}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={combinedStyle}
          {...props}
        />
      )}
    </div>
  );
};
