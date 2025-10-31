import { Match, Team, League } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { subDays, formatISO } from 'date-fns';

const placeholderLogos = PlaceHolderImages.filter(img => img.imageHint.includes('logo'));

const teams: Team[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Team ${String.fromCharCode(65 + i)}`,
  logo: placeholderLogos[i % placeholderLogos.length]?.imageUrl || `https://picsum.photos/seed/team${i + 1}/100/100`,
}));

const leagues: League[] = [
  { id: 1, name: 'Premier League' },
  { id: 2, name: 'La Liga' },
  { id: 3, name: 'Serie A' },
  { id: 4, name: 'Bundesliga' },
  { id: 5, name: 'Ligue 1' },
];

const allMatches: Match[] = [];
const today = new Date();

for (let i = 0; i < 100; i++) {
  const homeTeam = teams[Math.floor(Math.random() * teams.length)];
  let awayTeam = teams[Math.floor(Math.random() * teams.length)];
  while (awayTeam.id === homeTeam.id) {
    awayTeam = teams[Math.floor(Math.random() * teams.length)];
  }

  const matchDate = subDays(today, i);
  let status: 'Finished' | 'Ongoing' | 'Scheduled';
  let score: { home: number | null; away: number | null };

  if (i === 0) {
    status = 'Ongoing';
    score = { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 3) };
  } else if (i < 0) { // for future scheduled matches, not used in this batch
    status = 'Scheduled';
    score = { home: null, away: null };
  } else {
    status = 'Finished';
    score = { home: Math.floor(Math.random() * 5), away: Math.floor(Math.random() * 5) };
  }
  
  const league = leagues[Math.floor(Math.random() * leagues.length)];

  allMatches.push({
    id: 1000 + i,
    league: league,
    round: `Round ${38 - Math.floor(i / 10)}`,
    date: formatISO(matchDate),
    status,
    teams: {
      home: homeTeam,
      away: awayTeam,
    },
    score,
  });
}

// Sort matches by date descending (most recent first)
allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


export const fetchMatches = async ({ page, limit }: { page: number; limit: number }): Promise<Match[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * limit;
      const end = start + limit;
      resolve(allMatches.slice(start, end));
    }, 500); // Simulate network delay
  });
};

export const fetchLeagues = async (): Promise<League[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(leagues);
    }, 200);
  });
};

export const fetchTeams = async (): Promise<Team[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(teams);
    }, 200);
  });
};
