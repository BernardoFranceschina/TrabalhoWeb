import { isValidMove } from '@/utils/game.js';

export function makeMove(board, move, color) {
  const newBoard = JSON.parse(JSON.stringify(board));;
  newBoard[move.to.row][move.to.col] = { piece: color };
  newBoard[move.from.row][move.from.col] = {};
  return newBoard;
}

export function getAllLegalMoves(board, playerColor) {
  const legalMoves = [];
  const playerPieces = [];

  // Encontra todas as peças do jogador
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].piece === playerColor) {
        playerPieces.push({ row: r, col: c });
      }
    }
  }

  // Para cada peça, verifica todos os movimentos possíveis no tabuleiro
  for (const from of playerPieces) {
    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        const to = { row: toRow, col: toCol };
        // Um movimento é legal se for válido e não capturar uma peça da mesma cor
        if (isValidMove(board, from, to) && board[to.row][to.col].piece !== playerColor) {
          legalMoves.push({ from, to });
        }
      }
    }
  }

  return legalMoves;
}