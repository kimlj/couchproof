// ==================== APP-LEVEL INTERFACES ====================

/**
 * Activity type for internal app use
 */
export interface Activity {
  id: string;
  stravaId: number;
  name: string;
  type: string;
  sportType: string;
  distance: number; // meters
  duration: number; // seconds
  elevation: number; // meters
  startDate: Date | string;
  description?: string | null;
  polyline?: string | null;
  averageSpeed?: number;
  maxSpeed?: number;
  averageHeartrate?: number | null;
  maxHeartrate?: number | null;
  averageWatts?: number | null;
  calories?: number | null;
  kudosCount: number;
  commentCount: number;
  achievementCount: number;
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
}

// ==================== CORE STATS INTERFACES ====================

/**
 * Identity information for a user
 */
export interface UserIdentity {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  sex: string | null; // "M" | "F"
  city: string | null;
  state: string | null;
  country: string | null;
  memberSince: Date | null; // stravaCreatedAt
  accountAgeDays: number;
  avatarUrl: string | null;
  hasStravaSummit: boolean; // stravaPremium
}

/**
 * Social metrics and engagement
 */
export interface UserSocial {
  followerCount: number;
  friendCount: number;
  totalKudosReceived: number;
  averageKudosPerActivity: number;
  mostKudosedActivity: {
    id: string;
    name: string;
    kudosCount: number;
    date: Date;
  } | null;
  socialType: "social-butterfly" | "balanced" | "lone-wolf" | "unknown";
}

/**
 * Activity volume stats for a specific time period
 */
export interface VolumeStats {
  rides: {
    activities: number;
    distance: number; // meters
    time: number; // seconds
    elevation: number; // meters
  };
  runs: {
    activities: number;
    distance: number;
    time: number;
    elevation: number;
  };
  swims: {
    activities: number;
    distance: number;
    time: number;
  };
  total: {
    activities: number;
    distance: number;
    time: number;
    elevation: number;
  };
}

/**
 * Volume metrics across different time periods
 */
export interface UserVolume {
  allTime: VolumeStats;
  ytd: VolumeStats;
  recent4Weeks: VolumeStats;
  thisMonth: VolumeStats;
}

/**
 * Comparison metrics between time periods
 */
export interface PeriodComparison {
  distanceChange: number; // percentage
  activitiesChange: number; // percentage
  trend: "improving" | "declining" | "stable" | "unknown";
}

/**
 * Comparisons across different time periods
 */
export interface UserComparisons {
  vsLastMonth: PeriodComparison;
  vsLastYear: PeriodComparison;
  vsSameMonthLastYear: PeriodComparison;
}

/**
 * Activity type breakdown and variety metrics
 */
export interface UserActivities {
  types: {
    [activityType: string]: {
      count: number;
      distance: number;
      time: number;
    };
  };
  primaryType: string | null; // "Ride" | "Run" | "Swim" etc.
  variety: number; // number of different activity types
  lastActivity: {
    id: string;
    name: string;
    type: string;
    date: Date;
  } | null;
  averagePerWeek: number;
  commuteCount: number;
  trainerCount: number;
}

/**
 * Day of week distribution
 */
export interface DayDistribution {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

/**
 * Time of day distribution (hour blocks)
 */
export interface TimeSlotDistribution {
  predawn: number; // 00:00-05:59
  morning: number; // 06:00-11:59
  afternoon: number; // 12:00-17:59
  evening: number; // 18:00-23:59
}

/**
 * Seasonal activity patterns
 */
export interface SeasonalPattern {
  spring: number; // Mar-May
  summer: number; // Jun-Aug
  fall: number; // Sep-Nov
  winter: number; // Dec-Feb
  preferredSeason: "spring" | "summer" | "fall" | "winter" | "none";
}

/**
 * Timing patterns and preferences
 */
export interface UserTiming {
  favoriteDay: string | null; // "Monday", "Tuesday", etc.
  favoriteTimeSlot: "predawn" | "morning" | "afternoon" | "evening" | null;
  dayDistribution: DayDistribution;
  timeSlotDistribution: TimeSlotDistribution;
  weekdayCount: number;
  weekendCount: number;
  isWeekendWarrior: boolean;
  earliestEverStart: Date | null;
  latestEverStart: Date | null;
  seasonalPattern: SeasonalPattern;
}

/**
 * Consistency and streak metrics
 */
export interface UserConsistency {
  currentStreak: number; // days
  longestStreak: number; // days
  streakStatus: "on-fire" | "active" | "broken" | "none";
  activeDaysPerWeek: number;
  mostActiveWeek: {
    startDate: Date;
    activities: number;
    distance: number;
  } | null;
  longestBreak: number; // days
  currentBreak: number; // days since last activity
  isComingBack: boolean; // returning after long break
  isOnFire: boolean; // very active recently
}

/**
 * Personal records across different metrics
 */
export interface UserRecords {
  longestDistance: {
    value: number; // meters
    activityId: string;
    date: Date;
    type: string;
  } | null;
  biggestClimb: {
    value: number; // meters
    activityId: string;
    date: Date;
  } | null;
  fastestPace: {
    value: number; // m/s
    activityId: string;
    date: Date;
    type: string;
  } | null;
  longestDuration: {
    value: number; // seconds
    activityId: string;
    date: Date;
    type: string;
  } | null;
  highestPower: {
    value: number; // watts
    activityId: string;
    date: Date;
  } | null;
  highestHeartRate: {
    value: number; // bpm
    activityId: string;
    date: Date;
  } | null;
  mostKudos: {
    value: number;
    activityId: string;
    date: Date;
    name: string;
  } | null;
}

/**
 * Bike gear information
 */
export interface BikeGear {
  id: string;
  name: string;
  brandName: string | null;
  modelName: string | null;
  frameType: number | null; // 1=MTB, 2=Cross, 3=Road, 4=TT
  distance: number; // meters
  primary: boolean;
  retired: boolean;
}

/**
 * Shoe gear information
 */
export interface ShoeGear {
  id: string;
  name: string;
  brandName: string | null;
  modelName: string | null;
  distance: number; // meters
  primary: boolean;
  retired: boolean;
}

/**
 * Gear collection and usage patterns
 */
export interface UserGear {
  bikes: BikeGear[];
  shoes: ShoeGear[];
  totalBikes: number;
  activeShoes: number;
  primaryBike: BikeGear | null;
  primaryShoe: ShoeGear | null;
  isNPlusOneGuy: boolean; // has many bikes
  gearRotation: "varied" | "focused" | "single" | "none";
}

/**
 * Body metrics and power data
 */
export interface UserBody {
  weight: number | null; // kg
  ftp: number | null; // watts
  wattsPerKg: number | null;
  ftpCategory: "untrained" | "fair" | "moderate" | "good" | "very-good" | "excellent" | "exceptional" | "world-class" | null;
  measurementPreference: "metric" | "imperial";
}

/**
 * Heart rate zones
 */
export interface HeartRateZones {
  zone1: { min: number; max: number };
  zone2: { min: number; max: number };
  zone3: { min: number; max: number };
  zone4: { min: number; max: number };
  zone5: { min: number; max: number };
}

/**
 * Time spent in each heart rate zone
 */
export interface TimeInZones {
  zone1: number; // seconds
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
}

/**
 * Heart rate metrics and zone analysis
 */
export interface UserHeartRate {
  hasData: boolean;
  zones: HeartRateZones | null;
  timeInZones: TimeInZones | null;
  dominantZone: 1 | 2 | 3 | 4 | 5 | null;
  zoneProfile: "easy-rider" | "balanced" | "threshold-lover" | "redliner" | null;
  hardEffortFrequency: number; // percentage of activities in zones 4-5
}

/**
 * Power zones (cycling)
 */
export interface PowerZones {
  zone1: { min: number; max: number }; // Active Recovery
  zone2: { min: number; max: number }; // Endurance
  zone3: { min: number; max: number }; // Tempo
  zone4: { min: number; max: number }; // Lactate Threshold
  zone5: { min: number; max: number }; // VO2 Max
  zone6: { min: number; max: number }; // Anaerobic Capacity
  zone7: { min: number; max: number }; // Neuromuscular
}

/**
 * Time spent in each power zone
 */
export interface TimeInPowerZones {
  zone1: number; // seconds
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
  zone6: number;
  zone7: number;
}

/**
 * Peak power outputs
 */
export interface PeakPowers {
  fiveSecond: number | null; // watts
  oneMinute: number | null;
  fiveMinute: number | null;
  twentyMinute: number | null;
}

/**
 * Power metrics and zone analysis
 */
export interface UserPower {
  hasData: boolean;
  ftp: number | null; // watts
  zones: PowerZones | null;
  timeInPowerZones: TimeInPowerZones | null;
  powerProfile: "sprinter" | "all-rounder" | "time-trialist" | "climber" | null;
  peakPowers: PeakPowers;
}

/**
 * Segment effort and achievements
 */
export interface UserSegments {
  hasData: boolean;
  starredCount: number;
  totalEfforts: number;
  komCount: number; // KOM/QOM/CR count
  mostAttempted: {
    segmentId: string;
    name: string;
    attempts: number;
  } | null;
  nemesis: {
    segmentId: string;
    name: string;
    attempts: number;
    neverPR: boolean;
  } | null;
  segmentHunterScore: number; // 0-100
}

/**
 * Effort and pace metrics
 */
export interface UserEffort {
  averagePace: number | null; // m/s (overall average speed)
  averageSpeed: number | null; // m/s
  paceVariability: "very-consistent" | "consistent" | "variable" | "erratic" | null;
  paceImprovement: number; // percentage improvement over time
  terrainPreference: "flat" | "rolling" | "hilly" | "mountainous" | null;
}

/**
 * Exploration and route variety metrics
 */
export interface UserExploration {
  uniqueStartLocations: number;
  uniqueCities: number;
  uniqueCountries: number;
  homeCity: string | null;
  routeRepetitionRate: number; // percentage of repeated routes
  explorerScore: number; // 0-100
}

/**
 * Quirky behavior flags
 */
export interface UserQuirks {
  hasPreDawnActivity: boolean; // activities before 5am
  hasLateNightActivity: boolean; // activities after 11pm
  hasHolidayActivity: boolean; // activities on major holidays
  namingStyle: "descriptive" | "creative" | "default" | "mixed" | null;
  usesEmojisInNames: boolean;
  hasDoubleDay: boolean; // multiple activities in one day
}

/**
 * Personality trait scores (0-100)
 */
export interface UserTraits {
  // Timing
  dawnWarrior: number;
  nightOwl: number;
  weekendWarrior: number;

  // Effort
  steadyEddy: number;
  surgeMaster: number;
  elevationJunkie: number;
  speedDemon: number;
  enduranceKing: number;

  // Consistency
  streakMachine: number;
  burstMode: number;
  improver: number;

  // Style
  explorer: number;
  homeBody: number;
  segmentHunter: number;

  // Social
  socialButterfly: number;
  loneWolf: number;

  // Gear
  gearHead: number;
  minimalist: number;
  shoeDestroyer: number;

  // HR/Power
  heartrateSandbagger: number;
  redlineAddict: number;
  wattBazooka: number;
  dieselEngine: number;
}

/**
 * Athlete archetype
 */
export interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

/**
 * Fun comparison metrics
 */
export interface FunComparisons {
  distanceEquivalent: string; // "from SF to LA" etc.
  elevationEquivalent: string; // "climbed Everest 2.5 times"
  timeEquivalent: string; // "watched entire series of..."
  calorieEquivalent: string; // "burned 500 burgers"
  everestsClimbed: number;
  marathonsEquivalent: number;
}

/**
 * Current context flags
 */
export interface UserContext {
  isNewUser: boolean; // < 30 days
  isVeteran: boolean; // > 1 year
  isComingBack: boolean; // long break, now active
  isOnFire: boolean; // very active recently
  isSlumping: boolean; // activity decreased
  hasRecentPR: boolean; // PR in last 30 days
  isCouchMode: boolean; // no activity in 14+ days
}

/**
 * Regional culture and references
 */
export interface UserCulture {
  region: "us-west" | "us-east" | "us-south" | "us-midwest" | "europe" | "asia" | "oceania" | "latam" | "other" | null;
  localReferences: string[]; // local landmarks, sayings
  distanceComparisons: string[]; // "SF to LA", "London to Paris"
  localPeaks: string[]; // "Mt. Tam", "Alpe d'Huez"
}

/**
 * Metadata about the stats calculation
 */
export interface StatsMetadata {
  calculatedAt: Date;
  activitiesAnalyzed: number;
  oldestActivityDate: Date | null;
  newestActivityDate: Date | null;
  dataCompleteness: number; // 0-100 percentage
}

/**
 * Complete user stats for AI generation
 * This is the master interface that combines all stats categories
 */
export interface UserStatsForAI {
  // Core identity
  identity: UserIdentity;

  // Social engagement
  social: UserSocial;

  // Volume metrics
  volume: UserVolume;

  // Time period comparisons
  comparisons: UserComparisons;

  // Activity breakdown
  activities: UserActivities;

  // Timing patterns
  timing: UserTiming;

  // Consistency metrics
  consistency: UserConsistency;

  // Personal records
  records: UserRecords;

  // Gear collection
  gear: UserGear;

  // Body metrics
  body: UserBody;

  // Heart rate data
  heartRate: UserHeartRate;

  // Power data
  power: UserPower;

  // Segment achievements
  segments: UserSegments;

  // Effort analysis
  effort: UserEffort;

  // Exploration patterns
  exploration: UserExploration;

  // Quirky behaviors
  quirks: UserQuirks;

  // Personality traits
  traits: UserTraits;

  // Top personality traits
  primaryTraits: string[];
  secondaryTraits: string[];

  // Archetype
  archetype: Archetype;

  // Fun comparisons
  funComparisons: FunComparisons;

  // Context flags
  context: UserContext;

  // Cultural context
  culture: UserCulture;

  // Metadata
  metadata: StatsMetadata;
}

// ==================== AI GENERATION INTERFACES ====================

/**
 * Result from AI generation (roast, hype, narrative)
 */
export interface AIGenerationResult {
  id: string;
  userId: string;
  type: "roast" | "hype" | "narrative" | "personality";
  style: string | null;
  activityId: string | null;
  inputContext: Record<string, any> | null;
  prompt: string;
  response: string;
  keyPhrasesUsed: string[];
  dataPointsReferenced: string[];
  tokensUsed: number | null;
  modelUsed: string | null;
  createdAt: Date;
}

/**
 * AI-generated personality profile
 */
export interface PersonalityProfile {
  profileSummary: string;
  strengths: string[];
  growthAreas: string[];
  funFacts: string[];
  spiritAnimal: string | null;
  spiritAnimalEmoji: string | null;
  spiritAnimalReason: string | null;
  compatibility: string | null;
}

/**
 * Context for avoiding repetition in AI generations
 */
export interface AvoidanceContext {
  recentPhrasesUsed: string[];
  recentDataPointsReferenced: string[];
  recentStyles: string[];
  lastGenerationDate: Date | null;
}

// ==================== ACHIEVEMENT INTERFACES ====================

/**
 * Achievement requirement definition
 */
export interface AchievementRequirement {
  type: string; // "total_distance" | "streak_days" | "activity_count" | "elevation_gain" | etc.
  value: number;
  unit: string; // "meters" | "days" | "count" | etc.
  activityType?: string; // optional filter by activity type
}

/**
 * Achievement definition
 */
export interface AchievementDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: "milestone" | "quirky" | "streak" | "couchproof";
  tier: "bronze" | "silver" | "gold";
  requirement: AchievementRequirement;
  sortOrder: number;
}

/**
 * User's progress toward an achievement
 */
export interface AchievementProgress {
  achievement: AchievementDefinition;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isUnlocked: boolean;
  unlockedAt: Date | null;
  activityId: string | null;
}

// ==================== STRAVA INTERFACES ====================

/**
 * Strava OAuth tokens
 */
export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}

/**
 * Strava athlete profile
 */
export interface StravaAthlete {
  id: number;
  username: string | null;
  resourceState: number;
  firstname: string;
  lastname: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: string; // "M" | "F"
  premium: boolean;
  summit: boolean;
  createdAt: Date;
  updatedAt: Date;
  badgeTypeId: number | null;
  weight: number | null; // kg
  profileMedium: string | null;
  profile: string | null;
  friend: string | null;
  follower: string | null;
  followerCount: number;
  friendCount: number;
  mutualFriendCount: number;
  athleteType: number;
  datePreference: string;
  measurementPreference: string; // "feet" | "meters"
  clubs: any[];
  ftp: number | null;
  bikes: any[];
  shoes: any[];
}

/**
 * Strava activity data
 */
export interface StravaActivity {
  id: number;
  resourceState: number;
  externalId: string | null;
  uploadId: number | null;
  athlete: {
    id: number;
    resourceState: number;
  };
  name: string;
  description: string | null;
  distance: number; // meters
  movingTime: number; // seconds
  elapsedTime: number; // seconds
  totalElevationGain: number; // meters
  type: string; // "Run" | "Ride" | "Swim" | etc.
  sportType: string; // "Run" | "TrailRun" | "MountainBikeRide" | etc.
  workoutType: number | null;
  startDate: string; // ISO date string
  startDateLocal: string; // ISO date string
  timezone: string;
  utcOffset: number;
  locationCity: string | null;
  locationState: string | null;
  locationCountry: string | null;
  achievementCount: number;
  kudosCount: number;
  commentCount: number;
  athleteCount: number;
  photoCount: number;
  map: {
    id: string;
    summaryPolyline: string | null;
    resourceState: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gearId: string | null;
  startLatlng: [number, number] | null;
  endLatlng: [number, number] | null;
  averageSpeed: number; // m/s
  maxSpeed: number; // m/s
  averageCadence: number | null;
  averageTemp: number | null;
  hasHeartrate: boolean;
  averageHeartrate: number | null;
  maxHeartrate: number | null;
  heartrateOptOut: boolean;
  displayHideHeartrateOption: boolean;
  elevHigh: number | null;
  elevLow: number | null;
  prCount: number;
  totalPhotoCount: number;
  hasKudoed: boolean;
  sufferScore: number | null;
  // Cycling specific
  averageWatts: number | null;
  weightedAverageWatts: number | null;
  kilojoules: number | null;
  deviceWatts: boolean;
  maxWatts: number | null;
  // Additional fields
  calories: number | null;
  deviceName: string | null;
  embedToken: string | null;
  segmentEfforts?: any[];
  splitsMetric?: any[];
  splitsStandard?: any[];
  laps?: any[];
  bestEfforts?: any[];
  photos?: {
    primary: any;
    usePrimaryPhoto: boolean;
    count: number;
  };
  stats?: {
    achievementCount: number;
    kudosCount: number;
    commentCount: number;
    athleteCount: number;
    photoCount: number;
    totalPhotoCount: number;
  };
  hideFromHome: boolean;
  gear?: {
    id: string;
    primary: boolean;
    name: string;
    resourceState: number;
    distance: number;
  };
}

/**
 * Strava activity streams data
 */
export interface StravaStreams {
  time?: number[]; // seconds
  distance?: number[]; // meters
  latlng?: [number, number][];
  altitude?: number[]; // meters
  velocity_smooth?: number[]; // m/s
  heartrate?: number[]; // bpm
  cadence?: number[]; // rpm
  watts?: number[];
  temp?: number[]; // celsius
  moving?: boolean[];
  grade_smooth?: number[]; // percentage
}

// ==================== GPX INTERFACES ====================

/**
 * GPX trackpoint
 */
export interface GPXTrackPoint {
  lat: number;
  lon: number;
  ele?: number; // elevation in meters
  time?: Date;
  extensions?: {
    heartrate?: number;
    cadence?: number;
    power?: number;
    temperature?: number;
  };
}

/**
 * GPX track segment
 */
export interface GPXTrackSegment {
  points: GPXTrackPoint[];
}

/**
 * GPX track
 */
export interface GPXTrack {
  name?: string;
  type?: string;
  segments: GPXTrackSegment[];
}

/**
 * Parsed GPX file data
 */
export interface GPXData {
  metadata?: {
    name?: string;
    desc?: string;
    author?: string;
    time?: Date;
  };
  tracks: GPXTrack[];
  waypoints?: Array<{
    lat: number;
    lon: number;
    name?: string;
    desc?: string;
    ele?: number;
  }>;
  routes?: Array<{
    name?: string;
    points: Array<{
      lat: number;
      lon: number;
      ele?: number;
    }>;
  }>;
}

// ==================== ACTIVITY ANALYSIS INTERFACES ====================

/**
 * Calculated metrics from activity streams
 */
export interface StreamAnalysis {
  // Elevation
  totalElevationGain: number; // meters
  totalElevationLoss: number; // meters
  maxElevation: number; // meters
  minElevation: number; // meters

  // Speed/Pace
  averageSpeed: number; // m/s
  maxSpeed: number; // m/s
  averageMovingSpeed: number; // m/s

  // Grade
  maxGrade: number; // percentage
  averageGrade: number; // percentage

  // Heart rate (if available)
  averageHeartRate?: number; // bpm
  maxHeartRate?: number; // bpm
  timeInZones?: TimeInZones;

  // Power (if available)
  averagePower?: number; // watts
  maxPower?: number; // watts
  normalizedPower?: number; // watts
  timeInPowerZones?: TimeInPowerZones;

  // Cadence (if available)
  averageCadence?: number; // rpm
  maxCadence?: number; // rpm

  // VAM (Vertical Ascent Meters per hour - climbing rate)
  vam?: number;
}

// ==================== UTILITY TYPES ====================

/**
 * Measurement system preference
 */
export type MeasurementPreference = "metric" | "imperial";

/**
 * Activity type
 */
export type ActivityType =
  | "Ride"
  | "Run"
  | "Swim"
  | "Walk"
  | "Hike"
  | "AlpineSki"
  | "BackcountrySki"
  | "Canoeing"
  | "Crossfit"
  | "EBikeRide"
  | "Elliptical"
  | "Golf"
  | "Handcycle"
  | "IceSkate"
  | "InlineSkate"
  | "Kayaking"
  | "Kitesurf"
  | "NordicSki"
  | "RockClimbing"
  | "RollerSki"
  | "Rowing"
  | "Snowboard"
  | "Snowshoe"
  | "StairStepper"
  | "StandUpPaddling"
  | "Surfing"
  | "VirtualRide"
  | "VirtualRun"
  | "WeightTraining"
  | "Wheelchair"
  | "Windsurf"
  | "Workout"
  | "Yoga";

/**
 * Sport type (more specific than activity type)
 */
export type SportType =
  | "Run"
  | "TrailRun"
  | "Ride"
  | "MountainBikeRide"
  | "GravelRide"
  | "EBikeMountainRide"
  | "Swim"
  | "Walk"
  | "Hike"
  | "VirtualRide"
  | "VirtualRun"
  | string; // Strava keeps adding more

/**
 * User subscription tier
 */
export type SubscriptionTier = "free" | "premium";

/**
 * Gender
 */
export type Gender = "M" | "F" | null;

// ==================== REQUEST/RESPONSE TYPES ====================

/**
 * Request to generate AI content
 */
export interface AIGenerationRequest {
  userId: string;
  type: "roast" | "hype" | "narrative" | "personality";
  style?: string;
  activityId?: string;
  avoidanceContext?: AvoidanceContext;
}

/**
 * Response from AI generation
 */
export interface AIGenerationResponse {
  content: string;
  style: string;
  keyPhrasesUsed: string[];
  dataPointsReferenced: string[];
  generationId: string;
}

/**
 * Stats calculation options
 */
export interface StatsCalculationOptions {
  forceRecalculate?: boolean;
  includeArchived?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

