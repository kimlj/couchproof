import { prisma } from '@/lib/prisma'
import {
  UserStatsForAI,
  UserIdentity,
  UserSocial,
  UserVolume,
  VolumeStats,
  UserComparisons,
  UserActivities,
  UserTiming,
  UserConsistency,
  UserRecords,
  UserGear,
  UserBody,
  UserHeartRate,
  UserPower,
  UserSegments,
  UserEffort,
  UserExploration,
  UserQuirks,
  UserTraits,
  UserContext,
  UserCulture,
  FunComparisons,
  StatsMetadata,
  Archetype,
} from '@/types'
import {
  calculateEverestsClimbed,
  calculateMarathonsEquivalent,
  calculateStreak,
  calculatePercentChange,
  determineTrend,
  calculateRouteRepetition,
  calculateCV,
  getFTPCategory,
} from '@/lib/utils/calculations'
import { DAYS_OF_WEEK, TIME_SLOTS } from '@/lib/utils/constants'

/**
 * Calculate complete user stats for AI generation
 */
export async function calculateUserStats(userId: string): Promise<UserStatsForAI> {
  // Fetch user with all related data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      athleteStats: true,
      zones: true,
      gear: true,
      activities: {
        orderBy: { startDate: 'desc' },
        take: 1000, // Last 1000 activities
      },
      personality: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const activities = user.activities
  const now = new Date()

  // Calculate all stats sections
  const identity = calculateIdentity(user)
  const social = calculateSocial(user, activities)
  const volume = calculateVolume(activities)
  const comparisons = calculateComparisons(activities)
  const activitiesStats = calculateActivitiesStats(activities)
  const timing = calculateTiming(activities)
  const consistency = calculateConsistency(activities)
  const records = calculateRecords(activities)
  const gear = calculateGear(user.gear)
  const body = calculateBody(user)
  const heartRate = calculateHeartRate(user.zones, activities)
  const power = calculatePower(user, activities)
  const segments = calculateSegments(activities)
  const effort = calculateEffort(activities)
  const exploration = calculateExploration(activities, user)
  const quirks = calculateQuirks(activities)
  const traits = calculateTraits({
    timing,
    consistency,
    effort,
    exploration,
    social,
    gear,
    heartRate,
    power,
    activities: activitiesStats,
  })
  const context = calculateContext(user, activities, consistency)
  const culture = calculateCulture(user)
  const funComparisons = calculateFunComparisons(volume)
  const archetype = determineArchetype(traits)

  // Get primary and secondary traits
  const traitEntries = Object.entries(traits) as [string, number][]
  const sortedTraits = traitEntries.sort((a, b) => b[1] - a[1])
  const primaryTraits = sortedTraits.slice(0, 3).map(([name]) => name)
  const secondaryTraits = sortedTraits.slice(3, 6).map(([name]) => name)

  const metadata: StatsMetadata = {
    calculatedAt: now,
    activitiesAnalyzed: activities.length,
    oldestActivityDate: activities.length > 0 ? activities[activities.length - 1].startDate : null,
    newestActivityDate: activities.length > 0 ? activities[0].startDate : null,
    dataCompleteness: calculateDataCompleteness(user, activities),
  }

  return {
    identity,
    social,
    volume,
    comparisons,
    activities: activitiesStats,
    timing,
    consistency,
    records,
    gear,
    body,
    heartRate,
    power,
    segments,
    effort,
    exploration,
    quirks,
    traits,
    primaryTraits,
    secondaryTraits,
    archetype,
    funComparisons,
    context,
    culture,
    metadata,
  }
}

function calculateIdentity(user: any): UserIdentity {
  const accountAgeDays = user.stravaCreatedAt
    ? Math.floor((Date.now() - new Date(user.stravaCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    sex: user.sex,
    city: user.city,
    state: user.state,
    country: user.country,
    memberSince: user.stravaCreatedAt,
    accountAgeDays,
    avatarUrl: user.avatarUrl,
    hasStravaSummit: user.stravaPremium || false,
  }
}

function calculateSocial(user: any, activities: any[]): UserSocial {
  const totalKudos = activities.reduce((sum, a) => sum + (a.kudosCount || 0), 0)
  const avgKudos = activities.length > 0 ? totalKudos / activities.length : 0

  const mostKudosed = activities.reduce((max, a) =>
    (a.kudosCount || 0) > (max?.kudosCount || 0) ? a : max,
    null as any
  )

  const followerCount = user.followerCount || 0
  const friendCount = user.friendCount || 0

  let socialType: UserSocial['socialType'] = 'unknown'
  if (followerCount > 100 || avgKudos > 20) socialType = 'social-butterfly'
  else if (followerCount > 20 || avgKudos > 5) socialType = 'balanced'
  else if (followerCount < 10 && avgKudos < 3) socialType = 'lone-wolf'

  return {
    followerCount,
    friendCount,
    totalKudosReceived: totalKudos,
    averageKudosPerActivity: Math.round(avgKudos * 10) / 10,
    mostKudosedActivity: mostKudosed ? {
      id: mostKudosed.stravaId?.toString() || mostKudosed.id,
      name: mostKudosed.name,
      kudosCount: mostKudosed.kudosCount,
      date: mostKudosed.startDate,
    } : null,
    socialType,
  }
}

function calculateVolume(activities: any[]): UserVolume {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    allTime: calculateVolumeStats(activities),
    ytd: calculateVolumeStats(activities.filter(a => new Date(a.startDate) >= startOfYear)),
    recent4Weeks: calculateVolumeStats(activities.filter(a => new Date(a.startDate) >= fourWeeksAgo)),
    thisMonth: calculateVolumeStats(activities.filter(a => new Date(a.startDate) >= startOfMonth)),
  }
}

function calculateVolumeStats(activities: any[]): VolumeStats {
  const rides = activities.filter(a => ['Ride', 'VirtualRide', 'EBikeRide', 'MountainBikeRide', 'GravelRide'].includes(a.type))
  const runs = activities.filter(a => ['Run', 'VirtualRun', 'TrailRun'].includes(a.type))
  const swims = activities.filter(a => a.type === 'Swim')

  return {
    rides: {
      activities: rides.length,
      distance: rides.reduce((sum, a) => sum + (a.distance || 0), 0),
      time: rides.reduce((sum, a) => sum + (a.movingTime || 0), 0),
      elevation: rides.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
    },
    runs: {
      activities: runs.length,
      distance: runs.reduce((sum, a) => sum + (a.distance || 0), 0),
      time: runs.reduce((sum, a) => sum + (a.movingTime || 0), 0),
      elevation: runs.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
    },
    swims: {
      activities: swims.length,
      distance: swims.reduce((sum, a) => sum + (a.distance || 0), 0),
      time: swims.reduce((sum, a) => sum + (a.movingTime || 0), 0),
    },
    total: {
      activities: activities.length,
      distance: activities.reduce((sum, a) => sum + (a.distance || 0), 0),
      time: activities.reduce((sum, a) => sum + (a.movingTime || 0), 0),
      elevation: activities.reduce((sum, a) => sum + (a.totalElevationGain || 0), 0),
    },
  }
}

function calculateComparisons(activities: any[]): UserComparisons {
  const now = new Date()

  // Last month vs previous month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0)

  const lastMonthActivities = activities.filter(a => {
    const d = new Date(a.startDate)
    return d >= lastMonthStart && d <= lastMonthEnd
  })
  const prevMonthActivities = activities.filter(a => {
    const d = new Date(a.startDate)
    return d >= prevMonthStart && d <= prevMonthEnd
  })

  const lastMonthDistance = lastMonthActivities.reduce((s, a) => s + (a.distance || 0), 0)
  const prevMonthDistance = prevMonthActivities.reduce((s, a) => s + (a.distance || 0), 0)

  const vsLastMonth = {
    distanceChange: calculatePercentChange(prevMonthDistance, lastMonthDistance),
    activitiesChange: calculatePercentChange(prevMonthActivities.length, lastMonthActivities.length),
    trend: determineTrend(calculatePercentChange(prevMonthDistance, lastMonthDistance)) as any,
  }

  // This year vs last year (same period)
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
  const lastYearSameDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  const thisYearActivities = activities.filter(a => new Date(a.startDate) >= yearStart)
  const lastYearSamePeriod = activities.filter(a => {
    const d = new Date(a.startDate)
    return d >= lastYearStart && d <= lastYearSameDate
  })

  const thisYearDistance = thisYearActivities.reduce((s, a) => s + (a.distance || 0), 0)
  const lastYearDistance = lastYearSamePeriod.reduce((s, a) => s + (a.distance || 0), 0)

  const vsLastYear = {
    distanceChange: calculatePercentChange(lastYearDistance, thisYearDistance),
    activitiesChange: calculatePercentChange(lastYearSamePeriod.length, thisYearActivities.length),
    trend: determineTrend(calculatePercentChange(lastYearDistance, thisYearDistance)) as any,
  }

  // Same month last year
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const sameMonthLastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), 1)
  const sameMonthLastYearEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0)

  const thisMonthActivities = activities.filter(a => new Date(a.startDate) >= thisMonthStart)
  const sameMonthLastYear = activities.filter(a => {
    const d = new Date(a.startDate)
    return d >= sameMonthLastYearStart && d <= sameMonthLastYearEnd
  })

  const thisMonthDistance = thisMonthActivities.reduce((s, a) => s + (a.distance || 0), 0)
  const sameMonthLastYearDist = sameMonthLastYear.reduce((s, a) => s + (a.distance || 0), 0)

  return {
    vsLastMonth,
    vsLastYear,
    vsSameMonthLastYear: {
      distanceChange: calculatePercentChange(sameMonthLastYearDist, thisMonthDistance),
      activitiesChange: calculatePercentChange(sameMonthLastYear.length, thisMonthActivities.length),
      trend: determineTrend(calculatePercentChange(sameMonthLastYearDist, thisMonthDistance)) as any,
    },
  }
}

function calculateActivitiesStats(activities: any[]): UserActivities {
  const types: { [key: string]: { count: number; distance: number; time: number } } = {}

  activities.forEach(a => {
    if (!types[a.type]) {
      types[a.type] = { count: 0, distance: 0, time: 0 }
    }
    types[a.type].count++
    types[a.type].distance += a.distance || 0
    types[a.type].time += a.movingTime || 0
  })

  const primaryType = Object.entries(types)
    .sort((a, b) => b[1].count - a[1].count)[0]?.[0] || null

  const commuteCount = activities.filter(a => a.commute).length
  const trainerCount = activities.filter(a => a.trainer).length

  const weeksSinceFirst = activities.length > 0
    ? Math.ceil((Date.now() - new Date(activities[activities.length - 1].startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : 1

  return {
    types,
    primaryType,
    variety: Object.keys(types).length,
    lastActivity: activities[0] ? {
      id: activities[0].stravaId?.toString() || activities[0].id,
      name: activities[0].name,
      type: activities[0].type,
      date: activities[0].startDate,
    } : null,
    averagePerWeek: Math.round((activities.length / weeksSinceFirst) * 10) / 10,
    commuteCount,
    trainerCount,
  }
}

function calculateTiming(activities: any[]): UserTiming {
  const dayDistribution = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 }
  const timeSlotDistribution = { predawn: 0, morning: 0, afternoon: 0, evening: 0 }
  const seasonalPattern = { spring: 0, summer: 0, fall: 0, winter: 0, preferredSeason: 'none' as const }

  let earliestStart: Date | null = null
  let latestStart: Date | null = null

  activities.forEach(a => {
    const date = new Date(a.startDate)
    const day = date.getDay()
    const hour = date.getHours()
    const month = date.getMonth()

    // Day distribution
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
    dayDistribution[dayNames[day]]++

    // Time slot
    if (hour < 6) timeSlotDistribution.predawn++
    else if (hour < 12) timeSlotDistribution.morning++
    else if (hour < 18) timeSlotDistribution.afternoon++
    else timeSlotDistribution.evening++

    // Season
    if (month >= 2 && month <= 4) seasonalPattern.spring++
    else if (month >= 5 && month <= 7) seasonalPattern.summer++
    else if (month >= 8 && month <= 10) seasonalPattern.fall++
    else seasonalPattern.winter++

    // Earliest/latest
    if (!earliestStart || hour < earliestStart.getHours()) earliestStart = date
    if (!latestStart || hour > latestStart.getHours()) latestStart = date
  })

  // Determine favorite day
  const maxDay = Object.entries(dayDistribution).sort((a, b) => b[1] - a[1])[0]
  const favoriteDay = maxDay[1] > 0 ? maxDay[0].charAt(0).toUpperCase() + maxDay[0].slice(1) : null

  // Determine favorite time slot
  const maxSlot = Object.entries(timeSlotDistribution).sort((a, b) => b[1] - a[1])[0]
  const favoriteTimeSlot = maxSlot[1] > 0 ? maxSlot[0] as any : null

  // Determine preferred season
  const maxSeason = Object.entries(seasonalPattern)
    .filter(([k]) => k !== 'preferredSeason')
    .sort((a, b) => (b[1] as number) - (a[1] as number))[0]
  seasonalPattern.preferredSeason = maxSeason[1] as number > 0 ? maxSeason[0] as any : 'none'

  const weekdayCount = dayDistribution.monday + dayDistribution.tuesday + dayDistribution.wednesday +
                       dayDistribution.thursday + dayDistribution.friday
  const weekendCount = dayDistribution.saturday + dayDistribution.sunday

  return {
    favoriteDay,
    favoriteTimeSlot,
    dayDistribution,
    timeSlotDistribution,
    weekdayCount,
    weekendCount,
    isWeekendWarrior: weekendCount > weekdayCount * 0.6,
    earliestEverStart: earliestStart,
    latestEverStart: latestStart,
    seasonalPattern,
  }
}

function calculateConsistency(activities: any[]): UserConsistency {
  if (activities.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakStatus: 'none',
      activeDaysPerWeek: 0,
      mostActiveWeek: null,
      longestBreak: 0,
      currentBreak: 0,
      isComingBack: false,
      isOnFire: false,
    }
  }

  const dates = activities.map(a => new Date(a.startDate))
  const streakData = calculateStreak(dates)

  // Calculate active days per week (last 4 weeks)
  const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
  const recentActivities = activities.filter(a => new Date(a.startDate) >= fourWeeksAgo)
  const activeDays = new Set(recentActivities.map(a => new Date(a.startDate).toDateString())).size
  const activeDaysPerWeek = Math.round((activeDays / 4) * 10) / 10

  // Calculate longest break
  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime())
  let longestBreak = 0
  for (let i = 1; i < sortedDates.length; i++) {
    const gap = Math.floor((sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 60 * 60 * 24))
    if (gap > longestBreak) longestBreak = gap
  }

  // Current break
  const currentBreak = Math.floor((Date.now() - dates[0].getTime()) / (1000 * 60 * 60 * 24))

  // Streak status
  let streakStatus: UserConsistency['streakStatus'] = 'none'
  if (streakData.currentStreak >= 7) streakStatus = 'on-fire'
  else if (streakData.currentStreak >= 3) streakStatus = 'active'
  else if (currentBreak > 7) streakStatus = 'broken'

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    streakStatus,
    activeDaysPerWeek,
    mostActiveWeek: null, // Would need more complex calculation
    longestBreak,
    currentBreak,
    isComingBack: longestBreak > 30 && currentBreak < 7,
    isOnFire: streakData.currentStreak >= 7 || activeDaysPerWeek >= 5,
  }
}

function calculateRecords(activities: any[]): UserRecords {
  if (activities.length === 0) {
    return {
      longestDistance: null,
      biggestClimb: null,
      fastestPace: null,
      longestDuration: null,
      highestPower: null,
      highestHeartRate: null,
      mostKudos: null,
    }
  }

  const longestDist = activities.reduce((max, a) =>
    (a.distance || 0) > (max?.distance || 0) ? a : max, null as any)

  const biggestClimb = activities.reduce((max, a) =>
    (a.totalElevationGain || 0) > (max?.totalElevationGain || 0) ? a : max, null as any)

  const fastestPace = activities
    .filter(a => a.averageSpeed && a.averageSpeed > 0)
    .reduce((max, a) => (a.averageSpeed || 0) > (max?.averageSpeed || 0) ? a : max, null as any)

  const longestDuration = activities.reduce((max, a) =>
    (a.movingTime || 0) > (max?.movingTime || 0) ? a : max, null as any)

  const highestPower = activities
    .filter(a => a.averageWatts)
    .reduce((max, a) => (a.averageWatts || 0) > (max?.averageWatts || 0) ? a : max, null as any)

  const highestHR = activities
    .filter(a => a.maxHeartrate)
    .reduce((max, a) => (a.maxHeartrate || 0) > (max?.maxHeartrate || 0) ? a : max, null as any)

  const mostKudos = activities.reduce((max, a) =>
    (a.kudosCount || 0) > (max?.kudosCount || 0) ? a : max, null as any)

  return {
    longestDistance: longestDist ? {
      value: longestDist.distance,
      activityId: longestDist.stravaId?.toString() || longestDist.id,
      date: longestDist.startDate,
      type: longestDist.type,
    } : null,
    biggestClimb: biggestClimb ? {
      value: biggestClimb.totalElevationGain,
      activityId: biggestClimb.stravaId?.toString() || biggestClimb.id,
      date: biggestClimb.startDate,
    } : null,
    fastestPace: fastestPace ? {
      value: fastestPace.averageSpeed,
      activityId: fastestPace.stravaId?.toString() || fastestPace.id,
      date: fastestPace.startDate,
      type: fastestPace.type,
    } : null,
    longestDuration: longestDuration ? {
      value: longestDuration.movingTime,
      activityId: longestDuration.stravaId?.toString() || longestDuration.id,
      date: longestDuration.startDate,
      type: longestDuration.type,
    } : null,
    highestPower: highestPower ? {
      value: highestPower.averageWatts,
      activityId: highestPower.stravaId?.toString() || highestPower.id,
      date: highestPower.startDate,
    } : null,
    highestHeartRate: highestHR ? {
      value: highestHR.maxHeartrate,
      activityId: highestHR.stravaId?.toString() || highestHR.id,
      date: highestHR.startDate,
    } : null,
    mostKudos: mostKudos ? {
      value: mostKudos.kudosCount,
      activityId: mostKudos.stravaId?.toString() || mostKudos.id,
      date: mostKudos.startDate,
      name: mostKudos.name,
    } : null,
  }
}

function calculateGear(gear: any[]): UserGear {
  const bikes = gear.filter(g => g.gearType === 'bike').map(g => ({
    id: g.stravaId || g.id,
    name: g.name,
    brandName: g.brandName,
    modelName: g.modelName,
    frameType: g.frameType,
    distance: g.distance || 0,
    primary: g.primary || false,
    retired: g.retired || false,
  }))

  const shoes = gear.filter(g => g.gearType === 'shoe').map(g => ({
    id: g.stravaId || g.id,
    name: g.name,
    brandName: g.brandName,
    modelName: g.modelName,
    distance: g.distance || 0,
    primary: g.primary || false,
    retired: g.retired || false,
  }))

  const activeBikes = bikes.filter(b => !b.retired)
  const activeShoes = shoes.filter(s => !s.retired)

  let gearRotation: UserGear['gearRotation'] = 'none'
  if (activeBikes.length > 3 || activeShoes.length > 3) gearRotation = 'varied'
  else if (activeBikes.length > 1 || activeShoes.length > 1) gearRotation = 'focused'
  else if (activeBikes.length === 1 || activeShoes.length === 1) gearRotation = 'single'

  return {
    bikes,
    shoes,
    totalBikes: bikes.length,
    activeShoes: activeShoes.length,
    primaryBike: bikes.find(b => b.primary) || bikes[0] || null,
    primaryShoe: shoes.find(s => s.primary) || shoes[0] || null,
    isNPlusOneGuy: bikes.length >= 3,
    gearRotation,
  }
}

function calculateBody(user: any): UserBody {
  const weight = user.weight
  const ftp = user.ftp
  const wattsPerKg = weight && ftp ? ftp / weight : null
  const ftpCategory = wattsPerKg ? getFTPCategory(wattsPerKg) : null

  return {
    weight,
    ftp,
    wattsPerKg: wattsPerKg ? Math.round(wattsPerKg * 100) / 100 : null,
    ftpCategory: ftpCategory as any,
    measurementPreference: user.measurementPreference === 'feet' ? 'imperial' : 'metric',
  }
}

function calculateHeartRate(zones: any, activities: any[]): UserHeartRate {
  const hrActivities = activities.filter(a => a.averageHeartrate)
  if (!zones || hrActivities.length === 0) {
    return {
      hasData: false,
      zones: null,
      timeInZones: null,
      dominantZone: null,
      zoneProfile: null,
      hardEffortFrequency: 0,
    }
  }

  // Count activities in high HR zones (estimated based on average HR)
  const maxHR = zones.hrMax || 190
  const hardEffortCount = hrActivities.filter(a =>
    a.averageHeartrate > maxHR * 0.8
  ).length
  const hardEffortFrequency = hrActivities.length > 0
    ? Math.round((hardEffortCount / hrActivities.length) * 100)
    : 0

  let zoneProfile: UserHeartRate['zoneProfile'] = 'balanced'
  if (hardEffortFrequency > 50) zoneProfile = 'redliner'
  else if (hardEffortFrequency > 30) zoneProfile = 'threshold-lover'
  else if (hardEffortFrequency < 10) zoneProfile = 'easy-rider'

  return {
    hasData: true,
    zones: {
      zone1: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
      zone2: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
      zone3: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
      zone4: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.9) },
      zone5: { min: Math.round(maxHR * 0.9), max: maxHR },
    },
    timeInZones: null, // Would need stream data to calculate
    dominantZone: null,
    zoneProfile,
    hardEffortFrequency,
  }
}

function calculatePower(user: any, activities: any[]): UserPower {
  const powerActivities = activities.filter(a => a.averageWatts)
  if (powerActivities.length === 0) {
    return {
      hasData: false,
      ftp: null,
      zones: null,
      timeInPowerZones: null,
      powerProfile: null,
      peakPowers: { fiveSecond: null, oneMinute: null, fiveMinute: null, twentyMinute: null },
    }
  }

  const ftp = user.ftp

  return {
    hasData: true,
    ftp,
    zones: ftp ? {
      zone1: { min: 0, max: Math.round(ftp * 0.55) },
      zone2: { min: Math.round(ftp * 0.55), max: Math.round(ftp * 0.75) },
      zone3: { min: Math.round(ftp * 0.75), max: Math.round(ftp * 0.9) },
      zone4: { min: Math.round(ftp * 0.9), max: Math.round(ftp * 1.05) },
      zone5: { min: Math.round(ftp * 1.05), max: Math.round(ftp * 1.2) },
      zone6: { min: Math.round(ftp * 1.2), max: Math.round(ftp * 1.5) },
      zone7: { min: Math.round(ftp * 1.5), max: 9999 },
    } : null,
    timeInPowerZones: null,
    powerProfile: null, // Would need more analysis
    peakPowers: { fiveSecond: null, oneMinute: null, fiveMinute: null, twentyMinute: null },
  }
}

function calculateSegments(activities: any[]): UserSegments {
  const segmentActivities = activities.filter(a => a.segmentEfforts)
  const totalEfforts = segmentActivities.reduce((sum, a) =>
    sum + (a.segmentEfforts?.length || 0), 0)
  const komCount = activities.reduce((sum, a) => sum + (a.prCount || 0), 0)

  return {
    hasData: totalEfforts > 0,
    starredCount: 0, // Would need separate API call
    totalEfforts,
    komCount,
    mostAttempted: null, // Would need segment analysis
    nemesis: null,
    segmentHunterScore: Math.min(100, totalEfforts),
  }
}

function calculateEffort(activities: any[]): UserEffort {
  const speedActivities = activities.filter(a => a.averageSpeed && a.averageSpeed > 0)
  if (speedActivities.length === 0) {
    return {
      averagePace: null,
      averageSpeed: null,
      paceVariability: null,
      paceImprovement: 0,
      terrainPreference: null,
    }
  }

  const avgSpeed = speedActivities.reduce((sum, a) => sum + a.averageSpeed, 0) / speedActivities.length
  const speeds = speedActivities.map(a => a.averageSpeed)
  const cv = calculateCV(speeds)

  let paceVariability: UserEffort['paceVariability'] = 'consistent'
  if (cv < 10) paceVariability = 'very-consistent'
  else if (cv < 20) paceVariability = 'consistent'
  else if (cv < 40) paceVariability = 'variable'
  else paceVariability = 'erratic'

  // Determine terrain preference based on elevation gain per km
  const avgElevPerKm = activities.length > 0
    ? activities.reduce((sum, a) => sum + ((a.totalElevationGain || 0) / ((a.distance || 1) / 1000)), 0) / activities.length
    : 0

  let terrainPreference: UserEffort['terrainPreference'] = 'flat'
  if (avgElevPerKm > 50) terrainPreference = 'mountainous'
  else if (avgElevPerKm > 25) terrainPreference = 'hilly'
  else if (avgElevPerKm > 10) terrainPreference = 'rolling'

  return {
    averagePace: avgSpeed,
    averageSpeed: avgSpeed,
    paceVariability,
    paceImprovement: 0, // Would need trend analysis
    terrainPreference,
  }
}

function calculateExploration(activities: any[], user: any): UserExploration {
  const locatedActivities = activities.filter(a => a.startLat && a.startLng)
  const uniqueLocations = new Set(locatedActivities.map(a =>
    `${Math.round(a.startLat * 100)},${Math.round(a.startLng * 100)}`
  ))
  const uniqueCities = new Set(locatedActivities.map(a => a.locationCity).filter(Boolean))
  const uniqueCountries = new Set(locatedActivities.map(a => a.locationCountry).filter(Boolean))

  const routeRepetition = calculateRouteRepetition(locatedActivities)
  const explorerScore = Math.min(100, uniqueLocations.size * 2)

  return {
    uniqueStartLocations: uniqueLocations.size,
    uniqueCities: uniqueCities.size,
    uniqueCountries: uniqueCountries.size,
    homeCity: user.city,
    routeRepetitionRate: routeRepetition,
    explorerScore,
  }
}

function calculateQuirks(activities: any[]): UserQuirks {
  const hasPreDawn = activities.some(a => new Date(a.startDate).getHours() < 5)
  const hasLateNight = activities.some(a => new Date(a.startDate).getHours() >= 23)

  // Check for holiday activities (simplified - just major US holidays)
  const holidays = ['12-25', '01-01', '07-04', '11-24'] // Christmas, New Year, July 4th, Thanksgiving
  const hasHoliday = activities.some(a => {
    const d = new Date(a.startDate)
    const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return holidays.includes(md)
  })

  // Check for double day (two activities same day)
  const dayMap = new Map<string, number>()
  activities.forEach(a => {
    const day = new Date(a.startDate).toDateString()
    dayMap.set(day, (dayMap.get(day) || 0) + 1)
  })
  const hasDoubleDay = Array.from(dayMap.values()).some(count => count >= 2)

  // Check for emojis in names
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
  const usesEmojis = activities.some(a => emojiRegex.test(a.name || ''))

  // Determine naming style
  const defaultNames = activities.filter(a => /^(Morning|Afternoon|Evening|Lunch|Night)\s+(Run|Ride|Walk|Swim|Hike)/i.test(a.name || '')).length
  const creativeRatio = activities.length > 0 ? 1 - (defaultNames / activities.length) : 0

  let namingStyle: UserQuirks['namingStyle'] = 'default'
  if (creativeRatio > 0.7) namingStyle = 'creative'
  else if (creativeRatio > 0.3) namingStyle = 'mixed'
  else if (creativeRatio > 0.1) namingStyle = 'descriptive'

  return {
    hasPreDawnActivity: hasPreDawn,
    hasLateNightActivity: hasLateNight,
    hasHolidayActivity: hasHoliday,
    namingStyle,
    usesEmojisInNames: usesEmojis,
    hasDoubleDay,
  }
}

function calculateTraits(data: {
  timing: UserTiming
  consistency: UserConsistency
  effort: UserEffort
  exploration: UserExploration
  social: UserSocial
  gear: UserGear
  heartRate: UserHeartRate
  power: UserPower
  activities: UserActivities
}): UserTraits {
  const { timing, consistency, effort, exploration, social, gear, heartRate, power, activities } = data

  return {
    // Timing traits
    dawnWarrior: Math.min(100, (timing.timeSlotDistribution.predawn / (activities.types['Run']?.count || 1)) * 200),
    nightOwl: Math.min(100, (timing.timeSlotDistribution.evening / (activities.types['Run']?.count || 1)) * 100),
    weekendWarrior: timing.isWeekendWarrior ? 80 : 20,

    // Effort traits
    steadyEddy: effort.paceVariability === 'very-consistent' ? 90 : effort.paceVariability === 'consistent' ? 70 : 30,
    surgeMaster: effort.paceVariability === 'variable' || effort.paceVariability === 'erratic' ? 70 : 30,
    elevationJunkie: effort.terrainPreference === 'mountainous' ? 95 : effort.terrainPreference === 'hilly' ? 70 : 30,
    speedDemon: 50, // Would need pace percentile data
    enduranceKing: 50, // Would need duration percentile data

    // Consistency traits
    streakMachine: Math.min(100, consistency.currentStreak * 5),
    burstMode: consistency.activeDaysPerWeek < 2 && activities.types ? 70 : 30,
    improver: 50, // Would need trend analysis

    // Style traits
    explorer: Math.min(100, exploration.explorerScore),
    homeBody: 100 - exploration.explorerScore,
    segmentHunter: 50, // Would need segment data

    // Social traits
    socialButterfly: social.socialType === 'social-butterfly' ? 90 : social.socialType === 'balanced' ? 50 : 20,
    loneWolf: social.socialType === 'lone-wolf' ? 90 : 30,

    // Gear traits
    gearHead: gear.isNPlusOneGuy ? 90 : gear.totalBikes >= 2 ? 60 : 30,
    minimalist: !gear.isNPlusOneGuy && gear.totalBikes <= 1 ? 80 : 30,
    shoeDestroyer: 50, // Would need shoe mileage data

    // HR/Power traits
    heartrateSandbagger: heartRate.zoneProfile === 'easy-rider' ? 80 : 30,
    redlineAddict: heartRate.zoneProfile === 'redliner' ? 90 : 30,
    wattBazooka: power.hasData ? 60 : 20,
    dieselEngine: 50, // Would need normalized power data
  }
}

function calculateContext(user: any, activities: any[], consistency: UserConsistency): UserContext {
  const accountAgeDays = user.stravaCreatedAt
    ? Math.floor((Date.now() - new Date(user.stravaCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const recentPR = activities.some(a =>
    a.prCount > 0 &&
    (Date.now() - new Date(a.startDate).getTime()) < 30 * 24 * 60 * 60 * 1000
  )

  return {
    isNewUser: accountAgeDays < 30,
    isVeteran: accountAgeDays > 365,
    isComingBack: consistency.isComingBack,
    isOnFire: consistency.isOnFire,
    isSlumping: consistency.currentBreak > 14 && !consistency.isComingBack,
    hasRecentPR: recentPR,
    isCouchMode: consistency.currentBreak >= 14,
  }
}

function calculateCulture(user: any): UserCulture {
  const country = user.country?.toLowerCase() || ''

  let region: UserCulture['region'] = 'other'
  if (['us', 'usa', 'united states'].includes(country)) {
    const state = user.state?.toLowerCase() || ''
    if (['ca', 'or', 'wa', 'nv', 'az'].includes(state)) region = 'us-west'
    else if (['ny', 'ma', 'ct', 'nj', 'pa'].includes(state)) region = 'us-east'
    else if (['tx', 'fl', 'ga', 'nc', 'sc'].includes(state)) region = 'us-south'
    else region = 'us-midwest'
  } else if (['uk', 'gb', 'de', 'fr', 'it', 'es', 'nl'].includes(country)) {
    region = 'europe'
  } else if (['jp', 'cn', 'kr', 'in', 'sg'].includes(country)) {
    region = 'asia'
  } else if (['au', 'nz'].includes(country)) {
    region = 'oceania'
  } else if (['br', 'mx', 'ar', 'co'].includes(country)) {
    region = 'latam'
  }

  return {
    region,
    localReferences: [],
    distanceComparisons: [],
    localPeaks: [],
  }
}

function calculateFunComparisons(volume: UserVolume): FunComparisons {
  const totalDistanceKm = volume.allTime.total.distance / 1000
  const totalElevation = volume.allTime.total.elevation

  const everests = calculateEverestsClimbed(totalElevation)
  const marathons = calculateMarathonsEquivalent(volume.allTime.total.distance)

  // Fun distance equivalents
  let distanceEquivalent = ''
  if (totalDistanceKm > 40000) distanceEquivalent = 'around the Earth'
  else if (totalDistanceKm > 10000) distanceEquivalent = 'across the US multiple times'
  else if (totalDistanceKm > 3000) distanceEquivalent = 'LA to New York and back'
  else if (totalDistanceKm > 1000) distanceEquivalent = 'from SF to Seattle'
  else distanceEquivalent = 'a solid road trip'

  // Fun elevation equivalents
  let elevationEquivalent = ''
  if (everests >= 10) elevationEquivalent = `climbed Everest ${Math.floor(everests)} times`
  else if (everests >= 1) elevationEquivalent = `reached the summit of Everest ${Math.floor(everests)} time${everests >= 2 ? 's' : ''}`
  else elevationEquivalent = `${Math.round(everests * 100)}% of the way to Everest summit`

  // Time equivalent
  const totalHours = volume.allTime.total.time / 3600
  let timeEquivalent = ''
  if (totalHours > 1000) timeEquivalent = 'watched all of Game of Thrones 50 times'
  else if (totalHours > 100) timeEquivalent = 'binged every Marvel movie 10 times'
  else if (totalHours > 20) timeEquivalent = 'watched The Lord of the Rings extended edition a few times'
  else timeEquivalent = 'watched a couple movies'

  // Calorie equivalent (rough estimate: 500 cal/hour)
  const totalCalories = totalHours * 500
  const burgers = Math.floor(totalCalories / 500)
  let calorieEquivalent = ''
  if (burgers > 1000) calorieEquivalent = `burned ${burgers} burgers worth of calories`
  else if (burgers > 100) calorieEquivalent = `burned enough calories for ${burgers} burgers`
  else calorieEquivalent = `earned ${burgers} guilt-free burgers`

  return {
    distanceEquivalent,
    elevationEquivalent,
    timeEquivalent,
    calorieEquivalent,
    everestsClimbed: Math.round(everests * 100) / 100,
    marathonsEquivalent: Math.round(marathons * 10) / 10,
  }
}

function determineArchetype(traits: UserTraits): Archetype {
  // Find dominant traits
  const traitPairs = Object.entries(traits) as [string, number][]
  const sorted = traitPairs.sort((a, b) => b[1] - a[1])
  const top3 = sorted.slice(0, 3).map(([name]) => name)

  // Archetype definitions
  const archetypes: Archetype[] = [
    { id: 'dawn-warrior', name: 'Dawn Warrior', emoji: '🌅', description: 'Early riser who conquers the day before others wake' },
    { id: 'night-owl', name: 'Night Owl', emoji: '🦉', description: 'Peak performance under the stars' },
    { id: 'weekend-warrior', name: 'Weekend Warrior', emoji: '⚔️', description: 'Saves it all for Saturday and Sunday' },
    { id: 'streak-machine', name: 'Streak Machine', emoji: '🔥', description: 'Consistency is key, every day counts' },
    { id: 'explorer', name: 'Explorer', emoji: '🗺️', description: 'Always seeking new routes and adventures' },
    { id: 'elevation-junkie', name: 'Elevation Junkie', emoji: '⛰️', description: 'The only way is up' },
    { id: 'speed-demon', name: 'Speed Demon', emoji: '💨', description: 'Built for velocity' },
    { id: 'social-butterfly', name: 'Social Butterfly', emoji: '🦋', description: 'Thrives on kudos and community' },
    { id: 'lone-wolf', name: 'Lone Wolf', emoji: '🐺', description: 'Solo missions only' },
    { id: 'gear-head', name: 'Gear Head', emoji: '⚙️', description: 'N+1 is a lifestyle' },
    { id: 'redline-addict', name: 'Redline Addict', emoji: '❤️‍🔥', description: 'Zone 5 is home' },
    { id: 'couch-proof', name: 'Couch Proof', emoji: '🛋️', description: 'Officially not a couch potato' },
  ]

  // Match archetype based on top traits
  if (top3.includes('dawnWarrior')) return archetypes.find(a => a.id === 'dawn-warrior')!
  if (top3.includes('nightOwl')) return archetypes.find(a => a.id === 'night-owl')!
  if (top3.includes('weekendWarrior')) return archetypes.find(a => a.id === 'weekend-warrior')!
  if (top3.includes('streakMachine')) return archetypes.find(a => a.id === 'streak-machine')!
  if (top3.includes('explorer')) return archetypes.find(a => a.id === 'explorer')!
  if (top3.includes('elevationJunkie')) return archetypes.find(a => a.id === 'elevation-junkie')!
  if (top3.includes('speedDemon')) return archetypes.find(a => a.id === 'speed-demon')!
  if (top3.includes('socialButterfly')) return archetypes.find(a => a.id === 'social-butterfly')!
  if (top3.includes('loneWolf')) return archetypes.find(a => a.id === 'lone-wolf')!
  if (top3.includes('gearHead')) return archetypes.find(a => a.id === 'gear-head')!
  if (top3.includes('redlineAddict')) return archetypes.find(a => a.id === 'redline-addict')!

  // Default archetype
  return archetypes.find(a => a.id === 'couch-proof')!
}

function calculateDataCompleteness(user: any, activities: any[]): number {
  let score = 0
  let total = 0

  // User profile fields
  total += 5
  if (user.name) score++
  if (user.city) score++
  if (user.weight) score++
  if (user.ftp) score++
  if (user.stravaId) score++

  // Activity data quality
  if (activities.length > 0) {
    total += 5
    const withHR = activities.filter(a => a.averageHeartrate).length
    const withPower = activities.filter(a => a.averageWatts).length
    const withLocation = activities.filter(a => a.startLat).length
    const withElevation = activities.filter(a => a.totalElevationGain).length
    const withPolyline = activities.filter(a => a.mapPolyline).length

    if (withHR > activities.length * 0.5) score++
    if (withPower > activities.length * 0.3) score++
    if (withLocation > activities.length * 0.8) score++
    if (withElevation > activities.length * 0.8) score++
    if (withPolyline > activities.length * 0.5) score++
  }

  return Math.round((score / total) * 100)
}
