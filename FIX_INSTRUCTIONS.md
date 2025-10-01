# IMMEDIATE FIX INSTRUCTIONS

## The Problem

Your app can't read the `.env` file, so `process.env.EXPO_PUBLIC_SUPABASE_URL` and other variables are empty, causing the "Network request failed" error.

## The Solution

### Step 1: Install the required package

Run this in your PowerShell terminal:

```powershell
npm install --legacy-peer-deps
```

This will install `babel-plugin-inline-dotenv` which enables Expo to read `.env` files.

### Step 2: Verify your .env file exists

Your `.env` file should be in the root directory (`c:\hackgt1\v0-edge-beacon-frontend-build\.env`)

It should contain:

```env
EXPO_PUBLIC_SUPABASE_URL=https://cmstmhaykbwygaxfxtnp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
EXPO_PUBLIC_OPENAI_API_KEY=your-key-here
EXPO_PUBLIC_GEMINI_API_KEY=your-key-here
```

**Important:** The variable names MUST start with `EXPO_PUBLIC_` to be accessible in Expo apps.

### Step 3: Clear cache and restart

```powershell
npx expo start --clear
```

Or if Expo is already running, press `r` to reload.

### Step 4: Verify it's working

You should see this in your console:

```
Environment variables loaded: { hasSupabaseUrl: true, hasSupabaseKey: true, ... }
Supabase client initialized with: { url: '...', hasKey: true, ... }
```

Instead of:

```
ERROR [TypeError: Network request failed]
```

---

## What I Changed

1. ✅ **babel.config.js** - Added plugin to load .env files
2. ✅ **package.json** - Added babel-plugin-inline-dotenv dependency
3. ✅ **src/config/index.ts** - Added debug logging and better error messages
4. ✅ **App.tsx** - Added config validation with helpful error screen
5. ✅ **env.example** - Added detailed comments

## Why This Happened

Expo doesn't automatically load `.env` files - you need to configure Babel to inline the environment variables at build time. The `babel-plugin-inline-dotenv` package does this.

## If It Still Doesn't Work

1. **Check .env file location:** Must be in root directory (same folder as package.json)
2. **Check .env file format:** No quotes around values, no spaces around `=`
3. **Check variable names:** Must start with `EXPO_PUBLIC_`
4. **Clear all caches:**
   ```powershell
   rm -r node_modules
   rm package-lock.json
   npm install --legacy-peer-deps
   npx expo start --clear
   ```

---

**Need help?** Check the app console - it now shows detailed error messages if config is missing!
