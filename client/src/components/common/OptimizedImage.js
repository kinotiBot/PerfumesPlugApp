import React, { useState, useCallback, useEffect } from 'react';
import { Skeleton, Box } from '@mui/material';
import { getImageUrlWithFallback } from '../../utils/api';
import { preloadImage } from '../../utils/imagePreloader';
import { getImageLoadingStrategy, measureImageLoadTime } from '../../utils/deviceDetection';
import { logImageLoad, logImageError } from '../../utils/imageDebug';

const OptimizedImage = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  height = 200,
  width = '100%',
  objectFit = 'contain',
  showSkeleton = true,
  onClick,
  sx = {},
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getImageUrlWithFallback(src, fallbackSrc));
  const [preloaded, setPreloaded] = useState(false);
  const [loadStartTime] = useState(() => performance.now());
  
  const loadingStrategy = getImageLoadingStrategy();

  // Preload image based on device capabilities
  useEffect(() => {
    if (src && !preloaded && loadingStrategy.preload) {
      const imageUrl = getImageUrlWithFallback(src, fallbackSrc);
      preloadImage(imageUrl, 'high')
        .then(() => {
          setPreloaded(true);
          setLoading(false);
          measureImageLoadTime(loadStartTime);
        })
        .catch(() => {
          // If preload fails, let the img element handle it
          setPreloaded(true);
        });
    } else if (!loadingStrategy.preload) {
      setPreloaded(true);
    }
  }, [src, fallbackSrc, preloaded, loadingStrategy.preload, loadStartTime]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    const loadTime = measureImageLoadTime(loadStartTime);
    logImageLoad(currentSrc, true, loadTime);
  }, [loadStartTime, currentSrc]);

  const handleError = useCallback((event) => {
    setLoading(false);
    const loadTime = measureImageLoadTime(loadStartTime);
    const errorObj = new Error(`Image failed to load: ${currentSrc}`);
    logImageError(currentSrc, errorObj, error ? 1 : 0, loadTime);
    
    if (!error && currentSrc !== fallbackSrc) {
      setError(true);
      setCurrentSrc(fallbackSrc);
    }
  }, [error, currentSrc, fallbackSrc, loadStartTime]);

  const handleRetry = useCallback(() => {
    if (src && src !== fallbackSrc) {
      setLoading(true);
      setError(false);
      // Add timestamp to bypass cache
      const retryUrl = getImageUrlWithFallback(src, fallbackSrc);
      setCurrentSrc(`${retryUrl}&retry=${Date.now()}`);
    }
  }, [src, fallbackSrc]);

  return (
    <Box sx={{ position: 'relative', width, height, ...sx }}>
      {loading && showSkeleton && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading={loadingStrategy.lazy ? 'lazy' : 'eager'}
        style={{
          height,
          width,
          objectFit,
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.3s ease',
          cursor: onClick ? 'pointer' : 'default',
          // Mobile-specific optimizations
          imageRendering: loadingStrategy.quality === 'low' ? 'pixelated' : 'auto',
          WebkitImageSmoothing: true,
          // Improve rendering performance on mobile
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          ...sx,
        }}
        {...props}
      />
      
      {error && currentSrc === fallbackSrc && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.8rem',
            cursor: 'pointer',
            zIndex: 2,
          }}
          onClick={handleRetry}
        >
          Tap to retry
        </Box>
      )}
    </Box>
  );
};

export default OptimizedImage;