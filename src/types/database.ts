export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          strava_id: number | null;
          strava_access_token: string | null;
          strava_refresh_token: string | null;
          strava_token_expires_at: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          strava_id?: number | null;
          strava_access_token?: string | null;
          strava_refresh_token?: string | null;
          strava_token_expires_at?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          strava_id?: number | null;
          strava_access_token?: string | null;
          strava_refresh_token?: string | null;
          strava_token_expires_at?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          distance: number;
          duration: number;
          elevation: number | null;
          start_date: string;
          end_date: string | null;
          description: string | null;
          polyline: string | null;
          strava_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          distance: number;
          duration: number;
          elevation?: number | null;
          start_date: string;
          end_date?: string | null;
          description?: string | null;
          polyline?: string | null;
          strava_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          distance?: number;
          duration?: number;
          elevation?: number | null;
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          polyline?: string | null;
          strava_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};
