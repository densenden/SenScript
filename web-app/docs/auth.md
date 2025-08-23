# Authentication Documentation

## Overview
SenScript Web App uses Clerk for authentication, providing secure user management with minimal setup.

## Environment Variables
```bash
# Required in .env file
CLERK_PUBLISHABLE_KEY=pk_test_...  # From Clerk Dashboard
CLERK_SECRET_KEY=sk_test_...       # From Clerk Dashboard
DATABASE_URL="file:./dev.db"       # SQLite for development
PORT=3001                           # Server port
```

## Protected Routes
All routes require authentication except public endpoints:
- `/api/auth/config` - Returns Clerk publishable key
- Static assets (HTML, CSS, JS files)

## Server-Side Authentication

### Middleware Setup
```javascript
// server-with-auth.js
const verifyClerkToken = async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No authorization token' });
    
    // Decode and verify token
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
};
```

### Using auth() in Route Handlers
```javascript
app.get('/api/settings', verifyClerkToken, async (req, res) => {
    const userId = req.userId; // Available after middleware
    // Fetch user-specific data
});
```

## Client-Side Authentication

### Initialize Clerk
```javascript
const auth = new ClerkAuth();
await auth.init();
```

### Check Authentication Status
```javascript
if (auth.isSignedIn()) {
    const user = auth.getUser();
    console.log('Signed in as:', user.emailAddress);
}
```

### Get Auth Headers for API Calls
```javascript
const headers = await auth.getAuthHeaders();
const response = await fetch('/api/settings', { headers });
```

## User Interface Components

### Mount UserButton
```javascript
auth.mountUserButton('clerk-user-button');
```

### Mount Full UserProfile
```javascript
auth.mountUserProfile('user-profile-container');
```

## Account Page Route
Access full account management at `/account` or embed in Settings modal.

## Authentication Flow
1. User visits app → Check if signed in
2. If not signed in → Show auth container
3. User signs in/up via Clerk modal
4. On success → Load main app with user context
5. All API calls include auth token
6. Server validates token on each request

## Security Notes
- Tokens are automatically refreshed by Clerk
- Sessions expire after inactivity
- All user data is scoped by userId
- Rate limiting prevents abuse

## Testing Locally
1. Set up Clerk account at clerk.com
2. Create application and get keys
3. Add keys to `.env` file
4. Run migrations: `npx prisma migrate dev`
5. Start server: `npm run dev`
6. Open http://localhost:3001