import type { GPXData, TrackPoint } from './types';

export async function parseGPXFile(file: File): Promise<GPXData> {
  const text = await file.text();
  return parseGPXString(text);
}

export function parseGPXString(gpxString: string): GPXData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxString, 'text/xml');

  const metadata = parseMetadata(xmlDoc);
  const tracks = parseTracks(xmlDoc);

  return {
    metadata,
    tracks,
  };
}

function parseMetadata(xmlDoc: Document) {
  const metadataEl = xmlDoc.querySelector('metadata');

  return {
    name: metadataEl?.querySelector('name')?.textContent || '',
    time: metadataEl?.querySelector('time')?.textContent || '',
  };
}

function parseTracks(xmlDoc: Document) {
  const tracks: Array<{ name: string; points: TrackPoint[] }> = [];
  const trkElements = xmlDoc.querySelectorAll('trk');

  trkElements.forEach((trk) => {
    const name = trk.querySelector('name')?.textContent || '';
    const points: TrackPoint[] = [];

    const trkpts = trk.querySelectorAll('trkpt');
    trkpts.forEach((trkpt) => {
      const lat = parseFloat(trkpt.getAttribute('lat') || '0');
      const lon = parseFloat(trkpt.getAttribute('lon') || '0');
      const ele = parseFloat(trkpt.querySelector('ele')?.textContent || '0');
      const time = trkpt.querySelector('time')?.textContent || '';

      points.push({ lat, lon, ele, time });
    });

    tracks.push({ name, points });
  });

  return tracks;
}

export function calculateDistance(points: TrackPoint[]): number {
  let distance = 0;

  for (let i = 1; i < points.length; i++) {
    distance += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon
    );
  }

  return distance;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
