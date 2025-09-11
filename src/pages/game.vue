<template>
  <v-container class="d-flex justify-center align-center">
    <v-card flat border>
      <div class="d-flex">
        <div class="pa-2">
          <div class="layout-with-legends">
            <div class="d-flex">
              <div class="legend-corner"></div>
              <div v-for="letter in letters" :key="letter" class="legend-cell">
                {{ letter }}
              </div>
            </div>

            <div class="d-flex">
              <div class="d-flex flex-column">
                <div v-for="number in numbers" :key="number" class="legend-cell">
                  {{ number }}
                </div>
              </div>

              <div class="board-container">
                <div v-for="(row, rowIndex) in currentBoard" :key="rowIndex" class="d-flex">
                  <div
                    v-for="(square, colIndex) in row"
                    :key="`${rowIndex}-${colIndex}`"
                    :class="getSquareClass(rowIndex, colIndex)"
                    class="square"
                    @dragover.prevent
                    @drop="onDrop($event, rowIndex, colIndex)"
                  >
                    <div
                      v-if="square.piece"
                      :class="['piece', square.piece === 'black' ? 'black-piece' : 'white-piece']"
                      :draggable="isMoveAllowed(square.piece)"
                      @dragstart="onDragStart($event, rowIndex, colIndex)"
                    >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <v-card class="side-panel" flat>
          <v-list-item class="pa-4">
            <v-list-item-title class="text-h6">
              Lines of Action - {{ gameMode === 'pvb' ? 'PVB' : 'PVP' }}
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>

          <v-alert
            v-if="winner"
            density="compact"
            class="ma-2"
          >
            <div class="text-center font-weight-bold mb-2">FIM DE JOGO!</div>
            <div class="text-center mb-3">
              Vencedor: <strong>{{ winner == 'black' ? 'PRETAS' : 'BRANCAS' }}</strong>
            </div>
            <v-btn color="primary" variant="tonal" block @click="startGame(gameMode)">
              Jogar novamente
            </v-btn>
          </v-alert>

          <div ref="historyContainerRef" class="move-history-container">
            <v-table density="compact" class="move-history-table" fixed-header>
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">#</th>
                  <th class="text-center font-weight-bold">Pretas</th>
                  <th class="text-center font-weight-bold">Brancas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="formattedHistory.length === 0">
                  <td colspan="3" class="text-center text-grey py-4">Nenhuma jogada registrada.</td>
                </tr>
                <tr
                  v-for="item in formattedHistory"
                  :key="item.move"
                  :class="{ 'active-move': item.move === activeRoundNumber }"
                >
                  <td>{{ item.move }}</td>
                  <td class="text-center"><code>{{ item.black }}</code></td>
                  <td class="text-center"><code>{{ item.white }}</code></td>
                </tr>
              </tbody>
            </v-table>
          </div>
          
          <v-divider></v-divider>
          
          <div class="d-flex justify-space-between align-center pa-3">
            <h3 class="text-subtitle-1 font-weight-bold">
              Turno:
              <v-chip size="default" text-color="white" class="ml-2">
                {{ currentPlayer === 'black' ? 'PRETAS' : 'BRANCAS' }}
              </v-chip>
            </h3>

            <v-btn-group density="comfortable" variant="outlined">
              <v-btn @click="goToStart" :disabled="!canUndo" icon="mdi-skip-backward"></v-btn>
              <v-btn @click="undo" :disabled="!canUndo" icon="mdi-chevron-left"></v-btn>
              <v-btn @click="redo" :disabled="!canRedo" icon="mdi-chevron-right"></v-btn>
              <v-btn @click="goToLast" :disabled="!canRedo" icon="mdi-skip-forward"></v-btn>
            </v-btn-group>
          </div>
        </v-card>
      </div>
    </v-card>
  </v-container>
  <v-container>
    <v-row>
      <v-col>
        <v-btn @click="startGame(gameMode)" class="ml-2">Reiniciar</v-btn>
        <v-btn @click="startGame('pvb')" class="ml-2" v-if="gameMode === 'pvp'">Jogar contra bot</v-btn>
        <v-btn @click="startGame('pvp')" class="ml-2" v-else>Jogar contra jogador</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { isValidMove, checkWinCondition } from '@/utils/game.js';
import { findBestMove } from '@/utils/bot.js';
import { useToast } from "vue-toastification";

const toast = useToast();
const historyContainerRef = ref(null);

const gameMode = ref('pvp'); // 'pvp', ou 'pvb'

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const numbers = ['8', '7', '6', '5', '4', '3', '2', '1'];

const gameHistory = ref([]);
const boardStates = ref([]);
const historyPointer = ref(0);
const winner = ref(null);

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

onMounted(() => {
  startGame('pvp');
});

function startGame(mode) {
  initializeBoard();
  gameMode.value = mode;
}

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
  gameMode.value = 'pvp';
}

async function handlePieceMove(from, to) {
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
  
  await nextTick();
  if (historyContainerRef.value) {
    historyContainerRef.value.scrollTop = historyContainerRef.value.scrollHeight;
  }
}

function undo() { if (canUndo.value) historyPointer.value--; }
function redo() { if (canRedo.value) historyPointer.value++; }
function goToStart() { if (canUndo.value) historyPointer.value = 0; }
function goToLast() { if (canRedo.value) historyPointer.value = boardStates.value.length - 1; }

function isMoveAllowed(pieceColor) {
  if (winner.value) return false;
  
  if (gameMode.value === 'pvp') {
    return pieceColor === currentPlayer.value && !canRedo.value;
  }
  if (gameMode.value === 'pvb') {
    return pieceColor === 'black' && currentPlayer.value === 'black' && !canRedo.value;
  }

  return false;
}

function onDragStart(event, row, col) {
  if (!isMoveAllowed(currentBoard.value[row][col].piece)) {
    event.preventDefault();
    return;
  }
  event.dataTransfer.setData('fromRow', row);
  event.dataTransfer.setData('fromCol', col);
  event.dataTransfer.dropEffect = 'move';
}

function onDrop(event, toRow, toCol) {
  const fromRow = parseInt(event.dataTransfer.getData('fromRow'));
  const fromCol = parseInt(event.dataTransfer.getData('fromCol'));
  const from = { row: fromRow, col: fromCol };
  const to = { row: toRow, col: toCol };

  if (fromRow === toRow && fromCol === toCol) return;
  if (!isValidMove(currentBoard.value, from, to)) {
    toast.warning("Movimento inválido!");
    return;
  }
  if (currentBoard.value[toRow][toCol].piece === currentPlayer.value) return;

  handlePieceMove(from, to);
}

function getSquareClass(row, col) {
  const isLastMove = lastMove.value &&
    ( (lastMove.value.from.row === row && lastMove.value.from.col === col) ||
      (lastMove.value.to.row === row && lastMove.value.to.col === col) );

  return {
    'light-square': (row + col) % 2 === 0,
    'dark-square': (row + col) % 2 !== 0,
    'last-move-highlight': isLastMove,
  };
}

// --- Lógica do Bot ---
const BOT_PLAYER = 'white';

watch(currentPlayer, (newTurn) => {
  if (gameMode.value === 'pvb' && !winner.value && newTurn === BOT_PLAYER) {
    setTimeout(() => {
      const botMove = findBestMove(currentBoard.value, BOT_PLAYER);
      if (botMove) {
        handlePieceMove(botMove.from, botMove.to);
      }
    }, 1000);
  }
});

watch(historyPointer, async (newPointerValue) => {
  if (!historyContainerRef.value) return;
  await nextTick();
  if (newPointerValue === 0) {
    historyContainerRef.value.scrollTop = 0;
  } else if (newPointerValue === boardStates.value.length - 1 && !winner.value) {
    historyContainerRef.value.scrollTop = historyContainerRef.value.scrollHeight;
  } else {
    const roundToShow = Math.ceil(newPointerValue / 2);
    if (roundToShow > 0) {
      const activeRow = historyContainerRef.value.querySelector(`tbody tr:nth-child(${roundToShow})`);
      if (activeRow) {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }
});
</script>

<style>
@import '@/assets/styles/game.scss';
</style>