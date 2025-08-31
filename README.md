# RGPV Mates - Dating App

A modern dating application for RGPV students with admin management system.

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

### Required Variables

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Admin Security (CRITICAL - Change these!)
ADMIN_USERNAME=your-admin-username
ADMIN_PWD=your-admin-password

# Image Upload (ImgBB)
IMGBB_API_KEY=your-imgbb-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Security Notes

⚠️ **IMPORTANT**: 
- Change `ADMIN_USERNAME` and `ADMIN_PWD` from default values
- Use strong, unique passwords
- Never commit `.env` file to version control


## Features

- User registration with ID verification
- Admin approval system
- Discover profiles with gender filtering
- Real-time chat via WebSocket
- Admin dashboard for user management
- Secure session management
- Image upload via ImgBB

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

2. Set up environment variables in `server/.env`

3. Start the development servers:
   ```bash
   npm run dev
   ```


## Security Features

- Admin credentials stored in environment variables
- Session-based authentication
- Admin user excluded from regular user management
- Separate admin session validation
- Protected routes with middleware
