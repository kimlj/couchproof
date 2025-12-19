'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MapPin, Loader2, Route } from 'lucide-react';

interface RouteMapProps {
  polyline?: string | null;
  activityName?: string;
  distance?: number;
  className?: string;
}

// Decode Google polyline format
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export function RouteMap({ polyline, activityName, distance, className }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!polyline || !mapRef.current) {
      setIsLoading(false);
      return;
    }

    // Dynamically import Leaflet
    const loadMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Load Leaflet CSS dynamically
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const points = decodePolyline(polyline);

        if (points.length === 0) {
          setError('No route data available');
          setIsLoading(false);
          return;
        }

        // Create map
        const map = L.map(mapRef.current!, {
          zoomControl: false,
          attributionControl: false,
          dragging: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Create route polyline with gradient effect
        const routeLine = L.polyline(points, {
          color: '#22d3ee',
          weight: 3,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Add glow effect
        L.polyline(points, {
          color: '#22d3ee',
          weight: 8,
          opacity: 0.2,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Start marker
        const startIcon = L.divIcon({
          html: '<div class="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>',
          className: 'custom-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        // End marker
        const endIcon = L.divIcon({
          html: '<div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>',
          className: 'custom-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        L.marker(points[0], { icon: startIcon }).addTo(map);
        L.marker(points[points.length - 1], { icon: endIcon }).addTo(map);

        // Fit bounds with padding
        map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [polyline]);

  if (!polyline) {
    return (
      <GlassCard theme="slate" className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Last Route</h3>
          <Route className="w-4 h-4 text-slate-500" />
        </div>
        <div className="aspect-[16/10] rounded-lg bg-slate-800/50 flex flex-col items-center justify-center">
          <MapPin className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">No route data</p>
          <p className="text-xs text-slate-600">Complete an activity to see your route</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard theme="cyan" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Last Route</h3>
          {activityName && (
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{activityName}</p>
          )}
        </div>
        {distance && (
          <span className="text-xs text-cyan-400 font-medium">
            {(distance / 1000).toFixed(1)} km
          </span>
        )}
      </div>

      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </GlassCard>
  );
}
