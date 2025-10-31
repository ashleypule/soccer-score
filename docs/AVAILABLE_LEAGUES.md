# Available Leagues - Football-Data.org API

## Overview
The Soccer Score website now supports filtering matches by league. The free tier of Football-Data.org API provides access to **12 major football competitions** from around the world.

## Supported Leagues

### 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
- **Premier League** (Code: `PL`)
- **Championship** (Code: `ELC`)

### 🇪🇸 Spain
- **La Liga / Primera División** (Code: `PD`)

### 🇮🇹 Italy
- **Serie A** (Code: `SA`)

### 🇩🇪 Germany
- **Bundesliga** (Code: `BL1`)

### 🇫🇷 France
- **Ligue 1** (Code: `FL1`)

### 🇳🇱 Netherlands
- **Eredivisie** (Code: `DED`)

### 🇵🇹 Portugal
- **Primeira Liga** (Code: `PPL`)

### 🇧🇷 Brazil
- **Brasileirão / Brazilian Serie A** (Code: `BSA`)

### 🇪🇺 European Competitions
- **UEFA Champions League** (Code: `CL`)
- **UEFA European Championship / Euro** (Code: `EC`)

### 🌍 International
- **FIFA World Cup** (Code: `WC`)

## Features Implemented

### 1. League Selector
- **Location**: Filter bar at the top of the page
- **Options**: 
  - "All Leagues" - Shows matches from all competitions
  - Individual league selection - Filters to show only matches from that specific league

### 2. Date Range Filter
Choose from multiple time ranges:
- **Today** - Matches happening today
- **Last 3 Days** - Recent matches from the past 3 days
- **Last 7 Days** (Default) - Week's worth of matches
- **Last 30 Days** - Full month of match history

### 3. Status Filter
Filter matches by their current state:
- **All Matches** - Shows everything
- **Live** - Only matches currently in progress
- **Finished** - Completed matches with final scores
- **Scheduled** - Upcoming matches

### 4. League Information Dialog
- **Access**: Click "Available Leagues" button in the header
- **Content**: 
  - Complete list of all 12 supported leagues
  - Country/region for each league
  - League codes
  - API rate limit information

## How to Use

### View All Matches from All Leagues
1. Set the league filter to "All Leagues" (default)
2. Choose your preferred date range
3. Optionally filter by match status

### View Matches from a Specific League
1. Click the **League dropdown** in the filter bar
2. Select your desired league (e.g., "Premier League", "La Liga")
3. Only matches from that league will be displayed
4. You can still use date range and status filters

### View League Information
1. Click the **"Available Leagues"** button in the header
2. A dialog will open showing:
   - All supported leagues with their names
   - Country/region information
   - League codes used by the API
   - API usage notes

## Technical Details

### API Configuration
The leagues are configured in `src/lib/football-api.ts`:

```typescript
export const SUPPORTED_LEAGUES = {
  PREMIER_LEAGUE: 'PL',
  PRIMERA_DIVISION: 'PD',
  SERIE_A: 'SA',
  BUNDESLIGA: 'BL1',
  LIGUE_1: 'FL1',
  EREDIVISIE: 'DED',
  CHAMPIONSHIP: 'ELC',
  PRIMEIRA_LIGA: 'PPL',
  BRAZILIAN_SERIE_A: 'BSA',
  WORLD_CUP: 'WC',
  EUROPEAN_CHAMPIONSHIP: 'EC',
  CHAMPIONS_LEAGUE: 'CL',
};
```

### Rate Limits
- **Free Tier**: 10 requests per minute
- The app implements smart caching to minimize API calls
- Use league filters to reduce the number of competitions queried

### Data Structure
Each match now includes complete league information:

```typescript
interface Match {
  id: number;
  league: {
    id: number;
    name: string;
    code: string;
  };
  // ... other match properties
}
```

## Examples

### Scenario 1: View Today's Premier League Matches
1. League Filter: Select "Premier League"
2. Date Range: Select "Today"
3. Status: Select "All Matches"

### Scenario 2: View Last Week's Champions League Results
1. League Filter: Select "Champions League"
2. Date Range: Select "Last 7 Days"
3. Status: Select "Finished"

### Scenario 3: Find All Live Matches
1. League Filter: Keep as "All Leagues"
2. Date Range: Select "Today"
3. Status: Select "Live"

## Components Updated

### Files Created/Modified:
1. ✅ `src/components/matches-container.tsx` - Client component with filtering logic
2. ✅ `src/components/filters.tsx` - Enhanced with callback functions
3. ✅ `src/components/leagues-info.tsx` - New info dialog component
4. ✅ `src/components/header.tsx` - Added leagues info button
5. ✅ `src/lib/types.ts` - Updated Match interface with League object
6. ✅ `src/lib/football-api.ts` - Enhanced mapMatch to include league details
7. ✅ `src/components/match-card.tsx` - Updated to display league.name

## Benefits

1. **Better Organization**: Easily find matches from your favorite league
2. **Reduced Load Times**: Fetching fewer matches by filtering improves performance
3. **Better User Experience**: Clear visual feedback on available competitions
4. **Flexibility**: Combine league, date, and status filters for precise results
5. **Discovery**: Learn about all available competitions through the info dialog

## Notes

- The app fetches league data on page load
- Filters work in real-time without page refresh
- Match data is automatically refreshed for live games every 2 minutes
- All filters can be combined for maximum flexibility
