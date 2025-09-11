import { ref, computed, watch } from 'vue';
import { isValidMove, checkWinCondition } from '@/utils/game.js';
import { findBestMove } from '@/utils/bot.js';
import { useToast } from "vue-toastification";

export function useGame() {
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

  const formattedHistory = computed(() => {
    const rounds = [];
    for (let i = 0; i < gameHistory.value.length; i += 2) {
      rounds.push({
        move: i / 2 + 1,
        black: gameHistory.value[i],
        white: gameHistory.value[i + 1] || '...',
      });
    }
    return rounds;
  });
  
  const activeRoundNumber = computed(() => {
    if (canRedo.value || (historyPointer.value > 0 && historyPointer.value % 2 !== 0)) {
      return Math.ceil(historyPointer.value / 2);
    }
    return null;
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
    const [fromNotation, toNotation] = moveNotation.split(':');
    return {
      from: notationToCoords(fromNotation),
      to: notationToCoords(toNotation),
    };
  });

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
    
    gameHistory.value.push(moveNotation);
    boardStates.value.push(newBoardState);
    historyPointer.value++;
  }

  // --- Funções de Navegação no Histórico ---
  function undo() { if (canUndo.value) historyPointer.value--; }
  function redo() { if (canRedo.value) historyPointer.value++; }
  function goToStart() { if (canUndo.value) historyPointer.value = 0; }
  function goToLast() { if (canRedo.value) historyPointer.value = boardStates.value.length - 1; }
  
  // --- Lógica do Bot ---
  watch(currentPlayer, (newTurn) => {
    if (gameMode.value === 'pvb' && !winner.value && newTurn === BOT_PLAYER) {
      setTimeout(() => {
        const botMove = findBestMove(currentBoard.value, BOT_PLAYER);
        if (botMove) {
          makeMove(botMove.from, botMove.to);
        }
      }, 1000);
    }
  });

  return {
    letters,
    numbers,
    gameMode,
    winner,
    historyPointer,
    boardStates,

    currentBoard,
    currentPlayer,
    canUndo,
    canRedo,
    formattedHistory,
    activeRoundNumber,
    lastMove,

    startGame,
    makeMove,
    undo,
    redo,
    goToStart,
    goToLast,
  };
}