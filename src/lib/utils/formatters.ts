/**
 * Format distance in meters to a human-readable string
 */
export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const miles = meters / 1609.34
    return miles < 1
      ? `${(miles * 5280).toFixed(0)} ft`
      : `${miles.toFixed(2)} mi`
  }

  return meters < 1000
    ? `${meters.toFixed(0)} m`
    : `${(meters / 1000).toFixed(2)} km`
}

/**
 * Format duration in seconds to a human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Format duration as hours
 */
export function formatDurationHours(seconds: number): string {
  const hours = seconds / 3600
  return `${hours.toFixed(1)} hours`
}

/**
 * Format pace (for running)
 */
export function formatPace(speedMs: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (speedMs <= 0) return '--:--'

  const secondsPerKm = 1000 / speedMs
  const secondsPerMile = 1609.34 / speedMs

  const seconds = unit === 'metric' ? secondsPerKm : secondsPerMile
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  const paceUnit = unit === 'metric' ? '/km' : '/mi'
  return `${mins}:${secs.toString().padStart(2, '0')}${paceUnit}`
}

/**
 * Format speed (for cycling)
 */
export function formatSpeed(speedMs: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (speedMs <= 0) return '0'

  const speedKmh = speedMs * 3.6
  const speedMph = speedMs * 2.237

  return unit === 'metric'
    ? `${speedKmh.toFixed(1)} km/h`
    : `${speedMph.toFixed(1)} mph`
}

/**
 * Format elevation
 */
export function formatElevation(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    return `${(meters * 3.281).toFixed(0)} ft`
  }
  return `${meters.toFixed(0)} m`
}

/**
 * Format date to relative time
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

/**
 * Format time of day
 */
export function formatTime(time: string | Date): string {
  const date = typeof time === 'string' ? new Date(`2000-01-01T${time}`) : time
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format date and time together
 * For startDateLocal fields, use formatActivityDateTime instead
 */
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format activity local time without timezone conversion
 * Use this for startDateLocal which is already in the activity's local timezone
 * but stored as UTC in the database
 */
export function formatActivityDateTime(date: Date | string): string {
  const d = new Date(date)
  // Use UTC methods to avoid double timezone conversion
  // since startDateLocal is stored as UTC but represents local time
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC', // Interpret as UTC to prevent local timezone conversion
  }
  return d.toLocaleString('en-US', options)
}

/**
 * Format account age
 */
export function formatAccountAge(days: number): string {
  if (days < 30) return `${days} days`
  if (days < 365) return `${Math.floor(days / 30)} months`
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  return months > 0 ? `${years}y ${months}m` : `${years} years`
}

/**
 * Format number with comma separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format calories
 */
export function formatCalories(calories: number): string {
  return `${formatNumber(Math.round(calories))} cal`
}
