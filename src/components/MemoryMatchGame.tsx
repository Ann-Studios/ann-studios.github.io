import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type Card = {
  id: number;
  emoji: string;
  matched: boolean;
};

const emojis = ['🎮', '🚀', '🐍', '🧩', '👑', '⚡', '🎯', '🔥'];

const shuffleDeck = () => {
  const cards = [...emojis, ...emojis].map((emoji, index) => ({ id: index + 1, emoji, matched: false }));
  for (let index = cards.length - 1; index > 0; index--) {
    const choice = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[choice]] = [cards[choice], cards[index]];
  }
  return cards;
};

export function MemoryMatchGame() {
  const [deck, setDeck] = useState<Card[]>(() => shuffleDeck());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const matchedPairs = useMemo(() => deck.filter((card) => card.matched).length / 2, [deck]);
  const isComplete = matchedPairs === emojis.length;

  useEffect(() => {
    if (flippedIds.length !== 2) return;

    const [firstId, secondId] = flippedIds;
    const firstCard = deck.find((card) => card.id === firstId);
    const secondCard = deck.find((card) => card.id === secondId);

    if (!firstCard || !secondCard) {
      setFlippedIds([]);
      return;
    }

    if (firstCard.emoji === secondCard.emoji) {
      setDeck((currentDeck) =>
        currentDeck.map((card) =>
          card.id === firstId || card.id === secondId ? { ...card, matched: true } : card
        )
      );
      setFlippedIds([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      setFlippedIds([]);
    }, 800);

    return () => window.clearTimeout(timeout);
  }, [deck, flippedIds]);

  useEffect(() => {
    if (isComplete) {
      setBestScore((currentBest) => (currentBest === null || moves < currentBest ? moves : currentBest));
    }
  }, [isComplete, moves]);

  const restart = () => {
    setDeck(shuffleDeck());
    setFlippedIds([]);
    setMoves(0);
  };

  const flipCard = (id: number) => {
    if (flippedIds.length === 2 || flippedIds.includes(id)) return;

    const selectedCard = deck.find((card) => card.id === id);
    if (!selectedCard || selectedCard.matched) return;

    setFlippedIds((current) => [...current, id]);
    setMoves((current) => current + 1);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Memory Match</h2>
          <Badge className="bg-red-500/20 text-red-100">Puzzle</Badge>
        </div>
        <div className="flex gap-3 text-sm text-white/80">
          <span>Moves: {moves}</span>
          <span>Pairs: {matchedPairs}/{emojis.length}</span>
          <span>Best: {bestScore ?? '--'}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/70">
        Flip two cards at a time and clear the full board in as few moves as possible.
      </p>

      <div className="memory-board">
        {deck.map((card) => {
          const isFlipped = card.matched || flippedIds.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              disabled={card.matched || flippedIds.length === 2 || flippedIds.includes(card.id)}
              aria-label={isFlipped ? `Card ${card.id}: ${card.emoji}` : `Reveal card ${card.id}`}
              onClick={() => flipCard(card.id)}
              className={`aspect-square rounded-2xl border text-3xl transition ${
                isFlipped
                  ? 'border-red-400/30 bg-red-500/10'
                  : 'border-white/10 bg-white/5 hover:border-red-400/40 hover:bg-red-500/10'
              }`}
            >
              {isFlipped ? card.emoji : '•'}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={restart} className="bg-red-600 hover:bg-red-500">
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </Button>
        {isComplete && <span className="text-sm font-semibold text-red-200">Board cleared!</span>}
      </div>
    </div>
  );
}
