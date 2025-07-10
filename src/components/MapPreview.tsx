
import { useEffect, useRef } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

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
  const { isLoaded } = useGooglePlaces();

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    const marker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: placeName || 'Local do Evento',
    });

    if (placeName) {
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>${placeName}</strong></div>`,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, [isLoaded, latitude, longitude, placeName]);

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <div className="text-muted-foreground">Carregando mapa...</div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} />;
};
