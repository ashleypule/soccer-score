'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Video, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HighlightPlayerProps {
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
}

export function HighlightPlayer({ homeTeam, awayTeam, matchDate }: HighlightPlayerProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHighlight = async () => {
    if (embedUrl) {
      // Already loaded, just open dialog
      setOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOpen(true);

    try {
      const response = await fetch('/api/highlights');
      if (!response.ok) throw new Error('Failed to fetch highlights');

      const data = await response.json();
      const highlights = data.highlights || [];

      // Improved team name normalization
      const normalizeTeam = (name: string) =>
        name
          .toLowerCase()
          .replace(/\b(fc|cf|sc|ac|afc|united|city|real|athletic|sporting)\b/gi, '')
          .replace(/[^\w\s]/g, '')
          .trim();

      const homeNormalized = normalizeTeam(homeTeam);
      const awayNormalized = normalizeTeam(awayTeam);

      // Try exact match (both teams)
      let highlight = highlights.find((h: any) => {
        const title = normalizeTeam(h.title);
        return title.includes(homeNormalized) && title.includes(awayNormalized);
      });

      // Try reverse order
      if (!highlight) {
        highlight = highlights.find((h: any) => {
          const title = normalizeTeam(h.title);
          return title.includes(awayNormalized) && title.includes(homeNormalized);
        });
      }

      if (highlight && highlight.videos && highlight.videos.length > 0) {
        setEmbedUrl(highlight.videos[0].embed);
      } else {
        setError('No highlights available for this match yet. Highlights are typically available for recent major league matches within 24 hours.');
      }
    } catch (err: any) {
      console.error('Error loading highlight:', err);
      setError('Failed to load highlights. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={loadHighlight}
        variant="outline"
        size="sm"
        className="w-full mt-2 gap-2"
      >
        <Video className="h-4 w-4" />
        Watch Highlights
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Match Highlights
            </DialogTitle>
            <DialogDescription>
              {homeTeam} vs {awayTeam}
            </DialogDescription>
          </DialogHeader>

          <div className="w-full">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading highlights...</p>
              </div>
            )}

            {error && !isLoading && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {embedUrl && !isLoading && !error && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={`${homeTeam} vs ${awayTeam} highlights`}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
