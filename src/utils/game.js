export function isValidMove(board, from, to) {
  const piece = board[from.row][from.col].piece;
  if (!piece) {
    return false;
  }
  const isHorizontal = from.row === to.row;
  const isVertical = from.col === to.col;
  const isDiagonal = Math.abs(from.row - to.row) === Math.abs(from.col - to.col);
  if (!isHorizontal && !isVertical && !isDiagonal) {
    return false;
  }
  const piecesOnLine = countPiecesOnLine(board, from, to);
  const distance = Math.max(Math.abs(from.row - to.row), Math.abs(from.col - to.col));
  if (distance !== piecesOnLine) {
    return false;
  }
  if (isPathBlocked(board, from, to)) {
    return false;
  }
  return true;
}

function countPiecesOnLine(board, from, to) {
  let count = 0;
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  for (let i = 0; i < 8; i++) {
    const row = from.row - (dy * i);
    const col = from.col - (dx * i);
    if (board[row]?.[col]?.piece) count++;
  }
  for (let i = 1; i < 8; i++) {
    const row = from.row + (dy * i);
    const col = from.col + (dx * i);
    if (board[row]?.[col]?.piece) count++;
  }
  return count;
}

function isPathBlocked(board, from, to) {
  const movingPieceColor = board[from.row][from.col].piece;
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  const distance = Math.max(Math.abs(from.row - to.row), Math.abs(from.col - to.col));
  for (let i = 1; i < distance; i++) {
    const currentRow = from.row + dy * i;
    const currentCol = from.col + dx * i;
    const square = board[currentRow][currentCol];
    if (square.piece && square.piece !== movingPieceColor) {
      return true;
    }
  }
  return false;
}

export function checkWinCondition(board, lastPlayerToMove) {
  const blackPieces = [];
  const whitePieces = [];

  // Mapeia a posição de todas as peças
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c].piece === 'black') blackPieces.push({ row: r, col: c });
      if (board[r][c].piece === 'white') whitePieces.push({ row: r, col: c });
    }
  }

  const blackWins = (blackPieces.length === 1 && blackPieces.length > 0) || arePiecesConnected(board, 'black', blackPieces);
  const whiteWins = (whitePieces.length === 1 && whitePieces.length > 0) || arePiecesConnected(board, 'white', whitePieces);

  // Regra especial: se uma jogada cria uma condição de vitória para ambos, o jogador que fez a jogada vence.
  if (blackWins && whiteWins) {
    return lastPlayerToMove;
  }
  if (blackWins) return 'black';
  if (whiteWins) return 'white';

  return null;
}

// BFS
function arePiecesConnected(board, playerColor, pieces) {
  if (pieces.length <= 1) {
    return true; // 0 ou 1 peça são consideradas conectadas por padrão.
  }

  const visited = new Set();
  const queue = [pieces[0]]; // Começa a busca pela primeira peça
  const startKey = `${pieces[0].row},${pieces[0].col}`;
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift();

    // Verifica os 8 vizinhos (horizontal, vertical, diagonal)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const neighbor = { row: current.row + dr, col: current.col + dc };
        const neighborKey = `${neighbor.row},${neighbor.col}`;

        // Se o vizinho é uma peça da mesma cor e ainda não foi visitado...
        if (
          !visited.has(neighborKey) &&
          board[neighbor.row]?.[neighbor.col]?.piece === playerColor
        ) {
          visited.add(neighborKey);
          queue.push(neighbor);
        }
      }
    }
  }

  // Se o número de peças visitadas for igual ao total de peças, elas estão conectadas.
  return visited.size === pieces.length;
}