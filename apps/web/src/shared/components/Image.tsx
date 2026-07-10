import React, { useState, useEffect } from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  placeholder?: string;
  aspectRatio?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  fallback = '/images/restaurant-placeholder.jpg',
  placeholder,
  aspectRatio,
  className = '',
  style,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src || fallback);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src || fallback);
    setIsError(false);
    setIsLoading(true);
  }, [src, fallback]);

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
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        className={`w-full h-full transition-opacity duration-300 ${isLoading && placeholder ? 'opacity-0' : 'opacity-100'}`}
        style={combinedStyle}
        {...props}
      />
    </div>
  );
};
