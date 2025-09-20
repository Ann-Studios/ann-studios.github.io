import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { Search, Filter, Gamepad2 } from "lucide-react";
import gamePuzzle from "@/assets/game-puzzle.jpg";
import gameRacing from "@/assets/game-racing.jpg";
import gameAdventure from "@/assets/game-adventure.jpg";
import gameShooter from "@/assets/game-shooter.jpg";
import gameChess from "@/assets/game-chess.jpg";
import gameFlappy from "@/assets/game-flappy.jpg";
import gameSnake from "@/assets/game-snake.jpg";
import game2048 from "@/assets/game-2048.jpg";
import gameBubble from "@/assets/game-bubble.jpg";

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const games = [
    {
      id: "puzzle-master",
      title: "Puzzle Master",
      description: "Challenge your mind with increasingly complex puzzles and geometric shapes. Perfect for brain training!",
      category: "Puzzle",
      thumbnail: gamePuzzle,
      rating: 4.8,
      plays: 125430,
      url: "https://www.crazygames.com/embed/2048"
    },
    {
      id: "neon-racer",
      title: "Neon Racer",
      description: "Race through futuristic neon tracks in this high-speed arcade racing experience with synthwave vibes.",
      category: "Racing",
      thumbnail: gameRacing,
      rating: 4.6,
      plays: 89720,
      url: "https://www.crazygames.com/embed/moto-x3m"
    },
    {
      id: "mystic-quest",
      title: "Mystic Quest",
      description: "Embark on an epic fantasy adventure through magical realms filled with creatures and mysteries.",
      category: "Adventure",
      thumbnail: gameAdventure,
      rating: 4.9,
      plays: 203850,
      url: "https://www.crazygames.com/embed/fireboy-and-watergirl-forest-temple"
    },
    {
      id: "space-defender",
      title: "Space Defender",
      description: "Defend Earth from alien invasion in this action-packed space shooter with stunning visual effects.",
      category: "Shooter",
      thumbnail: gameShooter,
      rating: 4.7,
      plays: 156920,
      url: "https://www.crazygames.com/embed/space-invaders"
    },
    {
      id: "3d-chess-master",
      title: "3D Chess Master",
      description: "Experience the classic strategy game in stunning 3D graphics. Challenge your mind with beautiful wooden pieces and immersive gameplay.",
      category: "Strategy",
      thumbnail: gameChess,
      rating: 4.9,
      plays: 87650,
      url: `${window.location.origin}/chess`
    },
    {
      id: "flappy-bird-classic",
      title: "Flappy Bird Classic",
      description: "The addictive arcade game that took the world by storm! Navigate through pipes and beat your high score in this pixel-perfect remake.",
      category: "Arcade",
      thumbnail: gameFlappy,
      rating: 4.6,
      plays: 245780,
      url: `${window.location.origin}/flappy-bird`
    },
    {
      id: "modern-snake",
      title: "Modern Snake",
      description: "The classic Snake game reimagined with smooth graphics and modern gameplay. Eat, grow, and avoid your own tail!",
      category: "Arcade",
      thumbnail: gameSnake,
      rating: 4.7,
      plays: 189340,
      url: `${window.location.origin}/snake`
    },
    {
      id: "puzzle-2048",
      title: "2048 Puzzle",
      description: "Slide numbered tiles to combine them and reach the elusive 2048 tile. Simple to learn but hard to master!",
      category: "Puzzle",
      thumbnail: game2048,
      rating: 4.8,
      plays: 167890,
      url: `${window.location.origin}/2048`
    },
    {
      id: "bubble-shooter-deluxe",
      title: "Bubble Shooter Deluxe",
      description: "Aim, match, and pop bubbles in this colorful puzzle game. Clear all bubbles to advance through challenging levels.",
      category: "Puzzle",
      thumbnail: gameBubble,
      rating: 4.5,
      plays: 134560,
      url: `${window.location.origin}/bubble-shooter`
    }
  ];

  const categories = ["all", "Puzzle", "Racing", "Adventure", "Shooter", "Strategy", "Arcade"];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayGame = (game: any) => {
    setSelectedGame(game);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-12 h-12 text-white" />
            <h1 className="text-5xl font-bold text-white">Ann Studios Games</h1>
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover amazing browser games, from puzzle challenges to epic adventures. 
            Play instantly without downloads!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ann-red rounded-full animate-pulse" />
              <span>Free to Play</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ann-red rounded-full animate-pulse" />
              <span>No Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-ann-red rounded-full animate-pulse" />
              <span>Instant Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border focus:border-ann-red"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Categories:</span>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "secondary"}
                className={`cursor-pointer transition-colors ${
                  selectedCategory === category
                    ? "bg-ann-red text-white hover:bg-ann-red-dark"
                    : "hover:bg-ann-red/20 hover:text-ann-red"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Games" : category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedCategory === "all" ? "All Games" : selectedCategory} 
                <span className="text-muted-foreground ml-2">({filteredGames.length})</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onPlay={handlePlayGame}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Games Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}
      </div>

      {/* Game Modal */}
      <GameModal
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
};

export default Games;