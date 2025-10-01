# Atlas App - Setup Guide

## Environment Configuration

This app requires environment variables to connect to Supabase and AI services.

### Quick Setup Steps

1. **Copy the environment template:**

   ```bash
   copy env.example .env
   ```

   (On Mac/Linux: `cp env.example .env`)

2. **Get your Supabase credentials:**

   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project
   - Go to Project Settings > API
   - Copy the following:
     - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. **Update the .env file:**

   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Install dependencies (if not already done):**

   ```bash
   npm install
   ```

5. **Restart the development server:**
   - Stop the current server (Ctrl+C)
   - Clear cache: `npx expo start --clear`
   - Or just press `r` in the Expo terminal to reload

### Optional API Keys (for AI features)

- **OpenAI:** Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Gemini:** Get from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Troubleshooting

#### "Network request failed" or "AuthRetryableFetchError"

- ✅ Make sure `.env` file exists in the root directory
- ✅ Verify your Supabase URL and key are correct
- ✅ Restart the Expo dev server after creating/modifying `.env`
- ✅ Check that variables start with `EXPO_PUBLIC_` prefix

#### Environment variables not loading

- ✅ Ensure `babel-plugin-inline-dotenv` is installed: `npm install --save-dev babel-plugin-inline-dotenv`
- ✅ Check `babel.config.js` includes the plugin
- ✅ Clear Metro bundler cache: `npx expo start --clear`

#### "Database querying schema" error

- ✅ This usually means Supabase credentials are invalid or the database tables don't exist
- ✅ Check your Supabase project has the required tables: `users`, `betting_lines`, `games`, `players`, etc.
- ✅ Verify your anon key has the correct permissions

### Database Schema Setup

If you're setting up a new Supabase project, you'll need to create the following tables:

- `users`
- `games`
- `players`
- `player_stats`
- `betting_lines`
- `user_bets`
- `h2h_lines`
- `h2h_matches`
- `live_pricing`

Run the SQL migrations from your Supabase dashboard to create these tables.

### Development Workflow

1. Make sure `.env` is configured
2. Run `npm install`
3. Run `npx expo start --clear`
4. Press `i` for iOS, `a` for Android, or `w` for web

---

**Note:** The `.env` file is gitignored for security. Never commit it to version control.
