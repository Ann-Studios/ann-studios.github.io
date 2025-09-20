import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Maximize, Minimize, Star } from "lucide-react";
import { useState } from "react";

interface GameModalProps {
  game: {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnail: string;
    rating: number;
    plays: number;
    url?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameModal({ game, isOpen, onClose }: GameModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!game) return null;

  const gameUrl = game.url || `https://html5games.com/Game/${game.id}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`bg-card border-ann-red/30 ${
        isFullscreen ? "max-w-full h-screen m-0 rounded-none" : "max-w-6xl"
      } transition-all duration-300`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-bold text-foreground">
              {game.title}
            </DialogTitle>
            <Badge variant="secondary" className="bg-ann-red/20 text-ann-red border-ann-red/30">
              {game.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {game.rating}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <DialogDescription className="text-muted-foreground mb-4">
          {game.description}
        </DialogDescription>

        <div className={`bg-black rounded-lg overflow-hidden ${
          isFullscreen ? "h-[calc(100vh-120px)]" : "aspect-video"
        }`}>
          <iframe
            src={gameUrl}
            title={game.title}
            className="w-full h-full border-0"
            allowFullScreen
            allow="gamepad; microphone; camera"
          />
        </div>

        <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
          <span>{game.plays.toLocaleString()} total plays</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-ann-red/30 text-ann-red hover:bg-ann-red/10"
            >
              Share Game
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-ann-red-dark/30 text-ann-red-dark hover:bg-ann-red-dark/10"
            >
              Full Screen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}