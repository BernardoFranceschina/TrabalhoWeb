import { ref, computed, watch } from 'vue';
import { isValidMove, checkWinCondition } from '@/utils/game.js';
import { findBestMove } from '@/utils/bot.js';
import { useToast } from "vue-toastification";

import moveSoundFile from '@/assets/songs/move-self.mp3';
import captureSoundFile from '@/assets/songs/capture.mp3';

export function useGame(botLevel = ref(1)) {
  const toast = useToast();

  // --- Constantes ---
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const numbers = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const BOT_PLAYER = 'white';

  // --- Estado do jogo ---
  const gameMode = ref('pvp');
  const gameHistory = ref([]);
  const boardStates = ref([]);
  const historyPointer = ref(0);
  const winner = ref(null);

  // --- Propriedades de estado ---
  const currentBoard = computed(() => boardStates.value[historyPointer.value] || []);
  const currentPlayer = computed(() => historyPointer.value % 2 === 0 ? 'black' : 'white');
  const canUndo = computed(() => historyPointer.value > 0);
  const canRedo = computed(() => historyPointer.value < boardStates.value.length - 1);
  const selectedPiece = ref(null);

  // --- Áudios ---
  const moveAudio = new Audio(moveSoundFile);
  const captureAudio = new Audio(captureSoundFile);

  const formattedHistory = computed(() => {
    const rounds = [];
    for (let i = 0; i < gameHistory.value.length; i += 2) {
      const blackCapture = gameHistory.value[i]?.isCapture || false;
      const whiteCapture = gameHistory.value[i + 1]?.isCapture || false;
      const captureStatus = !blackCapture && !whiteCapture ? -1 : blackCapture && whiteCapture ? 2 : blackCapture ? 0 : 1;
      rounds.push({
        move: i / 2 + 1,
        black: gameHistory.value[i]?.notation,
        white: gameHistory.value[i + 1]?.notation || '...',
        capture: captureStatus
      });
    }
    return rounds;
  });

  const notationToCoords = (notation) => {
    const letter = notation.charAt(0).toUpperCase();
    const number = notation.charAt(1);
    const col = letters.indexOf(letter);
    const row = numbers.indexOf(number);
    return { row, col };
  };

  const lastMove = computed(() => {
    if (historyPointer.value === 0) return null;
    const moveNotation = gameHistory.value[historyPointer.value - 1];
    if (!moveNotation) return null;
    const [fromNotation, toNotation] = moveNotation.notation.split(':');
    return {
      from: notationToCoords(fromNotation),
      to: notationToCoords(toNotation),
    };
  });

  function playSound(audio) {
    const audioToPlay = audio;

    audioToPlay.currentTime = 0;
    
    audioToPlay.play().catch(error => {
      console.warn("A reprodução de áudio foi bloqueada pelo navegador:", error);
    });
  }

  // --- Ações do Jogo ---
  function initializeBoard() {
    const initialBoard = Array(8).fill(null).map(() => Array(8).fill(null).map(() => ({})));
    for (let i = 1; i < 7; i++) {
      initialBoard[0][i] = { piece: 'black' };
      initialBoard[7][i] = { piece: 'black' };
    }
    for (let i = 1; i < 7; i++) {
      initialBoard[i][0] = { piece: 'white' };
      initialBoard[i][7] = { piece: 'white' };
    }
    boardStates.value = [initialBoard];
    gameHistory.value = [];
    historyPointer.value = 0;
    winner.value = null;
    selectedPiece.value = null;
  }

  function startGame(mode) {
    initializeBoard();
    gameMode.value = mode;
  }

  function makeMove(from, to) {
    if (from.row === to.row && from.col === to.col) return;
    if (!isValidMove(currentBoard.value, from, to)) {
      toast.warning("Movimento inválido!");
      return;
    }
    if (currentBoard.value[to.row][to.col].piece === currentPlayer.value) return;

    if (canRedo.value) {
      boardStates.value = boardStates.value.slice(0, historyPointer.value + 1);
      gameHistory.value = gameHistory.value.slice(0, historyPointer.value);
    }

    const isCapture = !!currentBoard.value[to.row][to.col].piece;

    const pieceColor = currentPlayer.value;
    const fromCoord = `${letters[from.col]}${numbers[from.row]}`;
    const toCoord = `${letters[to.col]}${numbers[to.row]}`;
    const moveNotation = `${fromCoord}:${toCoord}`;

    const newBoardState = JSON.parse(JSON.stringify(currentBoard.value));
    newBoardState[to.row][to.col] = { piece: pieceColor };
    newBoardState[from.row][from.col] = {};

    const gameWinner = checkWinCondition(newBoardState, pieceColor);
    if (gameWinner) {
      winner.value = gameWinner;
    }

    gameHistory.value.push({ notation: moveNotation, isCapture });
    boardStates.value.push(newBoardState);
    historyPointer.value++;

    if (isCapture) playSound(captureAudio);
    else playSound(moveAudio);

    return true;
  }

  function calculateValidMoves(from) {
    if (!from) return [];

    const moves = [];
    const board = currentBoard.value;
    const pieceColor = board[from.row][from.col].piece;

    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        const to = { row: toRow, col: toCol };
        if (isValidMove(board, from, to) && board[toRow][toCol].piece !== pieceColor) {
          moves.push(to);
        }
      }
    }
    return moves;
  }

  function handleSquareClick({ row, col }) {
    if (winner.value || canRedo.value) return;

    if (gameMode.value === 'pvb' && currentPlayer.value === BOT_PLAYER) return;

    const clickedPiece = currentBoard.value[row]?.[col]?.piece;

    if (selectedPiece.value) {
      const from = selectedPiece.value;
      const to = { row, col };

      if (from.row === row && from.col === col) {
        selectedPiece.value = null;
        return;
      }

      if (clickedPiece === currentPlayer.value) {
        selectedPiece.value = to;
        return;
      }

      makeMove(from, to);
      selectedPiece.value = null;

    } else {
      if (clickedPiece === currentPlayer.value) {
        selectedPiece.value = { row, col };
      }
    }
  }

  function undo() { 
    if (canUndo.value) {
      const moveData = gameHistory.value[historyPointer.value - 2];
      historyPointer.value--; 
      selectedPiece.value = null;
      if (moveData?.isCapture) playSound(captureAudio);
      else playSound(moveAudio);
    }
  }

  function redo() { 
    if (canRedo.value) {
      // O movimento que estamos refazendo é o que está no índice atual
      const moveData = gameHistory.value[historyPointer.value];
      console.log("redo", moveData.notation, moveData.isCapture);
      
      historyPointer.value++; 
      selectedPiece.value = null; 
      if (moveData.isCapture) playSound(captureAudio);
      else playSound(moveAudio);
    } 
  }

  function goToStart() { 
    if (canUndo.value) { 
      historyPointer.value = 0; 
      selectedPiece.value = null;
      playSound(moveAudio);
    } 
  }

  function goToLast() { 
    if (canRedo.value) { 
      historyPointer.value = boardStates.value.length - 1; 
      selectedPiece.value = null; 
      playSound(moveAudio);
    } 
  }

  watch(currentPlayer, (newTurn) => {
    if (gameMode.value === 'pvb' && !winner.value && !canRedo.value && newTurn === BOT_PLAYER) {
      const botMove = findBestMove(currentBoard.value, BOT_PLAYER, botLevel.value);
      setTimeout(() => {
        if (botMove) {
          makeMove(botMove.from, botMove.to);
        }
      }, 500);
    }
  });

  return {
    letters, numbers, gameMode, winner, historyPointer, boardStates,
    currentBoard, currentPlayer, canUndo, canRedo,
    formattedHistory, lastMove,
    selectedPiece,
    startGame, makeMove, undo, redo, goToStart, goToLast,
    calculateValidMoves,
    handleSquareClick,
  };
}