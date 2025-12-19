# Couchproof Project Structure

Complete folder structure for the Couchproof fitness tracking PWA project.

## Technology Stack

- Next.js 14 with App Router
- TypeScript
- Supabase for authentication and database
- Strava API integration
- OpenAI for AI-generated content
- Tailwind CSS + shadcn/ui components

## Directory Structure

```
couchproof/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx          # Signup page
│   │   │   └── callback/
│   │   │       └── page.tsx          # Auth callback handler
│   │   ├── (dashboard)/              # Dashboard routes (protected)
│   │   │   ├── layout.tsx            # Dashboard layout with nav
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── activities/
│   │   │   │   ├── page.tsx          # Activities list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Activity detail
│   │   │   ├── insights/
│   │   │   │   └── page.tsx          # AI insights page
│   │   │   ├── play/
│   │   │   │   └── page.tsx          # Achievements page
│   │   │   └── settings/
│   │   │       └── page.tsx          # Settings page
│   │   └── api/                      # API routes
│   │       ├── auth/
│   │       │   └── [...supabase]/
│   │       │       └── route.ts      # Supabase auth handler
│   │       ├── strava/
│   │       │   ├── connect/
│   │       │   │   └── route.ts      # Strava OAuth initiation
│   │       │   ├── callback/
│   │       │   │   └── route.ts      # Strava OAuth callback
│   │       │   ├── sync/
│   │       │   │   └── route.ts      # Manual sync endpoint
│   │       │   └── webhook/
│   │       │       └── route.ts      # Strava webhook handler
│   │       ├── activities/
│   │       │   ├── route.ts          # GET/POST activities
│   │       │   ├── [id]/
│   │       │   │   └── route.ts      # GET/PATCH/DELETE activity
│   │       │   └── upload/
│   │       │       └── route.ts      # GPX file upload
│   │       ├── stats/
│   │       │   └── route.ts          # User stats calculation
│   │       ├── ai/
│   │       │   ├── roast/
│   │       │   │   └── route.ts      # Generate roast
│   │       │   ├── hype/
│   │       │   │   └── route.ts      # Generate hype
│   │       │   ├── narrative/
│   │       │   │   └── route.ts      # Generate narrative
│   │       │   └── personality/
│   │       │       └── route.ts      # Generate personality analysis
│   │       └── achievements/
│   │           └── route.ts          # User achievements
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx            # Main header with nav
│   │   │   ├── BottomNav.tsx         # Mobile bottom navigation
│   │   │   ├── Sidebar.tsx           # Desktop sidebar
│   │   │   └── PageContainer.tsx     # Page wrapper component
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── StatsOverview.tsx     # Stats cards grid
│   │   │   └── ActivityCalendar.tsx  # Activity heatmap calendar
│   │   ├── activities/               # Activity components
│   │   │   ├── ActivityList.tsx      # List of activities
│   │   │   ├── ActivityCard.tsx      # Single activity card
│   │   │   ├── ActivityDetail.tsx    # Activity detail view
│   │   │   └── ActivityMap.tsx       # Activity route map
│   │   ├── insights/                 # Insights components
│   │   │   ├── PersonalityCard.tsx   # Personality traits display
│   │   │   ├── TraitRadar.tsx        # Radar chart for traits
│   │   │   ├── RoastHypeToggle.tsx   # Toggle between roast/hype
│   │   │   └── AIGenerationCard.tsx  # AI content generation card
│   │   ├── play/                     # Achievements components
│   │   │   ├── AchievementGrid.tsx   # Grid of achievements
│   │   │   ├── AchievementCard.tsx   # Single achievement card
│   │   │   └── ProgressBar.tsx       # Progress indicator
│   │   ├── settings/                 # Settings components
│   │   │   ├── ProfileSettings.tsx   # User profile settings
│   │   │   └── StravaConnection.tsx  # Strava connection management
│   │   └── shared/                   # Shared components
│   │       ├── LoadingSpinner.tsx    # Loading indicator
│   │       ├── EmptyState.tsx        # Empty state placeholder
│   │       ├── ErrorBoundary.tsx     # Error boundary component
│   │       ├── StatCard.tsx          # Reusable stat card
│   │       └── Badge.tsx             # Badge component
│   │
│   ├── lib/                          # Core utilities and logic
│   │   ├── supabase/                 # Supabase clients
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── strava/                   # Strava API integration
│   │   │   ├── api.ts                # Strava API client
│   │   │   ├── sync.ts               # Activity sync logic
│   │   │   ├── tokens.ts             # Token refresh management
│   │   │   └── types.ts              # Strava type definitions
│   │   ├── gpx/                      # GPX file handling
│   │   │   ├── parser.ts             # GPX parser
│   │   │   └── types.ts              # GPX type definitions
│   │   ├── stats/                    # Statistics calculation
│   │   │   ├── calculateUserStats.ts # Main stats calculation
│   │   │   ├── calculateTraits.ts    # Personality traits
│   │   │   ├── calculateTiming.ts    # Timing patterns
│   │   │   └── types.ts              # Stats type definitions
│   │   ├── ai/                       # AI content generation
│   │   │   ├── openai.ts             # OpenAI client
│   │   │   ├── prompts.ts            # AI prompt templates
│   │   │   ├── generate.ts           # Generation functions
│   │   │   └── avoidance.ts          # Repetition avoidance
│   │   ├── achievements/             # Achievement system
│   │   │   ├── definitions.ts        # Achievement definitions
│   │   │   └── check.ts              # Achievement checking logic
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.ts         # Formatting utilities
│   │   │   ├── calculations.ts       # Calculation helpers
│   │   │   └── constants.ts          # App constants
│   │   └── prisma.ts                 # Prisma client singleton
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useUser.ts                # User authentication hook
│   │   ├── useActivities.ts          # Activities data hook
│   │   ├── useStats.ts               # Stats data hook
│   │   └── useAI.ts                  # AI generation hook
│   │
│   └── types/                        # TypeScript type definitions
│       ├── index.ts                  # Shared types
│       └── database.ts               # Database types
│
└── public/                           # Static assets
    ├── icons/                        # PWA icons (various sizes)
    │   └── README.md                 # Icon generation guide
    └── splash/                       # iOS splash screens
        └── README.md                 # Splash screen guide
```

## Key Features

### 1. Authentication & User Management
- Supabase authentication (email/password)
- Protected routes with middleware
- User profile management

### 2. Strava Integration
- OAuth 2.0 connection flow
- Automatic activity sync
- Webhook support for real-time updates
- Token refresh management

### 3. Activity Management
- View all activities
- Detailed activity view with stats
- GPX file upload support
- Activity maps (polyline visualization)

### 4. Statistics & Analytics
- Real-time stats calculation
- Personality trait analysis
- Timing pattern detection
- Streak tracking
- Progress metrics

### 5. AI-Powered Insights
- Personalized roasts (humorous)
- Motivational hype messages
- Activity narratives
- Personality profiles
- Repetition avoidance system

### 6. Gamification
- Achievement system with multiple categories
- Progress tracking
- Unlockable badges
- Rarity tiers (bronze, silver, gold)

### 7. Progressive Web App (PWA)
- Installable on mobile/desktop
- Offline support (planned)
- Push notifications (planned)
- iOS splash screens

## Component Organization

### Layout Components
- **Header**: Main navigation with desktop menu
- **BottomNav**: Mobile bottom navigation bar
- **Sidebar**: Desktop sidebar navigation
- **PageContainer**: Consistent page wrapper with title/description

### Feature Components
Organized by feature area:
- `dashboard/`: Dashboard-specific components
- `activities/`: Activity management components
- `insights/`: AI insights and personality components
- `play/`: Achievement and gamification components
- `settings/`: User settings components
- `shared/`: Reusable components across features

## API Routes

All API routes follow RESTful conventions:

- **Authentication**: `/api/auth/*`
- **Strava**: `/api/strava/*`
- **Activities**: `/api/activities/*`
- **Statistics**: `/api/stats`
- **AI**: `/api/ai/*`
- **Achievements**: `/api/achievements`

## Type Safety

- Full TypeScript coverage
- Database types from Supabase
- Strava API type definitions
- Shared types in `/src/types`

## Next Steps

1. Set up environment variables (.env.local)
2. Configure Supabase project
3. Set up Strava OAuth application
4. Configure OpenAI API key
5. Run database migrations (Prisma/Supabase)
6. Install dependencies and start development server

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Strava
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=your_database_url
```

## Notes

- All placeholder files include TODO comments for implementation
- Database operations use Prisma ORM
- Authentication uses Supabase Auth
- AI content uses OpenAI GPT-4
- Map visualization requires additional library (Mapbox/Leaflet)
- Calendar visualization requires heatmap library
