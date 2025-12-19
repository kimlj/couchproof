/**
 * TypeScript types for Strava API responses
 */

export interface StravaTokenResponse {
  token_type: 'Bearer';
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete?: StravaAthlete;
}

export interface StravaAthlete {
  id: number;
  username?: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  sex?: 'M' | 'F';
  premium?: boolean;
  summit?: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id?: number;
  weight?: number;
  profile_medium?: string;
  profile?: string;
  friend?: null;
  follower?: null;
  follower_count?: number;
  friend_count?: number;
  mutual_friend_count?: number;
  athlete_type?: number;
  date_preference?: string;
  measurement_preference?: 'feet' | 'meters';
  clubs?: any[];
  ftp?: number;
  bikes?: StravaGear[];
  shoes?: StravaGear[];
}

export interface StravaGear {
  id: string;
  primary: boolean;
  name: string;
  nickname?: string;
  resource_state: number;
  retired: boolean;
  distance: number;
  converted_distance?: number;
  brand_name?: string;
  model_name?: string;
  frame_type?: number;
  description?: string;
}

export interface StravaAthleteStats {
  biggest_ride_distance?: number;
  biggest_climb_elevation_gain?: number;
  recent_ride_totals: StravaActivityTotals;
  recent_run_totals: StravaActivityTotals;
  recent_swim_totals: StravaActivityTotals;
  ytd_ride_totals: StravaActivityTotals;
  ytd_run_totals: StravaActivityTotals;
  ytd_swim_totals: StravaActivityTotals;
  all_ride_totals: StravaActivityTotals;
  all_run_totals: StravaActivityTotals;
  all_swim_totals: StravaActivityTotals;
}

export interface StravaActivityTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

export interface StravaActivity {
  id: number;
  resource_state: number;
  external_id?: string;
  upload_id?: number;
  athlete: {
    id: number;
    resource_state: number;
  };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type?: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline?: string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id?: string | null;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_temp?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out?: boolean;
  display_hide_heartrate_option?: boolean;
  elev_high?: number;
  elev_low?: number;
  upload_id_str?: string;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
  suffer_score?: number;
  description?: string;
  calories?: number;
  perceived_exertion?: number;
  prefer_perceived_exertion?: boolean;
  segment_efforts?: StravaSegmentEffort[];
  splits_metric?: StravaSplit[];
  splits_standard?: StravaSplit[];
  laps?: StravaLap[];
  best_efforts?: StravaBestEffort[];
  photos?: {
    primary?: any;
    count: number;
  };
  stats_visibility?: any[];
  hide_from_home?: boolean;
  device_name?: string;
  embed_token?: string;
  segment_leaderboard_opt_out?: boolean;
  leaderboard_opt_out?: boolean;
}

export interface StravaSegmentEffort {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    resource_state: number;
  };
  athlete: {
    id: number;
    resource_state: number;
  };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  average_cadence?: number;
  device_watts?: boolean;
  average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  segment: {
    id: number;
    resource_state: number;
    name: string;
    activity_type: string;
    distance: number;
    average_grade: number;
    maximum_grade: number;
    elevation_high: number;
    elevation_low: number;
    start_latlng: [number, number];
    end_latlng: [number, number];
    climb_category: number;
    city?: string;
    state?: string;
    country?: string;
    private: boolean;
    hazardous: boolean;
    starred: boolean;
  };
  kom_rank?: number;
  pr_rank?: number;
  achievements?: any[];
  hidden: boolean;
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_grade_adjusted_speed?: number;
  average_heartrate?: number;
  pace_zone?: number;
}

export interface StravaLap {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    resource_state: number;
  };
  athlete: {
    id: number;
    resource_state: number;
  };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  device_watts?: boolean;
  average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  lap_index: number;
  split: number;
  pace_zone?: number;
}

export interface StravaBestEffort {
  id: number;
  resource_state: number;
  name: string;
  activity: {
    id: number;
    resource_state: number;
  };
  athlete: {
    id: number;
    resource_state: number;
  };
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  pr_rank?: number;
  achievements?: any[];
}

export interface StravaStream {
  type: string;
  data: any[];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaActivityStreams {
  time?: number[];
  distance?: number[];
  latlng?: [number, number][];
  altitude?: number[];
  velocity_smooth?: number[];
  heartrate?: number[];
  cadence?: number[];
  watts?: number[];
  temp?: number[];
  moving?: boolean[];
  grade_smooth?: number[];
}

export interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete';
  object_id: number;
  aspect_type: 'create' | 'update' | 'delete';
  updates?: {
    title?: string;
    type?: string;
    private?: boolean;
    authorized?: 'true' | 'false';
  };
  owner_id: number;
  subscription_id: number;
  event_time: number;
}

export interface StravaErrorResponse {
  message: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// Legacy type for backward compatibility
export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}
