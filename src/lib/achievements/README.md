# Achievement System

A comprehensive achievement tracking system for Couchproof that rewards users for their fitness activities and encourages consistent engagement.

## Overview

The achievement system tracks user progress across multiple categories and automatically unlocks achievements when requirements are met. It includes:

- **24 Total Achievements** across 4 categories
- **Real-time checking** after activity uploads
- **Progress tracking** for all achievements
- **Tiered rewards** (Bronze, Silver, Gold)
- **API endpoints** for frontend integration

## Architecture

### Files

- `definitions.ts` - All achievement definitions with requirements
- `check.ts` - Logic for checking and unlocking achievements
- `progress.ts` - Progress calculation for all achievements
- `utils.ts` - Helper utilities for formatting and display
- `seed.ts` - Database seeding script
- `index.ts` - Central export point

### API Routes

- `GET /api/achievements` - Get all achievements with progress
- `POST /api/achievements` - Check for new achievements (with optional activityId)
- `GET /api/achievements/[id]` - Get single achievement details

## Achievement Categories

### 1. Milestone Achievements (6 achievements)
Performance-based achievements for significant accomplishments:

- **First Step** (Bronze) - Complete your first activity
- **Century Club** (Gold) - Complete a 100mi/160km ride
- **Marathoner** (Gold) - Run 26.2 miles in one activity
- **Everesting** (Gold) - Climb 8849m total elevation
- **Thousand K Club** (Silver) - Log 1000km total distance
- **Triple Digits** (Silver) - Complete 100 activities

### 2. Quirky Achievements (6 achievements)
Fun, behavior-based achievements:

- **Pre-Dawn Warrior** (Bronze) - Start an activity before 5am
- **Night Owl** (Bronze) - Complete activity after 11pm
- **Holiday Hero** (Bronze) - Exercise on a major holiday
- **Double Dipper** (Bronze) - Two activities in one day
- **Emoji Artist** (Bronze) - Use emojis in 5 activity names
- **Naming Wizard** (Silver) - Create 10 creative activity names

### 3. Streak Achievements (4 achievements)
Consistency-based achievements:

- **Week Warrior** (Bronze) - 7 day activity streak
- **Monthly Maniac** (Silver) - 30 day streak
- **Quarterly Queen** (Gold) - 90 day streak
- **Comeback Kid** (Bronze) - Return after 30+ day break

### 4. Couchproof Achievements (4 achievements)
Brand-aligned achievements celebrating anti-couch behavior:

- **Officially Not a Couch Potato** (Bronze) - Complete any activity
- **Proof of Movement** (Bronze) - 10 activities total
- **Couch Destroyer** (Silver) - 50 activities total
- **Couch Annihilator** (Gold) - 100 activities

## Usage

### Checking Achievements After Activity Upload

```typescript
import { checkAchievements, saveUnlockedAchievements } from '@/lib/achievements';

// After user uploads/syncs an activity
const newlyUnlocked = await checkAchievements(userId, activityId);

if (newlyUnlocked.length > 0) {
  await saveUnlockedAchievements(userId, newlyUnlocked);
  // Show notification to user
}
```

### Getting Achievement Progress

```typescript
import { getAchievementProgress } from '@/lib/achievements';

const progress = await getAchievementProgress(userId);

// Returns array of AchievementProgress objects with:
// - achievement: AchievementDefinition
// - currentValue: number
// - targetValue: number
// - percentage: number
// - isUnlocked: boolean
// - unlockedAt: Date | null
// - activityId: string | null
```

### Getting Next Milestone

```typescript
import { getNextMilestone } from '@/lib/achievements';

const nextGoal = await getNextMilestone(userId);
// Returns the closest unfinished milestone/couchproof achievement
```

### Getting Achievement Stats

```typescript
import { getAchievementStats } from '@/lib/achievements';

const stats = await getAchievementStats(userId);
// Returns:
// - totalAchievements: number
// - unlockedCount: number
// - completionPercentage: number
// - byCategory: { milestone, quirky, streak, couchproof }
// - byTier: { bronze, silver, gold }
```

## Database Schema

### Achievement Table
```prisma
model Achievement {
  id              String    @id @default(cuid())
  code            String    @unique
  name            String
  description     String
  icon            String    // Emoji
  category        String    // milestone | quirky | streak | couchproof
  tier            String    // bronze | silver | gold
  requirement     Json      // { type, value, unit, activityType? }
  sortOrder       Int
}
```

### UserAchievement Table
```prisma
model UserAchievement {
  id              String      @id @default(cuid())
  userId          String
  achievementId   String
  unlockedAt      DateTime
  activityId      String?     // Activity that triggered unlock
  notified        Boolean     // Whether user was notified
}
```

## Seeding the Database

Run the seed script to populate achievements:

```bash
npx ts-node src/lib/achievements/seed.ts
```

Or use the function programmatically:

```typescript
import { seedAchievements } from '@/lib/achievements/seed';
await seedAchievements();
```

## Achievement Requirement Types

Requirements are defined with a type, value, and unit:

```typescript
{
  type: 'activity_count',
  value: 100,
  unit: 'count'
}
```

### Supported Types

- `activity_count` - Total number of activities
- `total_distance` - Cumulative distance in meters
- `total_elevation` - Cumulative elevation gain in meters
- `streak_days` - Consecutive days with activities
- `comeback` - Days in longest break between activities
- `single_activity_distance` - Distance in a single activity (with optional activityType filter)
- `time_based` - Activities at specific times (pre-dawn, late night)
- `special_day` - Activities on holidays
- `activities_per_day` - Multiple activities in one day
- `emoji_in_name` - Activities with emojis in names
- `creative_names` - Activities with custom (non-default) names

## Utilities

### Formatting

```typescript
import { formatProgress, getMotivationalMessage } from '@/lib/achievements/utils';

const progressText = formatProgress(achievement);
// "15km / 1000km (1.5%)"

const message = getMotivationalMessage(achievement);
// "Great progress! Keep going!"
```

### Grouping

```typescript
import { groupByCategory, groupByTier } from '@/lib/achievements/utils';

const byCategory = groupByCategory(achievements);
const byTier = groupByTier(achievements);
```

### Scoring

```typescript
import { calculateAchievementScore } from '@/lib/achievements/utils';

const score = calculateAchievementScore(achievements);
// Bronze: 10pts, Silver: 25pts, Gold: 50pts
```

## Frontend Integration

### Displaying Achievements

```typescript
// Fetch all achievements
const response = await fetch('/api/achievements');
const { achievements, total, unlocked } = await response.json();

// Group by category for display
const byCategory = groupByCategory(achievements);

// Show unlocked achievements first
const sorted = sortByCompletion(achievements);
```

### Checking After Activity Upload

```typescript
// After activity upload
const response = await fetch('/api/achievements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ activityId: '...' }),
});

const { newAchievements, count } = await response.json();

if (count > 0) {
  // Show celebration UI
  showAchievementNotification(newAchievements);
}
```

### Progress Bars

```typescript
const progress = achievement.percentage;

<div className="progress-bar">
  <div
    className="progress-fill"
    style={{ width: `${progress}%` }}
  />
</div>
```

## Extending the System

### Adding New Achievements

1. Add definition to `definitions.ts`:
```typescript
{
  id: 'new_achievement',
  code: 'NEW_ACHIEVEMENT',
  name: 'Achievement Name',
  description: 'Description',
  icon: '🎯',
  category: 'milestone',
  tier: 'gold',
  requirement: {
    type: 'activity_count',
    value: 500,
    unit: 'count',
  },
  sortOrder: 50,
}
```

2. Add checking logic if needed in `check.ts`
3. Update progress calculation if needed in `progress.ts`
4. Run seed script to update database

### Adding New Requirement Types

1. Add type to `AchievementRequirement` interface in `types/index.ts`
2. Implement checking logic in `check.ts`
3. Implement progress calculation in `progress.ts`
4. Update documentation

## Performance Considerations

- Achievement checking is done asynchronously after activity upload
- Progress calculation queries are optimized with proper Prisma selects
- Consider caching frequently accessed progress data
- Use `skipDuplicates` when saving achievements to prevent conflicts

## Future Enhancements

- [ ] Achievement notifications with push/email
- [ ] Leaderboards based on achievement scores
- [ ] Achievement sharing on social media
- [ ] Seasonal/limited-time achievements
- [ ] Achievement badges for profile display
- [ ] Multi-level achievements (e.g., "10K Club", "50K Club", "100K Club")
- [ ] Hidden/secret achievements
- [ ] Team/group achievements
