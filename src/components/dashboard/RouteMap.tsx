'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MapPin, Loader2, Route, Map, Mountain, Satellite, Moon, Sun } from 'lucide-react';

interface RouteMapProps {
  polyline?: string | null;
  activityName?: string;
  distance?: number;
  className?: string;
}

type MapStyle = 'dark' | 'satellite' | 'outdoor' | 'light';

const MAP_STYLES: Record<MapStyle, { url: string; name: string; icon: typeof Moon; routeColor: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    name: 'Dark',
    icon: Moon,
    routeColor: '#22d3ee',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    name: 'Satellite',
    icon: Satellite,
    routeColor: '#fbbf24',
  },
  outdoor: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    name: 'Terrain',
    icon: Mountain,
    routeColor: '#ef4444',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    name: 'Light',
    icon: Sun,
    routeColor: '#0891b2',
  },
};

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
  const tileLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const glowLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [leafletModule, setLeafletModule] = useState<any>(null);
  const pointsRef = useRef<[number, number][]>([]);

  // Load Leaflet and initialize map
  useEffect(() => {
    if (!polyline || !mapRef.current) {
      setIsLoading(false);
      return;
    }

    const loadMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        setLeafletModule(L);

        // Load Leaflet CSS dynamically
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Add custom zoom control styles
        if (!document.getElementById('leaflet-custom-css')) {
          const style = document.createElement('style');
          style.id = 'leaflet-custom-css';
          style.textContent = `
            .leaflet-control-zoom {
              border: none !important;
              border-radius: 8px !important;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
            }
            .leaflet-control-zoom a {
              background: rgba(15, 23, 42, 0.9) !important;
              color: #22d3ee !important;
              border: none !important;
              width: 32px !important;
              height: 32px !important;
              line-height: 32px !important;
              font-size: 16px !important;
              font-weight: 600 !important;
              transition: all 0.2s ease !important;
            }
            .leaflet-control-zoom a:hover {
              background: rgba(30, 41, 59, 0.95) !important;
              color: #67e8f9 !important;
            }
            .leaflet-control-zoom-in {
              border-radius: 8px 8px 0 0 !important;
              border-bottom: 1px solid rgba(51, 65, 85, 0.5) !important;
            }
            .leaflet-control-zoom-out {
              border-radius: 0 0 8px 8px !important;
            }
          `;
          document.head.appendChild(style);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const points = decodePolyline(polyline);
        pointsRef.current = points;

        if (points.length === 0) {
          setError('No route data available');
          setIsLoading(false);
          return;
        }

        // Create map
        const map = L.map(mapRef.current!, {
          zoomControl: true,
          attributionControl: false,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: true,
        });

        mapInstanceRef.current = map;

        // Add tile layer
        const styleConfig = MAP_STYLES[mapStyle];
        tileLayerRef.current = L.tileLayer(styleConfig.url, {
          maxZoom: 19,
        }).addTo(map);

        // Add glow effect
        glowLayerRef.current = L.polyline(points, {
          color: styleConfig.routeColor,
          weight: 8,
          opacity: 0.2,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Create route polyline
        routeLayerRef.current = L.polyline(points, {
          color: styleConfig.routeColor,
          weight: 3,
          opacity: 0.9,
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
        map.fitBounds(routeLayerRef.current.getBounds(), { padding: [30, 30] });

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

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletModule || !tileLayerRef.current) return;

    const L = leafletModule;
    const styleConfig = MAP_STYLES[mapStyle];

    // Remove old tile layer and add new one
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(styleConfig.url, {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Update route colors
    if (routeLayerRef.current) {
      routeLayerRef.current.setStyle({ color: styleConfig.routeColor });
    }
    if (glowLayerRef.current) {
      glowLayerRef.current.setStyle({ color: styleConfig.routeColor });
    }
  }, [mapStyle, leafletModule]);

  const cycleMapStyle = () => {
    const styles: MapStyle[] = ['dark', 'satellite', 'outdoor', 'light'];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  };

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

  const CurrentStyleIcon = MAP_STYLES[mapStyle].icon;

  return (
    <GlassCard theme="cyan" className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Last Route</h3>
          {activityName && (
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{activityName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Map style toggle */}
          <button
            onClick={cycleMapStyle}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
            title={`Switch map style (${MAP_STYLES[mapStyle].name})`}
          >
            <CurrentStyleIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-400">{MAP_STYLES[mapStyle].name}</span>
          </button>
          {distance && (
            <span className="text-xs text-cyan-400 font-medium">
              {(distance / 1000).toFixed(1)} km
            </span>
          )}
        </div>
      </div>

      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-slate-900" style={{ zIndex: 1 }}>
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
