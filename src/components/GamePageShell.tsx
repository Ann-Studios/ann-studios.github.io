import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import '../css/GamePage.css';
import { AdBanner } from './AdBanner';

type GamePageShellProps = {
  title: string;
  category: string;
  description: string;
  children: ReactNode;
};

export function GamePageShell({ title, category, description, children }: GamePageShellProps) {
  return (
    <div className="game-page">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/play"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition hover:border-white/30 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to games
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-100">
              <Gamepad2 className="h-4 w-4" />
              <span>{category}</span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_0.8fr]">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>

        <AdBanner slot={process.env.REACT_APP_ADSENSE_TOP_SLOT} format="horizontal" />

        <div className="game-layout">
          <div className="game-stage">{children}</div>
          <aside className="flex flex-col gap-4">
            <AdBanner slot={process.env.REACT_APP_ADSENSE_SIDE_SLOT} format="rectangle" className="min-h-[280px]" />
          </aside>
        </div>

        <AdBanner slot={process.env.REACT_APP_ADSENSE_BOTTOM_SLOT} format="horizontal" />
      </div>
    </div>
  );
}
