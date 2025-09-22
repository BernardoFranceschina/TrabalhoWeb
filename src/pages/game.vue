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
                    @click="handleSquareClick({ row: rowIndex, col: colIndex })"
                  >
                    <div
                      v-if="square.piece"
                      :class="['piece', square.piece === 'black' ? 'black-piece' : 'white-piece', { 'selected-piece': isSelected(rowIndex, colIndex) }]"
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
            style="min-height: 150px;"
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
            <v-table density="compact" class="move-history-table" fixed-header :style="winner ? 'max-height: 400px;' : 'max-height: 560px;'"  >
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
                >
                  <td>
                    <b class="text-primary" v-if="(item.move * 2 - 1) === historyPointer || (item.move * 2) === historyPointer">{{ item.move }}</b>
                    <span v-else>{{ item.move }}</span>
                  </td>
                  <td class="text-center" :class="{ 'active-ply': (item.move * 2 - 1) === historyPointer }">
                    <code><span v-if="item.capture == 0 || item.capture == 2">+</span>{{ item.black }}</code>
                  </td>
                  <td class="text-center" :class="{ 'active-ply': (item.move * 2) === historyPointer }">
                    <code><span v-if="item.capture == 1 || item.capture == 2">+</span>{{ item.white }}</code>
                  </td>
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
      <v-col class="d-flex align-center">
        <v-btn @click="startGame(gameMode)" class="ml-2">Reiniciar</v-btn>
        <template v-if="gameMode === 'pvp'">
          <v-btn @click="startGame('pvb')" class="ml-2">Jogar contra bot</v-btn>
        </template>
        <template v-else>
          <v-btn @click="startGame('pvp')" class="ml-2">Jogar contra jogador</v-btn>
          <v-select
            v-model="botLevel"
            :items="[
              { title: 'Nível 1 - Fácil', value: 1 },
              { title: 'Nível 2 - Médio', value: 2 },
              { title: 'Nível 3 - Difícil', value: 3 },
            ]"
            class="ml-2"
            style="max-width: 200px"
            density="compact"
            hide-details
          ></v-select>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useGame } from '@/composables/useGame.js';

const botLevel = ref(1);

const {
  letters, numbers, gameMode, winner, historyPointer, boardStates,
  currentBoard, currentPlayer, canUndo, canRedo, formattedHistory, lastMove, selectedPiece,
  startGame, makeMove, undo, redo, goToStart, goToLast,
  handleSquareClick, calculateValidMoves,
} = useGame(botLevel);

const historyContainerRef = ref(null);

async function handleDragAndDropMove(from, to) {
  const moveSuccessful = makeMove(from, to);
  
  if (moveSuccessful) {
    await nextTick();
    const scroller = historyContainerRef.value?.querySelector('.v-table__wrapper');
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }
}

watch(botLevel, () => {
  if (gameMode.value === 'pvb') {
    startGame('pvb');
  }
});

watch(historyPointer, async (newPointerValue) => {
  const scroller = historyContainerRef.value?.querySelector('.v-table__wrapper');
  if (!scroller) return;

  await nextTick();

  if (newPointerValue === 0) {
    scroller.scrollTop = 0;
  } else if (newPointerValue === boardStates.value.length - 1 && !winner.value) {
    scroller.scrollTop = scroller.scrollHeight;
  } else {
    const roundToShow = Math.ceil(newPointerValue / 2);
    if (roundToShow > 0) {
      const activeRow = scroller.querySelector(`tbody tr:nth-child(${roundToShow})`);
      if (activeRow) {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }
});

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
  if (selectedPiece.value) selectedPiece.value = null;

  event.dataTransfer.setData('fromRow', row);
  event.dataTransfer.setData('fromCol', col);
  event.dataTransfer.dropEffect = 'move';
}

function onDrop(event, toRow, toCol) {
  const fromRow = parseInt(event.dataTransfer.getData('fromRow'));
  const fromCol = parseInt(event.dataTransfer.getData('fromCol'));
  
  handleDragAndDropMove({ row: fromRow, col: fromCol }, { row: toRow, col: toCol });
}

  function getSquareClass(row, col) {
  const isLast = lastMove.value && (
    (lastMove.value.from.row === row && lastMove.value.from.col === col) ||
    (lastMove.value.to.row === row && lastMove.value.to.col === col)
  );

  const isValidMove = selectedPiece.value && calculateValidMoves(selectedPiece.value).some(
    move => move.row === row && move.col === col
  );

  return {
    'light-square': (row + col) % 2 === 0,
    'dark-square': (row + col) % 2 !== 0,
    'last-move-highlight': isLast,
    'valid-move': isValidMove,
  };
}const isSelected = (row, col) => {
  return selectedPiece.value && selectedPiece.value.row === row && selectedPiece.value.col === col;
};

onMounted(() => {
  startGame('pvp');
});

</script>

<style>
@import '@/assets/styles/game.scss';
</style>