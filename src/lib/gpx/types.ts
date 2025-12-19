export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  time: string;
}

export interface Track {
  name: string;
  points: TrackPoint[];
}

export interface GPXMetadata {
  name: string;
  time: string;
}

export interface GPXData {
  metadata: GPXMetadata;
  tracks: Track[];
}
