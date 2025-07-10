
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X } from 'lucide-react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { isLoaded, searchPlaces, error } = useGooglePlaces();

  useEffect(() => {
    if (value) {
      setQuery(value.place_name || value.formatted_address);
    }
  }, [value]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 2 && isLoaded) {
        setIsLoading(true);
        try {
          const results = await searchPlaces(query);
          setSuggestions(results.slice(0, 5)); // Limit to 5 suggestions
          setIsOpen(true);
        } catch (err) {
          console.error('Error searching places:', err);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

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

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  if (error) {
    return (
      <div className="text-destructive text-sm">
        Erro ao carregar o serviço de localização. Tente novamente.
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={!isLoaded}
        />
        {query && (
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

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-3 text-center text-muted-foreground">
              Pesquisando...
            </div>
          )}
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
