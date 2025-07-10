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
  types?: string[];
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
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
        
        // Create a dummy map element for PlacesService (required by Google API)
        const mapDiv = document.createElement('div');
        const map = new google.maps.Map(mapDiv);
        
        // Initialize services
        const placesServiceInstance = new google.maps.places.PlacesService(map);
        const autocompleteServiceInstance = new google.maps.places.AutocompleteService();
        
        setPlacesService(placesServiceInstance);
        setAutocompleteService(autocompleteServiceInstance);
        
        // Try to get user's location for proximity bias
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(userPos);
              console.log('User location obtained for proximity bias:', userPos);
            },
            (error) => {
              console.log('Could not get user location for proximity bias:', error);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
          );
        }
        
        setIsLoaded(true);
        console.log('Google Places services initialized');
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err}`);
      }
    };

    loadGoogleMaps();
  }, []);

  // Helper function to check if a place is an establishment
  const isEstablishment = (types: string[]): boolean => {
    const establishmentTypes = ['establishment', 'point_of_interest', 'premise'];
    const genericTypes = ['route', 'neighborhood', 'locality', 'political'];
    
    // Check if it has establishment types
    const hasEstablishmentType = types.some(type => establishmentTypes.includes(type));
    
    // Check if it's only generic types
    const isOnlyGeneric = types.every(type => genericTypes.includes(type) || type === 'geocode');
    
    return hasEstablishmentType && !isOnlyGeneric;
  };

  const searchPlaces = useCallback(async (query: string): Promise<PlaceResult[]> => {
    if (!autocompleteService || !placesService || !query.trim()) {
      console.log('Search skipped - missing services or empty query');
      return [];
    }

    console.log('Searching for places:', query);
    console.log('User location for bias:', userLocation);

    return new Promise((resolve) => {
      const request: google.maps.places.AutocompleteRequest = {
        input: query,
      };

      // Add location bias if user location is available
      if (userLocation) {
        const center = new google.maps.LatLng(userLocation.lat, userLocation.lng);
        const circle = new google.maps.Circle({
          center: center,
          radius: 5000 // 5km radius
        });
        request.bounds = circle.getBounds();
        request.location = center;
        request.radius = 5000;
      }

      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        console.log('Autocomplete status:', status);
        console.log('Autocomplete predictions:', predictions);

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          // Get detailed information for each prediction
          const detailPromises = predictions.slice(0, 5).map((prediction) => {
            return new Promise<PlaceResult | null>((detailResolve) => {
              const detailRequest: google.maps.places.PlaceDetailsRequest = {
                placeId: prediction.place_id,
                fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
              };

              placesService.getDetails(detailRequest, (place, detailStatus) => {
                if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                  const types = place.types || [];
                  
                  // Filter out non-establishment places
                  if (!isEstablishment(types)) {
                    console.log('Filtered out non-establishment:', place.name, types);
                    detailResolve(null);
                    return;
                  }

                  detailResolve({
                    place_id: place.place_id || prediction.place_id,
                    formatted_address: place.formatted_address || prediction.description,
                    name: place.name || prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
                    geometry: {
                      location: {
                        lat: place.geometry?.location?.lat() || 0,
                        lng: place.geometry?.location?.lng() || 0
                      }
                    },
                    types: types
                  });
                } else {
                  console.error('Place details error:', detailStatus);
                  detailResolve(null);
                }
              });
            });
          });

          Promise.all(detailPromises).then((results) => {
            const validResults = results.filter((result): result is PlaceResult => result !== null);
            
            // Sort by distance if user location is available
            if (userLocation && validResults.length > 0) {
              validResults.sort((a, b) => {
                const distanceA = google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(userLocation.lat, userLocation.lng),
                  new google.maps.LatLng(a.geometry.location.lat, a.geometry.location.lng)
                );
                const distanceB = google.maps.geometry.spherical.computeDistanceBetween(
                  new google.maps.LatLng(userLocation.lat, userLocation.lng),
                  new google.maps.LatLng(b.geometry.location.lat, b.geometry.location.lng)
                );
                return distanceA - distanceB;
              });
              console.log('Results sorted by distance from user location');
            }
            
            console.log('Final filtered place results:', validResults);
            resolve(validResults);
          });
        } else {
          console.error('Autocomplete error:', status);
          resolve([]);
        }
      });
    });
  }, [autocompleteService, placesService, userLocation]);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<PlaceResult | null> => {
    if (!placesService) return null;

    return new Promise((resolve) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: placeId,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types']
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const types = place.types || [];
          
          // Get the proper place name based on type
          let placeName = place.name || 'Local sem nome';
          
          // If it's not an establishment, use formatted address instead
          if (!isEstablishment(types)) {
            placeName = place.formatted_address?.split(',')[0] || placeName;
          }
          
          resolve({
            place_id: place.place_id || placeId,
            formatted_address: place.formatted_address || '',
            name: placeName,
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            },
            types: types
          });
        } else {
          console.error('Place details error:', status);
          resolve(null);
        }
      });
    });
  }, [placesService]);

  const getCurrentLocation = useCallback(async (): Promise<PlaceResult | null> => {
    if (!placesService) {
      console.log('Places service not available');
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

          // Update user location for future searches
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

          // Use Geocoding to get address for current location
          const geocoder = new google.maps.Geocoder();
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
  }, [placesService]);

  return {
    isLoaded,
    searchPlaces,
    getPlaceDetails,
    getCurrentLocation,
    error
  };
};
