
import { useState, useEffect, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// This should be loaded from Supabase Edge Function or environment
const GOOGLE_PLACES_API_KEY = 'AIzaSyCeUvjBRwuDPmpD1o9KhH6Q20a1v2L-7Pw'; // This will be loaded from environment

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
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

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
        
        // Create services
        const autoService = new google.maps.places.AutocompleteService();
        const div = document.createElement('div');
        const service = new google.maps.places.PlacesService(div);
        
        setAutocompleteService(autoService);
        setPlacesService(service);
        setIsLoaded(true);
        console.log('Google Places services initialized');
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err}`);
      }
    };

    loadGoogleMaps();
  }, []);

  const searchPlaces = useCallback(async (query: string): Promise<PlaceResult[]> => {
    if (!autocompleteService || !placesService || !query.trim()) {
      console.log('Search skipped - missing service or empty query');
      return [];
    }

    console.log('Searching for:', query);

    return new Promise((resolve) => {
      const request = {
        input: query,
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'br' } // Restrict to Brazil
      };

      autocompleteService.getPlacePredictions(request, async (predictions, status) => {
        console.log('Autocomplete status:', status);
        console.log('Predictions:', predictions);

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Get details for each prediction
          const detailPromises = predictions.slice(0, 5).map(prediction => 
            new Promise<PlaceResult | null>((detailResolve) => {
              placesService.getDetails({
                placeId: prediction.place_id,
                fields: ['place_id', 'formatted_address', 'name', 'geometry']
              }, (place, detailStatus) => {
                if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                  detailResolve({
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
                  console.error('Place details error:', detailStatus);
                  detailResolve(null);
                }
              });
            })
          );

          const results = await Promise.all(detailPromises);
          const validResults = results.filter(result => result !== null) as PlaceResult[];
          console.log('Valid results:', validResults);
          resolve(validResults);
        } else {
          console.error('Autocomplete error:', status);
          resolve([]);
        }
      });
    });
  }, [autocompleteService, placesService]);

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
