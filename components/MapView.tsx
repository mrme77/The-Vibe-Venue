/**
 * MapView Component
 * Displays venues on an interactive Leaflet map with OpenStreetMap tiles
 */

import { useEffect, useRef } from 'react';
import type { Venue } from '@/types/venue';
import type L from 'leaflet';

interface MapViewProps {
  venues: Venue[];
  center: { lat: number; lng: number };
}

export default function MapView({ venues, center }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet (client-side only)
    import('leaflet').then((L) => {
      // Cleanup existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Fix Leaflet default marker icon issue with Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Initialize map
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([center.lat, center.lng], 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add markers for venues
      const markers: L.Marker[] = [];

      venues.forEach((venue) => {
        // Create custom icon
        const icon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Create marker
        const marker = L.marker([venue.location.lat, venue.location.lng], { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="min-width: 180px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${venue.name}</h3>
              ${venue.address ? `<p style="font-size: 12px; color: #666;">${venue.address}</p>` : ''}
            </div>
          `
          );

        markers.push(marker);
      });

      // Fit map bounds to show all markers with appropriate zoom
      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        const bounds = group.getBounds();

        // Add padding and set appropriate zoom level
        map.fitBounds(bounds.pad(0.2), {
          maxZoom: 14,
          padding: [50, 50],
        });
      }
    });

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venues, center]);

  return (
    <div className="relative w-full h-full bg-stone-100 dark:bg-stone-800 transition-colors">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* Loading State */}
      {venues.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-900 rounded-lg transition-colors">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-stone-400 dark:text-stone-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-stone-500 dark:text-stone-500">Map will appear here when venues are found</p>
          </div>
        </div>
      )}
    </div>
  );
}
