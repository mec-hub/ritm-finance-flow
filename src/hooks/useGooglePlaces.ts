
import { useState, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// This should be loaded from Supabase Edge Function or environment
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'; // This will be loaded from environment

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
  error: string | null;
}

export const useGooglePlaces = (): UseGooglePlacesReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_PLACES_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();
        
        // Create a dummy div for PlacesService (required by Google Maps API)
        const div = document.createElement('div');
        const service = new google.maps.places.PlacesService(div);
        setPlacesService(service);
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  const searchPlaces = useCallback(async (query: string): Promise<PlaceResult[]> => {
    if (!placesService || !query.trim()) return [];

    return new Promise((resolve) => {
      const request: google.maps.places.TextSearchRequest = {
        query,
        fields: ['place_id', 'formatted_address', 'name', 'geometry']
      };

      placesService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedResults = results.map(place => ({
            place_id: place.place_id!,
            formatted_address: place.formatted_address!,
            name: place.name!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng()
              }
            }
          }));
          resolve(formattedResults);
        } else {
          resolve([]);
        }
      });
    });
  }, [placesService]);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceResult | null> => {
    if (!placesService) return null;

    return new Promise((resolve) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['place_id', 'formatted_address', 'name', 'geometry']
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve({
            place_id: place.place_id!,
            formatted_address: place.formatted_address!,
            name: place.name!,
            geometry: {
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng()
              }
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  }, [placesService]);

  return {
    isLoaded,
    searchPlaces,
    getPlaceDetails,
    error
  };
};
