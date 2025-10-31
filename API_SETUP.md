# Soccer Score API Integration

This application now fetches real soccer match data from the **Football-Data.org API**.

## 🚀 Quick Setup

### 1. Get Your Free API Key

1. Visit [Football-Data.org](https://www.football-data.org/client/register)
2. Register for a free account
3. Copy your API key from the dashboard

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```powershell
   Copy-Item .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   FOOTBALL_DATA_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies (if not already done)

```powershell
npm install
```

### 4. Start the Development Server

```powershell
npm run dev
```

The app will be available at http://localhost:9002

## 📊 Supported Leagues

The free tier of Football-Data.org API supports these major leagues:

- ⚽ **Premier League** (England)
- ⚽ **La Liga** (Spain)
- ⚽ **Serie A** (Italy)
- ⚽ **Bundesliga** (Germany)
- ⚽ **Ligue 1** (France)
- ⚽ **Eredivisie** (Netherlands)
- ⚽ **Championship** (England)
- ⚽ **Primeira Liga** (Portugal)
- ⚽ **Brasileirão** (Brazil)
- ⚽ **Champions League**
- ⚽ **World Cup**
- ⚽ **European Championship**

## 🔄 Features

- **Real-time Match Data**: Fetches live scores from all supported leagues
- **Auto-refresh**: Live matches automatically update every 2 minutes
- **Date Filtering**: View matches from the last 7 days by default
- **League Filtering**: Filter matches by specific competitions
- **Status Filtering**: Filter by live, finished, or scheduled matches

## 📡 API Endpoints

The app provides the following API routes:

### Get Matches
```
GET /api/matches?daysBack=7&daysForward=0
```

Fetches matches from all leagues within the specified date range.

**Query Parameters:**
- `daysBack` - Number of days to look back (default: 7)
- `daysForward` - Number of days to look forward (default: 0)

### Get Live Matches
```
GET /api/matches/live
```

Fetches only currently ongoing matches.

### Get Leagues
```
GET /api/leagues
```

Fetches all available leagues.

## 🔧 API Rate Limits

The free tier of Football-Data.org has these limitations:

- **10 requests per minute**
- Limited to specific competitions
- Data updated every minute

If you need more:
- Consider upgrading to a paid tier
- Implement more aggressive caching
- Use alternative APIs (API-Football via RapidAPI)

## 🎯 Alternative: API-Football (RapidAPI)

If you prefer to use API-Football from RapidAPI instead:

1. Sign up at [RapidAPI](https://rapidapi.com/api-sports/api/api-football)
2. Subscribe to the free tier
3. Update the API service in `src/lib/football-api.ts` to use their endpoints

API-Football offers:
- More leagues and competitions
- More detailed statistics
- Higher rate limits on paid tiers

## 🐛 Troubleshooting

### "API rate limit exceeded"
- Wait a minute before trying again
- Consider implementing client-side caching
- Reduce the frequency of auto-refresh

### "Failed to fetch matches"
- Verify your API key is correctly set in `.env.local`
- Check that your API key is valid on Football-Data.org
- Ensure you haven't exceeded the rate limit

### No matches displayed
- The date range might not have any matches
- Some leagues might be in off-season
- Check the browser console for error messages

## 📝 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── matches/
│   │   │   ├── route.ts          # Main matches endpoint
│   │   │   └── live/
│   │   │       └── route.ts      # Live matches endpoint
│   │   └── leagues/
│   │       └── route.ts          # Leagues endpoint
│   ├── page.tsx                  # Main page component
│   └── ...
├── lib/
│   ├── football-api.ts           # Football-Data.org API service
│   ├── api-client.ts             # Client-side API wrapper
│   ├── types.ts                  # TypeScript types
│   └── mock-data.ts              # Backup mock data (fallback)
└── components/
    ├── match-list.tsx            # Match list with auto-refresh
    ├── match-card.tsx            # Individual match card
    ├── filters.tsx               # Filter controls
    └── ...
```

## 🎨 Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Football-Data.org API** - Soccer data source
- **Date-fns** - Date manipulation

## 📄 License

This project is open source and available under the MIT License.
