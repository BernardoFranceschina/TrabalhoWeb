import { getAllLegalMoves, makeMove } from './botUtils';
import { evaluateBoardState } from './evaluation';

 // Estratégia Nível 1: Aleatória
function level1Strategy(board, botColor) {
  const legalMoves = getAllLegalMoves(board, botColor);
  if (legalMoves.length === 0) {
    return null;
  }
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

 // Estratégia Nível 2: Avaliação Simples (Minimax de 1 nível)
 // Avalia o resultado de cada movimento legal e escolhe um dos que levam à
 // melhor pontuação. Em caso de empate, escolhe aleatoriamente entre os melhores.
function level2Strategy(board, botColor) {
  const legalMoves = getAllLegalMoves(board, botColor);
  if (legalMoves.length === 0) {
    return null;
  }

  const scoredMoves = legalMoves.map(move => {
    const tempBoard = makeMove(board, move, botColor);
    const score = evaluateBoardState(tempBoard, botColor);
    return { move, score };
  });

  scoredMoves.sort((a, b) => b.score - a.score);

  const bestScore = scoredMoves[0].score;
  const bestMoves = scoredMoves.filter(item => item.score === bestScore);

  return bestMoves[Math.floor(Math.random() * bestMoves.length)].move;
}

export const strategies = {
  1: level1Strategy,
  2: level2Strategy,
  // 3: level3Strategy,
};