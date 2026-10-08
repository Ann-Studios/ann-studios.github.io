import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Games from './Games';
import { TicTacToeGame } from './components/TicTacToeGame';
import { BreakoutGame } from './components/BreakoutGame';
import { SnakeGame } from './components/SnakeGame';

test('catalog links directly to local games and supports filtering and recovery', () => {
  render(<MemoryRouter><Games /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Play Eat Your Food!' })).toHaveAttribute('href', '/play/eat-your-food');
  expect(screen.getByRole('link', { name: 'Play Breakout Neon' })).toHaveAttribute('href', '/play/breakout');
  fireEvent.click(screen.getByRole('button', { name: 'Word' }));
  expect(screen.getByRole('link', { name: 'Play Hangman' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Play Breakout Neon' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing game' } });
  expect(screen.getByText('No games found')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show all games' }));
  expect(screen.getAllByRole('link')).toHaveLength(10);
});

test('restarting tic-tac-toe cancels a pending computer move in Strict Mode', () => {
  jest.useFakeTimers();
  render(<StrictMode><TicTacToeGame /></StrictMode>);
  fireEvent.click(screen.getByRole('button', { name: 'Square 1, empty' }));
  fireEvent.click(screen.getByRole('button', { name: 'New Round' }));
  act(() => { jest.advanceTimersByTime(500); });
  expect(screen.getAllByRole('button', { name: /Square .*empty/ })).toHaveLength(9);
  fireEvent.click(screen.getByRole('button', { name: 'Square 1, empty' }));
  act(() => { jest.advanceTimersByTime(500); });
  expect(screen.getByRole('button', { name: 'Square 5, O' })).toBeInTheDocument();
  jest.useRealTimers();
});

test('Breakout keeps its board across scoring and pause/resume', () => {
  const context = { beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn(), closePath: jest.fn(), fillRect: jest.fn(), fillText: jest.fn(), clearRect: jest.fn() };
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  let frame: FrameRequestCallback = () => {};
  const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frame = callback; return 1; });
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  render(<BreakoutGame />);
  fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));
  for (let tick = 0; tick < 90; tick++) act(() => { frame(tick * 16); });
  expect(screen.getByText('Score: 100')).toBeInTheDocument();
  expect(getContext).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(document, { key: ' ' });
  expect(screen.getByText('Paused')).toBeInTheDocument();
  const drawCount = context.clearRect.mock.calls.length;
  act(() => { frame(1500); });
  expect(context.clearRect).toHaveBeenCalledTimes(drawCount);
  fireEvent.click(screen.getAllByRole('button', { name: 'Resume' })[0]);
  act(() => { frame(1600); });
  expect(getContext).toHaveBeenCalledTimes(1);
  expect(context.clearRect.mock.calls.length).toBeGreaterThan(drawCount);
  getContext.mockRestore(); raf.mockRestore(); cancel.mockRestore();
});

test('Snake retains its session when paused and resumes on-screen controls', () => {
  jest.useFakeTimers();
  const gradient = { addColorStop: jest.fn() };
  const context = { beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn(), fillRect: jest.fn(), stroke: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), createLinearGradient: () => gradient, createRadialGradient: () => gradient };
  const getContext = jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  render(<SnakeGame />);
  fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));
  fireEvent.click(screen.getByRole('button', { name: 'Move right' }));
  act(() => { jest.advanceTimersByTime(300); });
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
  const draws = context.fillRect.mock.calls.length;
  act(() => { jest.advanceTimersByTime(300); });
  expect(context.fillRect).toHaveBeenCalledTimes(draws);
  fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
  act(() => { jest.advanceTimersByTime(150); });
  expect(context.fillRect.mock.calls.length).toBeGreaterThan(draws);
  expect(getContext).toHaveBeenCalledTimes(1);
  getContext.mockRestore();
  jest.useRealTimers();
});
