import { EVEREST_HEIGHT, MARATHON_DISTANCE, EARTH_CIRCUMFERENCE, FUN_EQUIVALENTS } from './constants'

/**
 * Calculate how many Everests worth of elevation
 */
export function calculateEverestsClimbed(elevationMeters: number): number {
  return elevationMeters / EVEREST_HEIGHT
}

/**
 * Calculate how many marathons equivalent
 */
export function calculateMarathonsEquivalent(distanceMeters: number): number {
  return distanceMeters / MARATHON_DISTANCE
}

/**
 * Calculate percentage of Earth circumference
 */
export function calculateEarthLaps(distanceKm: number): number {
  return distanceKm / EARTH_CIRCUMFERENCE
}

/**
 * Calculate percentage of distance to moon (384,400 km)
 */
export function calculateMoonProgress(distanceKm: number): number {
  return (distanceKm / 384400) * 100
}

/**
 * Calculate burgers burned equivalent
 */
export function calculateBurgersBurned(calories: number): number {
  return calories / FUN_EQUIVALENTS.burgerCalories
}

/**
 * Calculate average pace from speed (m/s to min/km)
 */
export function speedToPace(speedMs: number): number {
  if (speedMs <= 0) return 0
  return 1000 / speedMs / 60 // minutes per km
}

/**
 * Calculate speed from pace (min/km to m/s)
 */
export function paceToSpeed(paceMinPerKm: number): number {
  if (paceMinPerKm <= 0) return 0
  return 1000 / (paceMinPerKm * 60)
}

/**
 * Calculate FTP category from watts/kg
 */
export function getFTPCategory(wattsPerKg: number): string {
  if (wattsPerKg < 2.0) return 'untrained'
  if (wattsPerKg < 2.5) return 'fair'
  if (wattsPerKg < 3.0) return 'moderate'
  if (wattsPerKg < 3.5) return 'good'
  if (wattsPerKg < 4.0) return 'very-good'
  if (wattsPerKg < 4.5) return 'excellent'
  if (wattsPerKg < 5.0) return 'exceptional'
  return 'world-class'
}

/**
 * Calculate heart rate zones from max HR
 */
export function calculateHRZones(maxHR: number): { zone: number; min: number; max: number }[] {
  return [
    { zone: 1, min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
    { zone: 2, min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
    { zone: 3, min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
    { zone: 4, min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) },
    { zone: 5, min: Math.round(maxHR * 0.9), max: maxHR },
  ]
}

/**
 * Estimate max heart rate from age
 */
export function estimateMaxHR(age: number): number {
  return 220 - age
}

/**
 * Calculate power zones from FTP
 */
export function calculatePowerZones(ftp: number): { zone: number; min: number; max: number }[] {
  return [
    { zone: 1, min: 0, max: Math.round(ftp * 0.55) },
    { zone: 2, min: Math.round(ftp * 0.55), max: Math.round(ftp * 0.75) },
    { zone: 3, min: Math.round(ftp * 0.75), max: Math.round(ftp * 0.9) },
    { zone: 4, min: Math.round(ftp * 0.9), max: Math.round(ftp * 1.05) },
    { zone: 5, min: Math.round(ftp * 1.05), max: Math.round(ftp * 1.2) },
    { zone: 6, min: Math.round(ftp * 1.2), max: Math.round(ftp * 1.5) },
    { zone: 7, min: Math.round(ftp * 1.5), max: 9999 },
  ]
}

/**
 * Calculate coefficient of variation (CV) for pace variability
 */
export function calculateCV(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 0
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  return (stdDev / mean) * 100
}

/**
 * Calculate streak of consecutive weeks with activity
 */
export function calculateStreak(activityDates: Date[]): {
  currentStreak: number
  longestStreak: number
  currentStreakStart: Date | null
} {
  if (activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, currentStreakStart: null }
  }

  // Sort dates descending
  const sorted = [...activityDates].sort((a, b) => b.getTime() - a.getTime())

  // Group by week
  const weekSet = new Set<string>()
  sorted.forEach(date => {
    const weekStart = getWeekStart(date)
    weekSet.add(weekStart.toISOString())
  })

  const weeks = Array.from(weekSet)
    .map(iso => new Date(iso))
    .sort((a, b) => b.getTime() - a.getTime())

  if (weeks.length === 0) {
    return { currentStreak: 0, longestStreak: 0, currentStreakStart: null }
  }

  // Calculate current streak
  let currentStreak = 0
  let currentStreakStart: Date | null = null
  const now = new Date()
  const currentWeekStart = getWeekStart(now)
  const oneWeek = 7 * 24 * 60 * 60 * 1000

  for (let i = 0; i < weeks.length; i++) {
    const weekDiff = (currentWeekStart.getTime() - weeks[i].getTime()) / oneWeek
    if (Math.abs(weekDiff - i) < 0.1) {
      currentStreak++
      currentStreakStart = weeks[i]
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < weeks.length; i++) {
    const diff = (weeks[i - 1].getTime() - weeks[i].getTime()) / oneWeek
    if (Math.abs(diff - 1) < 0.1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return { currentStreak, longestStreak, currentStreakStart }
}

/**
 * Get the start of the week (Monday) for a date
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0
  return ((newValue - oldValue) / oldValue) * 100
}

/**
 * Determine trend from percentage change
 */
export function determineTrend(percentChange: number): 'crushing-it' | 'improving' | 'stable' | 'declining' | 'couch-mode' {
  if (percentChange >= 50) return 'crushing-it'
  if (percentChange >= 10) return 'improving'
  if (percentChange >= -10) return 'stable'
  if (percentChange >= -50) return 'declining'
  return 'couch-mode'
}

/**
 * Calculate route repetition rate using approximate location matching
 */
export function calculateRouteRepetition(
  activities: Array<{ startLat: number | null; startLng: number | null }>
): number {
  const validActivities = activities.filter(a => a.startLat && a.startLng)
  if (validActivities.length < 2) return 0

  const locationCounts = new Map<string, number>()

  validActivities.forEach(activity => {
    // Round to ~100m precision
    const key = `${Math.round(activity.startLat! * 1000)},${Math.round(activity.startLng! * 1000)}`
    locationCounts.set(key, (locationCounts.get(key) || 0) + 1)
  })

  const repeatedActivities = Array.from(locationCounts.values())
    .filter(count => count > 1)
    .reduce((sum, count) => sum + count, 0)

  return (repeatedActivities / validActivities.length) * 100
}
