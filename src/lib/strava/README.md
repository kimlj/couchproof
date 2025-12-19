# Strava OAuth Integration

Complete Strava OAuth integration for Couchproof fitness tracking app with automatic token refresh, activity sync, and webhook support.

## Features

- OAuth 2.0 authorization flow with PKCE
- Automatic token refresh with 5-minute buffer
- Full athlete profile and stats sync
- Paginated activity sync with streams
- Real-time webhook support for activity events
- Gear (bikes/shoes) synchronization
- Comprehensive error handling and rate limiting
- TypeScript type safety throughout

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# Strava OAuth
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Webhook verification
STRAVA_WEBHOOK_VERIFY_TOKEN=your_random_verify_token
```

### 2. Create Strava Application

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Set authorization callback domain to your domain (e.g., `localhost` for dev)
4. Copy Client ID and Client Secret to `.env`

### 3. Configure Webhook (Optional)

To receive real-time activity updates:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://yourdomain.com/api/strava/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

## Usage

### OAuth Flow

1. **Redirect to Strava**:
```typescript
// In your component
<a href="/api/strava/auth?returnTo=/dashboard">
  Connect to Strava
</a>
```

2. **User authorizes on Strava**

3. **Callback handled automatically** at `/api/strava/callback`
   - Exchanges code for tokens
   - Fetches athlete profile and stats
   - Creates/updates user in database
   - Syncs gear (bikes/shoes)
   - Redirects to dashboard

### Manual Activity Sync

```typescript
const response = await fetch('/api/strava/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user_id_here' }),
});

const result = await response.json();
// {
//   success: true,
//   synced: 15,
//   updated: 3,
//   errors: 0,
//   lastActivityDate: "2024-01-15T10:30:00Z"
// }
```

### Using the API Client

```typescript
import { getValidToken } from '@/lib/strava/tokens';
import { getActivities, getActivity, getAthleteStats } from '@/lib/strava/api';

// Get a valid token (auto-refreshes if needed)
const accessToken = await getValidToken(userId);

// Fetch recent activities
const activities = await getActivities(accessToken, {
  per_page: 20,
  page: 1,
});

// Fetch single activity with streams
const activity = await getActivity(accessToken, activityId);

// Get athlete statistics
const stats = await getAthleteStats(accessToken, athleteId);
```

### Token Management

```typescript
import { getValidToken, saveTokens, disconnectStrava } from '@/lib/strava/tokens';

// Get valid token (auto-refresh if expired)
const token = await getValidToken(userId);

// Save new tokens after OAuth
await saveTokens(userId, tokenResponse);

// Disconnect Strava
await disconnectStrava(userId);
```

## API Routes

### `GET /api/strava/auth`
Initiates OAuth flow and redirects to Strava authorization page.

**Query Parameters:**
- `returnTo` (optional): URL to redirect after successful auth

### `GET /api/strava/callback`
Handles OAuth callback from Strava.

**Automatically:**
- Exchanges code for tokens
- Fetches athlete profile
- Saves user data
- Syncs stats and gear
- Redirects to dashboard

### `POST /api/strava/sync`
Manually triggers activity synchronization.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "synced": 15,
  "updated": 3,
  "errors": 0,
  "lastActivityDate": "2024-01-15T10:30:00Z"
}
```

### `GET /api/strava/webhook`
Webhook subscription validation (Strava calls this).

### `POST /api/strava/webhook`
Receives real-time activity events from Strava.

**Handles:**
- Activity create
- Activity update
- Activity delete
- Athlete deauthorization

## Database Schema

The integration uses the existing Prisma schema with these models:

- **User**: Strava tokens, profile data, stats
- **Activity**: Full activity data with streams
- **AthleteStats**: Recent, YTD, and all-time statistics
- **Gear**: Bikes and running shoes

## Rate Limiting

Strava API limits:
- 100 requests per 15 minutes
- 1,000 requests per day

The sync endpoint adds 1-second delays between pages to stay within limits.

## Error Handling

All API calls include:
- Automatic retry on token expiration
- Graceful degradation (e.g., missing streams)
- Detailed error logging
- User-friendly error messages

## Type Safety

All Strava API responses are fully typed:

```typescript
import type {
  StravaAthlete,
  StravaActivity,
  StravaAthleteStats,
  StravaActivityStreams,
} from '@/lib/strava/types';
```

## Webhook Events

The webhook handler processes these events:

### Activity Created
- Fetches full activity details
- Downloads activity streams
- Saves to database

### Activity Updated
- Updates activity metadata
- Updates kudos/comment counts

### Activity Deleted
- Removes activity from database

### Athlete Deauthorized
- Clears Strava tokens
- User needs to reconnect

## Security

- CSRF protection via state parameter
- Webhook verification token
- Token expiry with auto-refresh
- Secure token storage in database

## Development

```bash
# Test OAuth flow
npm run dev
# Visit http://localhost:3000/api/strava/auth

# Test webhook locally with ngrok
ngrok http 3000
# Use ngrok URL for webhook callback
```

## Production Checklist

- [ ] Set production `NEXT_PUBLIC_BASE_URL`
- [ ] Update Strava app callback domain
- [ ] Set up webhook subscription
- [ ] Configure proper authentication middleware
- [ ] Set up monitoring for webhook failures
- [ ] Implement background job for periodic syncs
- [ ] Add rate limit tracking

## Troubleshooting

### Token Refresh Fails
- Check that refresh token is valid
- Verify Strava app credentials
- User may need to reconnect

### Webhook Not Receiving Events
- Verify webhook subscription is active
- Check webhook URL is publicly accessible
- Verify `STRAVA_WEBHOOK_VERIFY_TOKEN` matches

### Activities Not Syncing
- Check Strava token permissions
- Verify user granted `activity:read_all` scope
- Check rate limit hasn't been exceeded

## References

- [Strava API Documentation](https://developers.strava.com/docs/reference/)
- [Strava OAuth Guide](https://developers.strava.com/docs/authentication/)
- [Strava Webhooks](https://developers.strava.com/docs/webhooks/)
