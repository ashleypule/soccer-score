'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LeaguesInfo() {
  const [open, setOpen] = useState(false);

  const supportedLeagues = [
    { code: 'PL', name: 'Premier League', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' },
    { code: 'PD', name: 'La Liga', country: '🇪🇸 Spain' },
    { code: 'SA', name: 'Serie A', country: '🇮🇹 Italy' },
    { code: 'BL1', name: 'Bundesliga', country: '🇩🇪 Germany' },
    { code: 'FL1', name: 'Ligue 1', country: '🇫🇷 France' },
    { code: 'DED', name: 'Eredivisie', country: '🇳🇱 Netherlands' },
    { code: 'ELC', name: 'Championship', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England' },
    { code: 'PPL', name: 'Primeira Liga', country: '🇵🇹 Portugal' },
    { code: 'BSA', name: 'Brasileirão', country: '🇧🇷 Brazil' },
    { code: 'CL', name: 'Champions League', country: '🇪🇺 Europe' },
    { code: 'WC', name: 'World Cup', country: '🌍 International' },
    { code: 'EC', name: 'European Championship', country: '🇪🇺 Europe' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Available Leagues
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Available Leagues on Football-Data.org API
          </DialogTitle>
          <DialogDescription>
            Free tier access to {supportedLeagues.length} major football leagues and competitions
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {supportedLeagues.map((league) => (
            <div
              key={league.code}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="font-medium">{league.name}</span>
                <span className="text-sm text-muted-foreground">{league.country}</span>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {league.code}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> The free tier API has a rate limit of 10 requests per minute. 
            Use the league filter above to view matches from specific competitions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
