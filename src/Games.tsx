import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gamepad2, Play } from 'lucide-react';
import gamePuzzle from './assets/game-puzzle.jpg';
import gameAdventure from './assets/game-adventure.jpg';
import gameShooter from './assets/game-shooter.jpg';
import gameChess from './assets/game-chess.jpg';
import gameFlappy from './assets/game-flappy.jpg';
import gameSnake from './assets/game-snake.jpg';
import game2048 from './assets/game-2048.jpg';
import gameBubble from './assets/game-bubble.jpg';
import gameEatYourFood from './assets/game-eat-your-food-benin.png';
import './css/Games.css';
import './css/GamePage.css';

export const gameCatalog = [
  { slug: 'eat-your-food', title: 'Eat Your Food!', category: 'Adventure', image: gameEatYourFood, description: 'Run a Benin school canteen: match ingredients, learn 20 West African meals, and serve the students.' },
  { slug: 'snake', title: 'Modern Snake', category: 'Arcade', image: gameSnake, description: 'Eat, grow, and avoid your tail. Use the arrow keys or on-screen controls.' },
  { slug: '2048', title: '2048', category: 'Puzzle', image: game2048, description: 'Merge matching tiles and reach 2048. Use arrow keys or the direction buttons.' },
  { slug: 'flappy-bird', title: 'Flappy Bird', category: 'Arcade', image: gameFlappy, description: 'Tap the play area or press Space to fly through the pipes.' },
  { slug: 'bubble-shooter', title: 'Bubble Shooter', category: 'Puzzle', image: gameBubble, description: 'Aim and shoot to match three bubbles. Clear the board to advance.' },
  { slug: 'tic-tac-toe', title: 'Tic-Tac-Toe Duel', category: 'Strategy', image: gameChess, description: 'Play as X against the computer. Make a line of three to win.' },
  { slug: 'memory-match', title: 'Memory Match', category: 'Puzzle', image: gamePuzzle, description: 'Find all eight matching pairs in as few flips as possible.' },
  { slug: 'breakout', title: 'Breakout Neon', category: 'Arcade', image: gameShooter, description: 'Move the paddle with your finger, mouse, or arrow keys. Break all 54 bricks.' },
  { slug: 'hangman', title: 'Hangman', category: 'Word', image: gameAdventure, description: 'Use the hint to guess the word before six incorrect guesses.' },
  { slug: 'chess', title: '3D Chess Sandbox', category: 'Demo', image: gameChess, description: 'Explore a 3D board with free movement. This demo does not enforce chess rules.' },
];
const categories = ['all', ...Array.from(new Set(gameCatalog.map(game => game.category)))];

export default function Games() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const filtered = gameCatalog.filter(game =>
    (category === 'all' || game.category === category) &&
    `${game.title} ${game.description}`.toLowerCase().includes(query.trim().toLowerCase())
  );
  return (
    <main className="games-container">
      <section className="hero-section"><div className="hero-content">
        <div className="hero-title"><Gamepad2 size={40} aria-hidden="true" /><h1>Ann Studios Games</h1></div>
        <p className="hero-description">Pick a game and start playing. Free browser games, with no downloads or sign-up.</p>
      </div></section>
      <section className="search-filter-section" aria-label="Game collection">
        <div className="search-container">
          <div className="search-input-container">
            <Search className="search-icon" aria-hidden="true" />
            <input type="search" aria-label="Search games" placeholder="Search games..." value={query} onChange={event => setQuery(event.target.value)} className="search-input" />
          </div>
          <div className="filter-container" aria-label="Categories">
            {categories.map(value => <button type="button" key={value} aria-pressed={category === value} className={`badge ${category === value ? 'badge-default' : 'badge-secondary'}`} onClick={() => setCategory(value)}>{value === 'all' ? 'All Games' : value}</button>)}
          </div>
        </div>
        <h2 className="games-title" aria-live="polite">{category === 'all' ? 'All Games' : category} <span className="games-count">({filtered.length})</span></h2>
        <div className="games-grid">
          {filtered.map(game => <article key={game.slug} className="game-card">
            <img src={game.image} alt="" className="game-card-image" loading="lazy" />
            <div className="game-card-content">
              <span className="game-card-plays">{game.category}</span>
              <h3 className="game-card-title">{game.title}</h3>
              <p className="game-card-description">{game.description}</p>
              <Link className="play-button" to={`/play/${game.slug}`} aria-label={`Play ${game.title}`}><Play size={16} aria-hidden="true" />{game.category === 'Demo' ? 'Explore Demo' : 'Play Game'}</Link>
            </div>
          </article>)}
        </div>
        {filtered.length === 0 && <div className="no-games"><h3>No games found</h3><p>Try another search or category.</p><button className="play-button" onClick={() => { setQuery(''); setCategory('all'); }}>Show all games</button></div>}
      </section>
    </main>
  );
}
