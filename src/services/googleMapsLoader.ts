/**
 * Google Maps JavaScript API Loader
 * Dynamically loads the Google Maps API with Places library
 */

let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = (): Promise<void> => {
  // Already loaded
  if (isLoaded && typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve();
  }

  // Currently loading
  if (isLoading) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded && (window as any).google?.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }

  // Get API key from environment
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    console.warn('[Google Maps] API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in .env.local');
    return Promise.reject(new Error('Google Maps API key not configured'));
  }

  isLoading = true;

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=Function.prototype`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isLoaded = true;
        isLoading = false;
        console.log('[Google Maps] API loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        isLoading = false;
        console.error('[Google Maps] Failed to load API:', error);
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && typeof window !== 'undefined' && !!(window as any).google?.maps;
};

// Made with Bob
