# Usage Tracking Documentation

## Overview
SenScript tracks "minutes listening" as the primary usage metric, providing insights into user engagement while maintaining privacy.

## How Minutes Are Calculated

### Client-Side Tracking
The `ListeningMeter` class tracks active listening time:

```javascript
// Starts when user begins recording
listeningMeter.start();

// Accumulates seconds while active
// Pauses when tab is hidden
// Resumes when tab is visible again

// Stops and sends final ping
listeningMeter.stop();
```

### Batching Strategy
- Accumulates seconds locally
- Sends ping every 45 seconds
- Includes metadata: source, timestamp, user agent
- Handles page visibility changes
- Sends final ping on page unload

## API Contracts

### POST /api/usage/ping
Records usage data for the current user.

**Request:**
```json
{
  "seconds": 120,        // 0-300 seconds
  "source": "web",       // Platform identifier
  "meta": {              // Optional metadata
    "userAgent": "...",
    "language": "en-US",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "minutes": 2  // Converted from seconds
}
```

**Rate Limiting:** Max 1 request per 15 seconds per user

### GET /api/usage/summary
Retrieves usage statistics for a time range.

**Query Parameters:**
- `range`: "day" | "week" | "month"

**Response:**
```json
{
  "range": "day",
  "totalMinutes": 45,
  "totalSessions": 3,
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-01T23:59:59Z"
}
```

## Data Models

### UsageDaily
Aggregated daily usage per user:
```prisma
model UsageDaily {
  userId    String
  date      DateTime  // UTC midnight
  minutes   Int
  @@unique([userId, date])
}
```

### ListeningSession
Individual listening sessions for audit:
```prisma
model ListeningSession {
  userId    String
  source    String    // "web", "ios", "desktop"
  startedAt DateTime
  endedAt   DateTime?
  minutes   Int
  meta      Json?
}
```

## Aggregation Model

```
User starts listening
    ↓
[Client] Accumulates seconds locally
    ↓
[Client] Sends ping every 45s
    ↓
[Server] Validates & rate limits
    ↓
[Server] Converts seconds → minutes
    ↓
[Database] Atomic upsert to UsageDaily
    ↓
[Database] Create/extend ListeningSession (if ≥60s)
```

## Audit Trail
- Every ping is logged with timestamp
- Sessions track start/end times
- Daily aggregates for reporting
- Metadata preserved for debugging

## Client Implementation

### Initialize Meter
```javascript
const listeningMeter = new ListeningMeter(auth);
listeningMeter.init();
```

### Start/Stop Tracking
```javascript
// When recording starts
listeningMeter.start();

// When recording stops
listeningMeter.stop();
```

### Get Current Status
```javascript
const status = listeningMeter.getStatus();
console.log(`Active: ${status.isActive}`);
console.log(`Session: ${status.sessionDuration}s`);
console.log(`Accumulated: ${status.accumulatedSeconds}s`);
```

### Display Formatted Time
```javascript
const time = listeningMeter.getFormattedTime();
// Returns: "5m 30s" or "1h 15m 20s"
```

## Privacy & Security
- No audio content is stored
- Only duration metrics tracked
- User-scoped data isolation
- UTC timestamps for consistency
- Automatic cleanup of old sessions
- Rate limiting prevents abuse

## Testing Usage Tracking
1. Sign in to the app
2. Start recording/listening
3. Check console for "📊 Usage ping sent" messages
4. Open Settings → Usage tab
5. Verify minutes are incrementing
6. Check different time ranges (day/week/month)