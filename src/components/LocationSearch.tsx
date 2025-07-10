
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X, Loader2, MapPinIcon, Navigation } from 'lucide-react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { cn } from '@/lib/utils';

interface LocationData {
  place_id: string;
  formatted_address: string;
  place_name: string;
  latitude: number;
  longitude: number;
}

interface LocationSearchProps {
  value?: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSearch = ({ 
  value, 
  onChange, 
  placeholder = "Pesquisar localização...",
  className 
}: LocationSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [proximityMode, setProximityMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { isLoaded, searchPlaces, getCurrentLocation, error } = useGooglePlaces();

  console.log('LocationSearch - isLoaded:', isLoaded, 'error:', error);

  useEffect(() => {
    if (value) {
      setQuery(value.place_name || value.formatted_address);
    }
  }, [value]);

  useEffect(() => {
    // Check if user has granted location permission for proximity search
    if (navigator.geolocation) {
      navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
        setProximityMode(result.state === 'granted');
      });
    }
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 2 && isLoaded) {
        console.log('LocationSearch - Starting search for:', query);
        setIsLoading(true);
        try {
          const results = await searchPlaces(query);
          console.log('LocationSearch - Search results:', results);
          setSuggestions(results);
          setIsOpen(results.length > 0);
        } catch (err) {
          console.error('LocationSearch - Error searching places:', err);
          setSuggestions([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('LocationSearch - Search skipped - query too short or not loaded');
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [query, isLoaded, searchPlaces]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = (place: any) => {
    console.log('LocationSearch - Selected place:', place);
    const locationData: LocationData = {
      place_id: place.place_id,
      formatted_address: place.formatted_address,
      place_name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng
    };
    
    onChange(locationData);
    setQuery(place.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const currentLocation = await getCurrentLocation();
      if (currentLocation) {
        handleSelectPlace(currentLocation);
        setProximityMode(true); // Enable proximity mode after getting location
      } else {
        console.error('Could not get current location');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (error) {
    return (
      <div className="text-destructive text-sm p-3 border border-destructive/20 rounded-md bg-destructive/5">
        <strong>Erro:</strong> {error}
        <div className="text-xs mt-1">
          Verifique se a API key do Google Places está configurada corretamente.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-2 p-3 border border-border rounded-md bg-muted/20">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando serviço de localização...</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              console.log('LocationSearch - Input changed:', e.target.value);
              setQuery(e.target.value);
            }}
            placeholder={proximityMode ? `${placeholder} (busca próxima)` : placeholder}
            className="pl-10 pr-10"
          />
          {proximityMode && (
            <Navigation className="absolute right-8 top-1/2 transform -translate-y-1/2 h-3 w-3 text-primary" />
          )}
          {isLoading && (
            <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation || !isLoaded}
          className="flex items-center gap-1 px-3"
        >
          {isGettingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPinIcon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Atual</span>
        </Button>
      </div>

      {proximityMode && (
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          Resultados priorizados por proximidade
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((place) => (
            <button
              key={place.place_id}
              type="button"
              className="w-full p-3 text-left hover:bg-muted/50 flex items-start space-x-3 border-b border-border last:border-b-0"
              onClick={() => handleSelectPlace(place)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {place.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {place.formatted_address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length > 0 && !isLoading && suggestions.length === 0 && isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg p-3">
          <div className="text-center text-muted-foreground text-sm">
            Nenhum resultado encontrado para "{query}"
          </div>
        </div>
      )}

      {value && (
        <div className="mt-2 p-3 bg-muted/50 rounded-md border">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{value.place_name}</div>
              <div className="text-xs text-muted-foreground">{value.formatted_address}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Coordenadas: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
