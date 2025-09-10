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
              Lines of Action
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>

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
                  <td colspan="3" class="text-center text-grey py-4">Aguardando jogadas...</td>
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
        <v-btn @click="initializeBoard()">Reiniciar jogo</v-btn>
        <v-btn @click="runSequence()" class="ml-2" disabled>Vencer jogo</v-btn>
      </v-col>
    </v-row>
  </v-container>
  <v-overlay
    :model-value="!!winner"
    class="align-center justify-center text-center"
    persistent
  >
    <v-sheet elevation="12" class="pa-8" rounded="lg">
      <h1 class="text-h4 font-weight-bold mb-4">FIM DE JOGO!</h1>
      <h2 class="text-h5 mb-6">
        O VENCEDOR É:
        <v-chip size="x-large" :color="winner === 'black' ? 'black' : 'white'" class="ml-2">
          {{ winner === 'black' ? 'PRETAS' : 'BRANCAS' }}
        </v-chip>
      </h2>
      <v-btn
        color="primary"
        size="large"
        @click="initializeBoard"
        prepend-icon="mdi-restart"
      >
        Jogar Novamente
      </v-btn>
    </v-sheet>
  </v-overlay>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { isValidMove, checkWinCondition } from '@/utils/game.js'; 
import { useToast } from "vue-toastification";

const toast = useToast();
const historyContainerRef = ref(null);

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
  if (canRedo.value) {
    return Math.ceil(historyPointer.value / 2);
  }
  if (historyPointer.value > 0 && historyPointer.value % 2 !== 0) {
      return Math.ceil(historyPointer.value / 2);
  }
  return null;
});

// --- NOVA FUNÇÃO E PROPRIEDADE COMPUTADA PARA O DESTAQUE ---

// Função auxiliar para converter notação em coordenadas
const notationToCoords = (notation) => {
  const letter = notation.charAt(0).toUpperCase();
  const number = notation.charAt(1);
  const col = letters.indexOf(letter);
  const row = numbers.indexOf(number);
  return { row, col };
};

// Propriedade computada que armazena as coordenadas da última jogada
const lastMove = computed(() => {
  if (historyPointer.value === 0) return null; // Nenhuma jogada foi feita

  const moveNotation = gameHistory.value[historyPointer.value - 1];
  if (!moveNotation) return null;

  const [fromNotation, toNotation] = moveNotation.split(':');
  
  return {
    from: notationToCoords(fromNotation),
    to: notationToCoords(toNotation),
  };
});

// -----------------------------------------------------------------

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

function runSequence(sequence) {
  initializeBoard();
  const getCoords = (notation) => {
    const letter = notation.charAt(0);
    const number = notation.charAt(1);
    const col = letters.indexOf(letter);
    const row = numbers.indexOf(number);
    return { row, col };
  };
  sequence.forEach(moveString => {
    const [fromNotation, toNotation] = moveString.split(':');
    const from = getCoords(fromNotation);
    const to = getCoords(toNotation);
    handlePieceMove(from, to);
  });
}

function undo() { if (canUndo.value) historyPointer.value--; }
function redo() { if (canRedo.value) historyPointer.value++; }
function goToStart() { if (canUndo.value) historyPointer.value = 0; }
function goToLast() { if (canRedo.value) historyPointer.value = boardStates.value.length - 1; }

function isMoveAllowed(pieceColor) {
  if (winner.value) return false;
  return pieceColor === currentPlayer.value && !canRedo.value;
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

// MUDANÇA: A função agora retorna um objeto de classes
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

onMounted(() => {
  initializeBoard();
});

watch(historyPointer, async (newPointerValue) => {
  if (!historyContainerRef.value) return;

  await nextTick();

  if (newPointerValue === 0) {
    historyContainerRef.value.scrollTop = 0;
  } else if (newPointerValue === boardStates.value.length - 1) {
    historyContainerRef.value.scrollTop = historyContainerRef.value.scrollHeight;
  } else {
    const roundToShow = Math.ceil(newPointerValue / 2);
    if (roundToShow > 0) {
      const activeRow = historyContainerRef.value.querySelector(`tbody tr:nth-child(${roundToShow})`);
      if (activeRow) {
        activeRow.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }
});

</script>

<style scoped>
.last-move-highlight {
  background-color: rgba(255, 88, 88, 0.62) !important;
}

.active-move {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
  font-weight: bold;
}

/* Estilos para o painel lateral */
.side-panel { width: 320px; border-left: 1px solid rgba(0,0,0,0.12); display: flex; flex-direction: column; }
.v-theme--dark .side-panel { border-left: 1px solid rgba(255,255,255,0.12); }
.move-history-container { flex-grow: 1; overflow-y: auto; max-height: 400px; }
.move-history-table { width: 100%; }

/* Estilos anteriores */
.layout-with-legends { display: inline-block; font-family: sans-serif; font-weight: bold; color: #757575; }
.legend-corner { width: 30px; height: 30px; }
.legend-cell { width: 60px; height: 30px; display: flex; justify-content: center; align-items: center; }
.d-flex.flex-column .legend-cell { width: 30px; height: 60px; }
.board-container { border: 2px solid black; width: fit-content; }
.square { width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; position: relative; } /* Adicionado position: relative */
.light-square { background-color: #FFFFFF; }
.dark-square { background-color: #E0E0E0; }
.piece { width: 80%; height: 80%; border-radius: 50%; cursor: grab; box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.2); }
.piece:active { cursor: grabbing; }
.piece[draggable="false"] { cursor: not-allowed; }
.black-piece { background-color: #1E1E1E; border: 2px solid #5E5E5E; }
.white-piece { background-color: #F5F5F5; border: 2px solid #BDBDBD; }
code { background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
.v-theme--dark code { background-color: #333; }
</style>