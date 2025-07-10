
import { useState, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// This should be loaded from Supabase Edge Function or environment
const GOOGLE_PLACES_API_KEY = 'AIzaSyCeUvjBRwuDPmpD1o9KhH6Q20a1v2L-7Pw';

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface UseGooglePlacesReturn {
  isLoaded: boolean;
  searchPlaces: (query: string) => Promise<PlaceResult[]>;
  getPlaceDetails: (placeId: string) => Promise<PlaceResult | null>;
  getCurrentLocation: () => Promise<PlaceResult | null>;
  error: string | null;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        console.log('Loading Google Maps with API key...');
        const loader = new Loader({
          apiKey: GOOGLE_PLACES_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();
        console.log('Google Maps loaded successfully');
        
        // Create geocoder service
        const geocoderService = new google.maps.Geocoder();
        setGeocoder(geocoderService);
        setIsLoaded(true);
        console.log('Google Geocoder service initialized');
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err}`);
      }
    };

    loadGoogleMaps();
  }, []);

  const searchPlaces = useCallback(async (query: string): Promise<PlaceResult[]> => {
    if (!geocoder || !query.trim()) {
      console.log('Search skipped - missing geocoder or empty query');
      return [];
    }

    console.log('Searching for:', query);

    return new Promise((resolve) => {
      const request: google.maps.GeocoderRequest = {
        address: query,
        componentRestrictions: { country: 'BR' }, // Restrict to Brazil
        region: 'BR'
      };

      geocoder.geocode(request, (results, status) => {
        console.log('Geocoding status:', status);
        console.log('Geocoding results:', results);

        if (status === google.maps.GeocoderStatus.OK && results) {
          const placeResults: PlaceResult[] = results.slice(0, 5).map((result, index) => ({
            place_id: result.place_id || `geocoded_${index}`,
            formatted_address: result.formatted_address,
            name: result.address_components[0]?.long_name || result.formatted_address,
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
            }
          }));
          
          console.log('Formatted results:', placeResults);
          resolve(placeResults);
        } else {
          console.error('Geocoding error:', status);
          resolve([]);
        }
      });
    });
  }, [geocoder]);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceResult | null> => {
    if (!geocoder) return null;

    return new Promise((resolve) => {
      const request: google.maps.GeocoderRequest = {
        placeId: placeId
      };

      geocoder.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          resolve({
            place_id: result.place_id || placeId,
            formatted_address: result.formatted_address,
            name: result.address_components[0]?.long_name || result.formatted_address,
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
            }
          });
        } else {
          console.error('Place details error:', status);
          resolve(null);
        }
      });
    });
  }, [geocoder]);

  const getCurrentLocation = useCallback(async (): Promise<PlaceResult | null> => {
    if (!geocoder) {
      console.log('Geocoder not available');
      return null;
    }

    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              const result = results[0];
              resolve({
                place_id: result.place_id || 'current_location',
                formatted_address: result.formatted_address,
                name: 'Localização Atual',
                geometry: {
                  location: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  }
                }
              });
            } else {
              resolve({
                place_id: 'current_location',
                formatted_address: `${position.coords.latitude}, ${position.coords.longitude}`,
                name: 'Localização Atual',
                geometry: {
                  location: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  }
                }
              });
            }
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, [geocoder]);

  return {
    isLoaded,
    searchPlaces,
    getPlaceDetails,
    getCurrentLocation,
    error
  };
};
