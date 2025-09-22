import { strategies } from './bots/strategies';

const DEFAULT_LEVEL = 1;

export function findBestMove(board, botColor, level = DEFAULT_LEVEL) {
  const strategy = strategies[level] || strategies[DEFAULT_LEVEL];
  
  return strategy(board, botColor);
}