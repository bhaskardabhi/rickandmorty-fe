# Starting the Backend Server

The frontend requires the backend server to be running to fetch location descriptions.

## Quick Start

1. **Open a new terminal window/tab**

2. **Navigate to backend directory:**
   ```bash
   cd rickandmorty-be
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```

4. **Verify it's running:**
   ```bash
   curl http://localhost:3001/health
   ```
   
   Should return: `{"status":"ok","dbInitialized":true}`

## Running Both Servers

You need **TWO terminal windows**:

**Terminal 1 - Backend:**
```bash
cd rickandmorty-be
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd rickandmorty-fe
npm run dev
```

## Troubleshooting

### Backend won't start?

1. **Check if port 3001 is already in use:**
   ```bash
   lsof -ti:3001
   ```

2. **Check backend logs** for errors

3. **Verify .env file exists** in `rickandmorty-be/` with your API keys

### Still getting ERR_CONNECTION_REFUSED?

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check frontend .env.local:**
   ```bash
   cat rickandmorty-fe/.env.local
   ```
   Should have: `VITE_BACKEND_URL=http://localhost:3001`

3. **Restart frontend** after changing .env.local:
   ```bash
   # Stop frontend (Ctrl+C)
   # Then restart
   npm run dev
   ```

## Quick Check Script

Run this to check if backend is running:
```bash
curl -s http://localhost:3001/health && echo "✅ Backend is running" || echo "❌ Backend is NOT running"
```

