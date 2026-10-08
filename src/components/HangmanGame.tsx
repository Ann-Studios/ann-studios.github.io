import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const words = [
  { answer: 'STUDIO', hint: 'A creative workspace' },
  { answer: 'PUZZLE', hint: 'A brain-teasing challenge' },
  { answer: 'ARCADE', hint: 'Fast-paced game style' },
  { answer: 'KNIGHT', hint: 'A chess piece and a warrior' },
  { answer: 'BUBBLE', hint: 'Something you pop in one of your games' },
  { answer: 'SNAKE', hint: 'A classic game that keeps growing' },
  { answer: 'PLANET', hint: 'A world orbiting a star' },
  { answer: 'FOREST', hint: 'A place filled with trees' },
  { answer: 'OCEAN', hint: 'A vast body of salt water' },
  { answer: 'CASTLE', hint: 'A fortress with towers' },
  { answer: 'ROCKET', hint: 'A vehicle that travels into space' },
  { answer: 'DRAGON', hint: 'A mythical creature that breathes fire' },
  { answer: 'PIRATE', hint: 'A treasure hunter on the high seas' },
  { answer: 'JUNGLE', hint: 'A dense tropical forest' },
  { answer: 'GUITAR', hint: 'A musical instrument with strings' },
  { answer: 'RAINBOW', hint: 'An arc of colors after rain' },
  { answer: 'COMPASS', hint: 'An instrument that points north' },
  { answer: 'DIAMOND', hint: 'A very hard gemstone' },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const getRandomWord = () => words[Math.floor(Math.random() * words.length)];

export function HangmanGame() {
  const [round, setRound] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  const wrongGuesses = guesses.filter((letter) => !round.answer.includes(letter));
  const revealedWord = round.answer.split('').map((letter) => (guesses.includes(letter) ? letter : '_'));
  const isWon = revealedWord.join('') === round.answer;
  const isLost = wrongGuesses.length >= 6;

  const drawing = useMemo(
    () => ['O', '|', '/', '\\', '/', '\\'].slice(0, wrongGuesses.length),
    [wrongGuesses.length]
  );

  const resetRound = () => {
    setRound(getRandomWord());
    setGuesses([]);
  };

  const chooseLetter = (letter: string) => {
    if (guesses.includes(letter) || isWon || isLost) return;

    const nextGuesses = [...guesses, letter];
    setGuesses(nextGuesses);

    const nextWrongGuesses = nextGuesses.filter((entry) => !round.answer.includes(entry));
    const nextRevealed = round.answer.split('').every((entry) => nextGuesses.includes(entry));

    if (nextRevealed) {
      setWins((current) => current + 1);
    } else if (nextWrongGuesses.length >= 6) {
      setLosses((current) => current + 1);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/40 p-5 shadow-[0_24px_50px_rgba(0,0,0,0.3)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Hangman</h2>
          <Badge className="bg-red-500/20 text-red-100">Word</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-white/80">Wins: {wins}</span>
          <span className="text-sm text-white/80">Losses: {losses}</span>
          <Button onClick={resetRound} className="bg-red-600 hover:bg-red-500">
            <RotateCcw className="mr-2 h-4 w-4" />
            New Word
          </Button>
        </div>
      </div>

      <div className="hangman-layout">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center text-white">
          <div className="hangman-drawing" aria-hidden="true">
            <div>{drawing[0] ?? ''}</div>
            <div>{drawing[2] ?? ''}{drawing[1] ?? ''}{drawing[3] ?? ''}</div>
            <div>{drawing[4] ?? ''} {drawing[5] ?? ''}</div>
          </div>
          <p className="mt-4 text-sm text-white/70">Wrong guesses: {wrongGuesses.length}/6</p>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-white/45">Hint</p>
          <p className="mt-2 text-lg text-white/80">{round.hint}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-3xl font-black tracking-[0.35em] text-white">
            {revealedWord.map((letter, index) => (
              <span key={`${letter}-${index}`} className="min-w-[28px]">
                {letter}
              </span>
            ))}
          </div>

          <div className="letter-board">
            {alphabet.map((letter) => {
              const used = guesses.includes(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={used || isWon || isLost}
                  onClick={() => chooseLetter(letter)}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                    used
                      ? 'border-white/10 bg-white/10 text-white/35'
                      : 'border-white/10 bg-black/25 text-white hover:border-red-400/40 hover:bg-red-500/10'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {(isWon || isLost) && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 text-white">
              <p className="text-xl font-bold">{isWon ? 'You saved the word' : 'Round lost'}</p>
              <p className="mt-2 text-white/70">
                {isWon ? 'Nice work. Ready for another word?' : `The answer was ${round.answer}.`}
              </p>
              <Button onClick={resetRound} className="mt-4 bg-red-600 hover:bg-red-500">
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
