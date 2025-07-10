
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
        
        // Create geocoder service
        const geocoderService = new google.maps.Geocoder();
        setGeocoder(geocoderService);
        
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
        console.log('Google Geocoder service initialized');
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(`Failed to load Google Maps: ${err}`);
      }
    };

    loadGoogleMaps();
  }, []);

  const extractPlaceName = (result: google.maps.GeocoderResult): string => {
    // Priority order for place names
    const addressComponents = result.address_components;
    
    // First, try to find establishment name
    const establishment = addressComponents.find(component => 
      component.types.includes('establishment')
    );
    if (establishment) {
      console.log('Found establishment name:', establishment.long_name);
      return establishment.long_name;
    }

    // Then try point of interest
    const pointOfInterest = addressComponents.find(component => 
      component.types.includes('point_of_interest')
    );
    if (pointOfInterest) {
      console.log('Found point of interest name:', pointOfInterest.long_name);
      return pointOfInterest.long_name;
    }

    // Then try premise (building name)
    const premise = addressComponents.find(component => 
      component.types.includes('premise')
    );
    if (premise) {
      console.log('Found premise name:', premise.long_name);
      return premise.long_name;
    }

    // Then try route (street name) + street number combination
    const route = addressComponents.find(component => 
      component.types.includes('route')
    );
    const streetNumber = addressComponents.find(component => 
      component.types.includes('street_number')
    );
    
    if (route && streetNumber) {
      const streetAddress = `${route.long_name}, ${streetNumber.long_name}`;
      console.log('Using street address:', streetAddress);
      return streetAddress;
    }

    // Fallback to the first significant component (not country, postal_code, etc.)
    const significantComponent = addressComponents.find(component => 
      !component.types.includes('country') &&
      !component.types.includes('postal_code') &&
      !component.types.includes('administrative_area_level_1') &&
      !component.types.includes('administrative_area_level_2')
    );
    
    if (significantComponent) {
      console.log('Using significant component:', significantComponent.long_name);
      return significantComponent.long_name;
    }

    // Final fallback to formatted address
    console.log('Using formatted address as fallback');
    return result.formatted_address.split(',')[0];
  };

  const searchPlaces = useCallback(async (query: string): Promise<PlaceResult[]> => {
    if (!geocoder || !query.trim()) {
      console.log('Search skipped - missing geocoder or empty query');
      return [];
    }

    console.log('Searching for:', query);
    console.log('User location for bias:', userLocation);

    return new Promise((resolve) => {
      const request: google.maps.GeocoderRequest = {
        address: query,
        componentRestrictions: { country: 'BR' }, // Restrict to Brazil
        region: 'BR'
      };

      // Add location bias if user location is available
      if (userLocation) {
        request.location = new google.maps.LatLng(userLocation.lat, userLocation.lng);
        request.radius = 50000; // 50km radius for proximity bias
      }

      geocoder.geocode(request, (results, status) => {
        console.log('Geocoding status:', status);
        console.log('Geocoding results:', results);

        if (status === google.maps.GeocoderStatus.OK && results) {
          let placeResults: PlaceResult[] = results.slice(0, 5).map((result, index) => ({
            place_id: result.place_id || `geocoded_${index}`,
            formatted_address: result.formatted_address,
            name: extractPlaceName(result),
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
            }
          }));
          
          // Sort by distance if user location is available
          if (userLocation) {
            placeResults.sort((a, b) => {
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
          
          console.log('Formatted results:', placeResults);
          resolve(placeResults);
        } else {
          console.error('Geocoding error:', status);
          resolve([]);
        }
      });
    });
  }, [geocoder, userLocation]);

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
            name: extractPlaceName(result),
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

          // Update user location for future searches
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });

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
