# SenScript Web App with Authentication

## Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Clerk account (free at clerk.com)
- Chrome browser for testing

### 2. Setup Clerk
1. Create account at https://clerk.com
2. Create new application
3. Copy your API keys from Dashboard

### 3. Environment Setup
Create `.env` file:
```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...  # From Clerk Dashboard
CLERK_SECRET_KEY=sk_test_...       # From Clerk Dashboard

# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3001

# LLM API Keys (existing)
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
DEEPSEEK_API_KEY=...
```

### 4. Install & Initialize
```bash
# Install dependencies
npm install

# Initialize database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 5. Run the Application
```bash
# Start authenticated server
node server-with-auth.js

# Or use existing server (no auth)
node server.js
```

### 6. Access the App
- With Auth: http://localhost:3001 (use index-with-auth.html)
- Without Auth: http://localhost:3001 (use index.html)

## Features

### Authentication
- ✅ Clerk integration for secure sign-in/sign-up
- ✅ Protected API routes
- ✅ User session management
- ✅ Account management UI

### User Settings (Persistent)
- ✅ Auto-start listening preference
- ✅ Default card type (flash/cheat)
- ✅ Output language selection
- ✅ Education level controls
- ✅ API key management

### Usage Tracking
- ✅ Minutes listening metric
- ✅ Daily/weekly/monthly aggregation
- ✅ Real-time usage display
- ✅ Session tracking
- ✅ Automatic batching & retry

### Settings Modal
- ✅ **Usage Tab**: View listening statistics
- ✅ **Preferences Tab**: Configure app behavior
- ✅ **Account Tab**: Manage Clerk account

## File Structure
```
web-app/
├── server-with-auth.js    # Express server with auth
├── server.js              # Original server (no auth)
├── index-with-auth.html   # Main app with auth
├── index.html             # Original app
├── auth.js                # Clerk authentication module
├── listening-meter.js     # Usage tracking client
├── settings-modal.js      # Settings UI component
├── prisma/
│   └── schema.prisma      # Database models
├── docs/
│   ├── auth.md           # Auth documentation
│   └── usage.md          # Usage tracking docs
└── .env                  # Environment variables
```

## Database Models

### UserSettings
Stores user preferences as JSON

### ListeningSession
Tracks individual listening sessions

### UsageDaily
Aggregated daily usage per user

### SettingsAudit
Audit trail for settings changes

## API Endpoints

### Protected Routes (Require Auth)
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update settings
- `POST /api/usage/ping` - Record usage
- `GET /api/usage/summary` - Get usage stats
- `POST /api/generate-card` - Generate flashcard

### Public Routes
- `GET /api/auth/config` - Get Clerk config

## Testing

### Test Authentication
1. Open http://localhost:3001
2. Click "Sign In" or "Create Account"
3. Complete Clerk authentication
4. Verify user menu appears

### Test Settings
1. Click settings icon (⚙️)
2. Change preferences
3. Verify settings persist on reload

### Test Usage Tracking
1. Start recording/listening
2. Check Settings → Usage tab
3. Verify minutes increment
4. Check console for ping messages

## Migration from Non-Auth Version

To migrate existing users:
1. Keep both servers running temporarily
2. Port 3001: New auth version
3. Port 3002: Original version
4. Gradually migrate users
5. Import any existing data

## Troubleshooting

### Auth Issues
- Verify Clerk keys in `.env`
- Check browser console for errors
- Ensure cookies are enabled

### Database Issues
- Run `npx prisma migrate reset` to reset
- Check `dev.db` file exists
- Verify DATABASE_URL in `.env`

### Usage Not Tracking
- Check auth token in network tab
- Verify ListeningMeter is initialized
- Look for rate limit errors (429)

## Production Deployment

1. Use PostgreSQL instead of SQLite:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

2. Set production Clerk keys
3. Enable HTTPS
4. Configure CORS for your domain
5. Set up monitoring & logging

## Support
For issues or questions, check:
- `/docs/auth.md` - Authentication details
- `/docs/usage.md` - Usage tracking details
- Clerk docs: https://clerk.com/docs
- Prisma docs: https://prisma.io/docs