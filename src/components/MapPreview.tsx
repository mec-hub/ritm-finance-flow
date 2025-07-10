
import { useEffect, useRef, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { Loader2, AlertCircle } from 'lucide-react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  placeName?: string;
  className?: string;
}

export const MapPreview = ({ 
  latitude, 
  longitude, 
  placeName,
  className = "w-full h-64 rounded-md border"
}: MapPreviewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { isLoaded } = useGooglePlaces();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    // Validate coordinates
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setMapError('Coordenadas inválidas');
      return;
    }

    try {
      // Clear any existing error
      setMapError(null);

      // Create or update map
      if (!mapInstanceRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        mapInstanceRef.current = map;
      } else {
        // Update existing map center
        mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
      }

      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Create new marker
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstanceRef.current,
        title: placeName || 'Local do Evento',
        animation: google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Add info window if place name is provided
      if (placeName) {
        const infoWindow = new google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${placeName}</strong></div>`,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      console.log('Map updated successfully with coordinates:', { latitude, longitude });
    } catch (error) {
      console.error('Error creating/updating map:', error);
      setMapError('Erro ao carregar o mapa');
    }

    return () => {
      // Cleanup marker when coordinates change
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [isLoaded, latitude, longitude, placeName]);

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando mapa...</span>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted border-destructive/20`}>
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{mapError}</span>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};
