import { Logo } from './logo';
import { LeaguesInfo } from './leagues-info';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">
              ScoreStream
            </h1>
          </div>
          <LeaguesInfo />
        </div>
      </div>
    </header>
  );
}
