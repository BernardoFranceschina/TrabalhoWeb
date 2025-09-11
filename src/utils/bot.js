import { isValidMove } from '@/utils/game.js';

const CAPTURE_BONUS = 5;
const CONNECTIVITY_BONUS = 50;
const CENTER_CONTROL_BONUS = 1;

export function findBestMove(board, botColor) {
  const legalMoves = getAllLegalMoves(board, botColor);

  if (legalMoves.length === 0) {
    return null;
  }

  // Avalia e pontua cada movimento legal
  const scoredMoves = legalMoves.map(move => {
    const score = evaluateMove(board, move, botColor);
    return { move, score };
  });

  // Ordena as jogadas da maior para a menor pontuação
  scoredMoves.sort((a, b) => b.score - a.score);

  // Filtra para pegar todas as jogadas com a pontuação máxima (para desempate)
  const bestScore = scoredMoves[0].score;
  const bestMoves = scoredMoves.filter(item => item.score === bestScore);

  // Escolhe aleatoriamente entre as melhores jogadas
  const chosenItem = bestMoves[Math.floor(Math.random() * bestMoves.length)];

  return chosenItem.move;
}

function evaluateMove(board, move, playerColor) {
  let score = 0;

  // Bônus por Captura
  if (board[move.to.row][move.to.col].piece) {
    score += CAPTURE_BONUS;
  }

  // Simula o movimento em um tabuleiro temporário
  const tempBoard = JSON.parse(JSON.stringify(board));
  tempBoard[move.to.row][move.to.col] = { piece: playerColor };
  tempBoard[move.from.row][move.from.col] = {};

  // Bônus por Conectividade
  const groupsBefore = countGroups(board, playerColor);
  const groupsAfter = countGroups(tempBoard, playerColor);
  if (groupsAfter < groupsBefore) {
    score += CONNECTIVITY_BONUS;
  }

  // Bônus por Controle do Centro
  // Distância de Manhattan do centro (3.5, 3.5)
  const distFromCenter = Math.abs(move.to.row - 3.5) + Math.abs(move.to.col - 3.5);
  // A pontuação é maior quanto menor a distância (7 - dist)
  score += (7 - distFromCenter) * CENTER_CONTROL_BONUS;
  
  return score;
}

// Conta quantos grupos de peças desconexas um jogador possui.
// Menos grupos = maior conectividade.
function countGroups(board, playerColor) {
  const pieces = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].piece === playerColor) {
        pieces.push({ row: r, col: c });
      }
    }
  }

  if (pieces.length === 0) return 0;

  let groupCount = 0;
  const visited = new Set();

  for (const piece of pieces) {
    const key = `${piece.row},${piece.col}`;
    if (!visited.has(key)) {
      groupCount++; // Encontramos uma nova peça de um grupo ainda não visitado
      const queue = [piece];
      visited.add(key);
      while(queue.length > 0) {
        const current = queue.shift();
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const neighbor = { row: current.row + dr, col: current.col + dc };
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (!visited.has(neighborKey) && board[neighbor.row]?.[neighbor.col]?.piece === playerColor) {
              visited.add(neighborKey);
              queue.push(neighbor);
            }
          }
        }
      }
    }
  }
  return groupCount;
}


// Encontra todos os movimentos legais para um determinado jogador.
function getAllLegalMoves(board, playerColor) {
  const legalMoves = [];
  const playerPieces = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].piece === playerColor) {
        playerPieces.push({ row: r, col: c });
      }
    }
  }

  for (const from of playerPieces) {
    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        const to = { row: toRow, col: toCol };
        if (isValidMove(board, from, to)) {
          if (board[to.row][to.col].piece !== playerColor) {
            legalMoves.push({ from, to });
          }
        }
      }
    }
  }

  return legalMoves;
}