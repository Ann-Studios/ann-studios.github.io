import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Play, Star } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    rating: number;
    plays: number;
    url?: string;
  };
  onPlay: (game: any) => void;
}

export function GameCard({ game, onPlay }: GameCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border hover:border-ann-red transition-all duration-300 hover:shadow-gaming hover:animate-glow-pulse">
      <div className="aspect-video overflow-hidden">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Button
          onClick={() => onPlay(game)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-primary hover:bg-gradient-hover text-white border-0 shadow-gaming-glow scale-90 hover:scale-100"
        >
          <Play className="w-4 h-4 mr-2" />
          Play Now
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
            {game.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {game.rating}
          </div>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-ann-red transition-colors">
          {game.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{game.plays.toLocaleString()} plays</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPlay(game)}
            className="text-ann-red hover:text-ann-red-light hover:bg-ann-red/10"
          >
            Play Game
          </Button>
        </div>
      </div>
    </Card>
  );
}