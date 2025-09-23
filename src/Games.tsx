import { useState } from "react";
import { Search, Filter, Gamepad2, Star, Play } from "lucide-react";
import gamePuzzle from "./assets/game-puzzle.jpg";
import gameRacing from "./assets/game-racing.jpg";
import gameAdventure from "./assets/game-adventure.jpg";
import gameShooter from "./assets/game-shooter.jpg";
import gameChess from "./assets/game-chess.jpg";
import gameFlappy from "./assets/game-flappy.jpg";
import gameSnake from "./assets/game-snake.jpg";
import game2048 from "./assets/game-2048.jpg";
import gameBubble from "./assets/game-bubble.jpg";
import "./css/Games.css";

// Define a type for the game object
interface GameType {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  rating: number;
  plays: number;
  url: string;
}

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const games: GameType[] = [
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

  const handlePlayGame = (game: GameType) => {
    // Create a safe object without circular references
    const safeGame = {
      id: game.id,
      title: game.title,
      description: game.description,
      category: game.category,
      thumbnail: game.thumbnail,
      rating: game.rating,
      plays: game.plays,
      url: game.url
    };

    setSelectedGame(safeGame);

    // If you want to actually navigate to the game URL:
    // window.open(game.url, '_blank');
  };

  const closeModal = () => {
    setSelectedGame(null);
  };

  return (
    <div className="games-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-title">
            <Gamepad2 size={48} color="white" />
            <h1>Ann Studios Games</h1>
          </div>
          <p className="hero-description">
            Discover amazing browser games, from puzzle challenges to epic adventures.
            Play instantly without downloads!
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Free to Play</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>No Downloads</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Instant Play</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-container">
          <div className="search-input-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <Filter size={16} color="hsl(0, 0%, 65%)" />
            <span className="filter-label">Categories:</span>
            {categories.map((category) => (
              <span
                key={category}
                className={`badge ${selectedCategory === category ? "badge-default" : "badge-secondary"
                  }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "All Games" : category}
              </span>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <>
            <div className="games-header">
              <h2 className="games-title">
                {selectedCategory === "all" ? "All Games" : selectedCategory}
                <span className="games-count">({filteredGames.length})</span>
              </h2>
            </div>

            <div className="games-grid">
              {filteredGames.map((game) => (
                <div key={game.id} className="game-card">
                  <img src={game.thumbnail} alt={game.title} className="game-card-image" />
                  <div className="game-card-content">
                    <h3 className="game-card-title">{game.title}</h3>
                    <p className="game-card-description">{game.description}</p>
                    <div className="game-card-footer">
                      <div className="game-card-rating">
                        <Star size={16} fill="currentColor" color="hsl(0, 0%, 65%)" />
                        <span>{game.rating}</span>
                      </div>
                      <span className="game-card-plays">{game.plays.toLocaleString()} plays</span>
                    </div>
                    <button className="play-button" onClick={() => handlePlayGame(game)}>
                      <Play size={16} style={{ marginRight: "0.25rem" }} />
                      Play Game
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-games">
            <div className="no-games-emoji">🎮</div>
            <h3 className="no-games-title">No Games Found</h3>
            <p className="no-games-description">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedGame.title}</h2>
            <p>{selectedGame.description}</p>
            <div className="modal-actions">
              <button
                className="play-button"
                onClick={() => window.open(selectedGame.url, '_blank')}
              >
                Play Now
              </button>
              <button className="modal-close-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;