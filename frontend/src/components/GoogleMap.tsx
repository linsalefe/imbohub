'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: { lat: number; lng: number; title?: string; color?: string }[];
  height?: string;
  className?: string;
}

// Script loader singleton
let mapsLoaded = false;
let mapsLoading = false;
const callbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) return resolve();

    callbacks.push(resolve);

    if (mapsLoading) return;
    mapsLoading = true;

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key) {
      console.error('NEXT_PUBLIC_GOOGLE_MAPS_KEY não configurada');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      mapsLoaded = true;
      callbacks.forEach(cb => cb());
      callbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export default function GoogleMap({ latitude, longitude, zoom = 15, markers, height = '300px', className = '' }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps().then(() => {
      if (cancelled || !mapRef.current) return;

      const center = { lat: latitude, lng: longitude };

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      });

      mapInstance.current = map;

      // Main marker
      new google.maps.Marker({
        position: center,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // Extra markers (nearby places)
      if (markers) {
        const categoryColors: Record<string, string> = {
          escola: '#f59e0b',
          hospital: '#ef4444',
          supermercado: '#10b981',
          metro: '#6366f1',
          parque: '#22c55e',
          banco: '#64748b',
          restaurante: '#f97316',
        };

        markers.forEach(m => {
          const marker = new google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: m.color || categoryColors[m.title?.toLowerCase() || ''] || '#6366f1',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          if (m.title) {
            const info = new google.maps.InfoWindow({ content: `<div style="font-size:12px;font-weight:600;padding:2px 4px">${m.title}</div>` });
            marker.addListener('click', () => info.open(map, marker));
          }
        });
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [latitude, longitude, zoom]);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
