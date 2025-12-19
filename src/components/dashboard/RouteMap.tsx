'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { MapPin, Loader2, Route, Moon, Sun, TrendingUp, Mountain, Clock } from 'lucide-react';

interface RouteMapProps {
  polyline?: string | null;
  activityName?: string;
  distance?: number;
  className?: string;
  elevationGain?: number;
  movingTime?: number;
  city?: string;
  activityType?: string;
  startLat?: number;
  startLng?: number;
}

type MapStyle = 'dark' | 'light';

const MAP_STYLES: Record<MapStyle, { url: string; name: string; icon: typeof Moon; routeColor: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    name: 'Dark',
    icon: Moon,
    routeColor: '#22d3ee',
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

// Activity types that typically have elevation data
const ELEVATION_ACTIVITY_TYPES = [
  'ride', 'virtualride', 'ebikeride', 'mountainbikeride', 'gravelride',
  'run', 'virtualrun', 'trailrun', 'walk', 'hike',
  'alpineski', 'backcountryski', 'nordicski', 'snowboard', 'snowshoe',
  'rockclimbing', 'rollerski', 'inlineskate'
];

function hasElevation(activityType?: string): boolean {
  if (!activityType) return false;
  return ELEVATION_ACTIVITY_TYPES.includes(activityType.toLowerCase());
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function RouteMap({ polyline, activityName, distance, className, elevationGain, movingTime, city, activityType, startLat, startLng }: RouteMapProps) {
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
  const [location, setLocation] = useState<string | null>(city || null);

  // Reverse geocode to get city from coordinates
  useEffect(() => {
    if (city) {
      setLocation(city);
      return;
    }

    // Get coordinates from polyline or props
    let lat = startLat;
    let lng = startLng;

    if (!lat || !lng) {
      // Try to get from polyline (returns [lat, lng])
      if (polyline) {
        const points = decodePolyline(polyline);
        if (points.length > 0) {
          lat = points[0][0];
          lng = points[0][1];
        }
      }
    }

    if (!lat || !lng) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    // Fetch location from Mapbox reverse geocoding
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&access_token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const place = data.features[0];
          // Get city name (place name) and optionally region
          const cityName = place.text;
          const context = place.context || [];
          const region = context.find((c: any) => c.id.startsWith('region'))?.text;

          if (cityName) {
            setLocation(region ? `${cityName}, ${region}` : cityName);
          }
        }
      })
      .catch(err => {
        console.error('Reverse geocoding error:', err);
      });
  }, [city, startLat, startLng, polyline]);

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
    setMapStyle(mapStyle === 'dark' ? 'light' : 'dark');
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

  const showElevation = hasElevation(activityType) && elevationGain && elevationGain > 0;

  return (
    <GlassCard theme="cyan" className={`p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Last Route</h3>
          <div className="flex items-center gap-1.5 text-xs">
            {activityName && (
              <span className="text-slate-400 truncate max-w-[150px]">{activityName}</span>
            )}
            {activityName && location && (
              <span className="text-slate-600">•</span>
            )}
            {location && (
              <span className="text-slate-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
          </div>
        </div>
        {/* Stats + Toggle on right */}
        <div className="flex items-center gap-3">
          {distance && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-medium">
                {(distance / 1000).toFixed(1)} km
              </span>
            </div>
          )}
          {showElevation && (
            <div className="flex items-center gap-1">
              <Mountain className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">
                {Math.round(elevationGain)}m
              </span>
            </div>
          )}
          {movingTime && movingTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">
                {formatDuration(movingTime)}
              </span>
            </div>
          )}
          {/* Map style toggle */}
          <button
            onClick={cycleMapStyle}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
            title={`Switch to ${mapStyle === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <CurrentStyleIcon className="w-3.5 h-3.5 text-cyan-400" />
          </button>
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
