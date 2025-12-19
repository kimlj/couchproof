// Activity types
export const ACTIVITY_TYPES = [
  'Run',
  'Ride',
  'Swim',
  'Walk',
  'Hike',
  'AlpineSki',
  'BackcountrySki',
  'Canoeing',
  'Crossfit',
  'EBikeRide',
  'Elliptical',
  'Golf',
  'Handcycle',
  'IceSkate',
  'InlineSkate',
  'Kayaking',
  'Kitesurf',
  'NordicSki',
  'RockClimbing',
  'RollerSki',
  'Rowing',
  'Snowboard',
  'Snowshoe',
  'Soccer',
  'StairStepper',
  'StandUpPaddling',
  'Surfing',
  'Tennis',
  'TrailRun',
  'VirtualRide',
  'VirtualRun',
  'WeightTraining',
  'Wheelchair',
  'Windsurf',
  'Workout',
  'Yoga',
] as const

export type ActivityType = typeof ACTIVITY_TYPES[number]

// Sport types (more specific)
export const SPORT_TYPES = {
  Run: ['Run', 'TrailRun', 'VirtualRun', 'Treadmill'],
  Ride: ['Ride', 'MountainBikeRide', 'GravelRide', 'EBikeRide', 'VirtualRide'],
  Swim: ['Swim'],
  Walk: ['Walk', 'Hike'],
} as const

// Time slots for activity analysis
export const TIME_SLOTS = [
  { slot: 'Pre-Dawn', range: '4-6am', hours: [4, 5] },
  { slot: 'Early Morning', range: '6-8am', hours: [6, 7] },
  { slot: 'Morning', range: '8-11am', hours: [8, 9, 10] },
  { slot: 'Midday', range: '11am-2pm', hours: [11, 12, 13] },
  { slot: 'Afternoon', range: '2-5pm', hours: [14, 15, 16] },
  { slot: 'Evening', range: '5-8pm', hours: [17, 18, 19] },
  { slot: 'Night', range: '8-11pm', hours: [20, 21, 22] },
  { slot: 'Late Night', range: '11pm-4am', hours: [23, 0, 1, 2, 3] },
] as const

// Days of week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

// Months
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

// Heart rate zones
export const HR_ZONES = [
  { zone: 1, name: 'Recovery', description: 'Very light effort' },
  { zone: 2, name: 'Endurance', description: 'Light, conversational pace' },
  { zone: 3, name: 'Tempo', description: 'Moderate effort' },
  { zone: 4, name: 'Threshold', description: 'Hard effort' },
  { zone: 5, name: 'VO2 Max', description: 'Very hard effort' },
] as const

// Power zones (cycling)
export const POWER_ZONES = [
  { zone: 1, name: 'Active Recovery', percentFTP: [0, 55] },
  { zone: 2, name: 'Endurance', percentFTP: [55, 75] },
  { zone: 3, name: 'Tempo', percentFTP: [75, 90] },
  { zone: 4, name: 'Threshold', percentFTP: [90, 105] },
  { zone: 5, name: 'VO2 Max', percentFTP: [105, 120] },
  { zone: 6, name: 'Anaerobic', percentFTP: [120, 150] },
  { zone: 7, name: 'Neuromuscular', percentFTP: [150, 999] },
] as const

// FTP categories by watts/kg
export const FTP_CATEGORIES = {
  untrained: { min: 0, max: 2.0, label: 'Untrained' },
  fair: { min: 2.0, max: 2.5, label: 'Fair' },
  moderate: { min: 2.5, max: 3.0, label: 'Moderate' },
  good: { min: 3.0, max: 3.5, label: 'Good' },
  veryGood: { min: 3.5, max: 4.0, label: 'Very Good' },
  excellent: { min: 4.0, max: 4.5, label: 'Excellent' },
  exceptional: { min: 4.5, max: 5.0, label: 'Exceptional' },
  worldClass: { min: 5.0, max: 999, label: 'World Class' },
} as const

// AI credit limits
export const AI_CREDITS = {
  free: 3,
  premium: Infinity,
} as const

// Strava API rate limits
export const STRAVA_RATE_LIMITS = {
  shortTerm: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 per 15 min
  daily: { requests: 1000, windowMs: 24 * 60 * 60 * 1000 }, // 1000 per day
} as const

// Shoe replacement threshold (meters)
export const SHOE_REPLACEMENT_THRESHOLD = 700000 // 700km

// Everest height (meters)
export const EVEREST_HEIGHT = 8849

// Earth circumference (km)
export const EARTH_CIRCUMFERENCE = 40075

// Marathon distance (meters)
export const MARATHON_DISTANCE = 42195

// Fun equivalents
export const FUN_EQUIVALENTS = {
  burgerCalories: 500,
  pizzaSliceCalories: 285,
  lightbulbWatts: 60,
} as const

// Achievement rarity colors
export const ACHIEVEMENT_RARITY_COLORS = {
  common: 'from-slate-500 to-slate-600',
  uncommon: 'from-green-500 to-emerald-600',
  rare: 'from-blue-500 to-cyan-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-yellow-500 to-orange-600',
} as const

// App metadata
export const APP_NAME = 'Couchproof'
export const APP_TAGLINE = 'Prove you left the couch.'
export const APP_DESCRIPTION = 'Free alternative to Strava Premium with AI-powered roasts, personality analysis, and gamification.'
