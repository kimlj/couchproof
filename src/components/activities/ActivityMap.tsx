'use client';

interface ActivityMapProps {
  polyline?: string;
  coordinates?: Array<[number, number]>;
}

export function ActivityMap({ polyline, coordinates }: ActivityMapProps) {
  // TODO: Implement map visualization using Mapbox or Leaflet
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-100 flex items-center justify-center text-muted-foreground">
        Map visualization will go here
      </div>
    </div>
  );
}
