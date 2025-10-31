# **App Name**: ScoreStream

## Core Features:

- Home Page Layout: Display a header with a logo and title, dropdown filters for league, date range, and team.
- Scrollable Matches Section: Implement a scrollable section that shows recent matches at the bottom and loads older matches as the user scrolls up.
- Match Card Display: Display league name, round, home vs. away teams, match score, date, and optional match status on each match card.
- API Integration: Fetch soccer matches from all available leagues using the API-Football (RapidAPI) or another free public soccer API. Handle API key configuration in a separate config.js file and implement fallback mock data.
- Infinite Scroll: Load older match results as the user scrolls up.
- Auto-Refresh: Automatically refresh the match scores every 5 minutes to display the latest results.
- Responsive Layout: Ensure the website layout is responsive and works well on both desktop and mobile devices.

## Style Guidelines:

- Primary color: Dark green (#1B5E20) to evoke the feel of a soccer field.
- Background color: Dark gray (#212121) for a modern dark theme.
- Accent color: White (#FFFFFF) to provide contrast and highlight important information.
- Body font: 'Inter', a grotesque-style sans-serif for a modern look.
- Headline font: 'Space Grotesk', a sans-serif that pairs well with Inter.
- Use simple, clean icons for match status (e.g., a clock for scheduled, a stadium for ongoing, a checkmark for finished).
- Use Tailwind CSS components for cards, dropdowns, and the navigation bar to ensure a consistent and modern look.
- Implement smooth animations when loading new match data to enhance the user experience.