const CAPTURE_BONUS = 5;
const CONNECTIVITY_BONUS = 50;
const CENTER_CONTROL_BONUS = 1;

/**
 * Conta quantos grupos de peças desconexas um jogador possui.
 * Usa um algoritmo de busca para encontrar componentes conectados.
*/
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
      groupCount++;
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

/**
 * Avalia a pontuação de um estado do tabuleiro do ponto de vista de um jogador.
 * Uma pontuação mais alta significa uma posição melhor para o jogador.
*/
export function evaluateBoardState(board, playerColor) {
    let score = 0;
    const opponentColor = playerColor === 'white' ? 'black' : 'white';

    let myPieces = 0;
    let opponentPieces = 0;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c].piece === playerColor) {
                myPieces++;
                // Bônus por controlar o centro do tabuleiro
                const distFromCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                score += (7 - distFromCenter) * CENTER_CONTROL_BONUS;
            } else if (board[r][c].piece === opponentColor) {
                opponentPieces++;
            }
        }
    }
    
    // Bônus por ter mais peças que o oponente
    score += (myPieces - opponentPieces) * CAPTURE_BONUS;

    // Fator crucial: conectividade. Menos grupos é melhor.
    const myGroups = countGroups(board, playerColor);
    const opponentGroups = countGroups(board, opponentColor);

    // Penaliza por cada grupo extra (1 grupo é ideal)
    score -= (myGroups - 1) * CONNECTIVITY_BONUS;
    // Bonifica por quebrar a conectividade do oponente (com peso menor)
    score += (opponentGroups - 1) * (CONNECTIVITY_BONUS / 2);

    return score;
}