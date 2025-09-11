<template>
  <v-container>
    <v-sheet
      class="d-flex flex-column flex-md-row align-center justify-center pa-4 rounded-lg mb-6"
      border
    >
      <nav class="mt-4 mt-md-0">
        <v-btn variant="text" @click="scrollTo('sobre')">Sobre o Jogo</v-btn>
        <v-btn variant="text" @click="scrollTo('regras')">Regras</v-btn>
        <v-btn variant="text" @click="scrollTo('descricao')">Descrição</v-btn>
        <v-btn variant="text" @click="showDomTree">Árvore DOM</v-btn>
      </nav>
    </v-sheet>

    <v-row>
      <v-col cols="12" md="8">
        <main>
          <v-sheet id="sobre" class="pa-5 mb-6 rounded-lg" border>
            <div class="d-flex align-center mb-4">
              <h2 class="text-h5 font-weight-bold">Sobre o Jogo</h2>
            </div>
            <p class="text-body-1">
              <strong>Lines of Action (LoA)</strong> é um jogo eletrônico de tabuleiro para dois jogadores, jogado num tabuleiro 8x8 com vinte e quatro peças (doze pretas e doze brancas), inventado por Claude Soucie por volta de 1960.
            </p>
            <p class="mt-3 text-body-1">
              Foi pela primeira vez publicado por Sid Sacksoan em 1969 em “A Gamut of Games” e foi um sucesso imediato entre os aficionados deste tipo de jogos.
            </p>
            <p class="mt-3 text-body-1">
              O LoA é indicado para maiores de dez anos e tem uma duração média de jogo de meia hora. Até ao momento não foi descoberto nenhuma sequência de jogadas que garanta uma probabilidade vitória de 100%. 
            </p>
          </v-sheet>

          <v-sheet id="regras" class="pa-5 mb-6 rounded-lg" border>
            <div class="d-flex align-center mb-4">
              <h2 class="text-h5 font-weight-bold">Regras</h2>
            </div>
            <v-list lines="two" bg-color="transparent">
              <v-list-item v-for="(regra, i) in regras" :key="i" class="mb-2">
                <template v-slot:prepend>
                  <v-avatar color="primary" class="mr-4">{{ i + 1 }}</v-avatar>
                </template>
                <v-list-item-title class="text-wrap font-weight-medium">{{ regra }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-sheet>

          <v-sheet id="descricao" class="pa-5 rounded-lg" border>
            <h2 class="text-h5 font-weight-bold mb-4">Descrição do Projeto</h2>
            <p class="text-body-1 mb-4">Este projeto tem como objetivo o desenvolvimento de uma aplicação web interativa para o jogo Lines of Action (LOA) e deve suportar tanto desktop como dispositivos móveis.</p>
            <p class="text-body-1 mb-4">A aplicação será hospedada no servidor virtual da UFSC (VPS-UFSC) e seguirá a arquitetura MVC.</p>
            <p class="text-body-1 mb-4">O sistema permitirá que os usuários joguem partidas contra outros jogadores ou contra um bot, com suporte a rankings, scores e persistência de dados em um banco MongoDB. A interface contará com um tabuleiro interativo, modos de visualização claro e escuro, avatares personalizáveis e funcionalidades como chat em tempo real, vídeochat com áudio entre jogadores, e fila dinâmica para gerenciamento de partidas.</p>
            <p class="text-body-1 mb-4">As partidas poderão ser gravadas em vídeo e áudio utilizando FFMPEG, armazenadas no banco de dados e compartilhadas por URL, com player embutido no sistema. Além disso, será implementado gerenciamento de filas, controle de avatares e administração do espaço de armazenamento de vídeos.</p>
            <p class="text-body-1">A aplicação será desenvolvida com HTML5, CSS3, JavaScript e MongoDB. Também serão aplicadas práticas de segurança, como proteção contra XSS, CSRF, injeção de código e exposição de dados sensíveis.</p>
          </v-sheet>
        </main>
      </v-col>

      <v-col cols="12" md="4">
        <aside>
          <h3 class="text-h6 font-weight-bold mb-4">Informações do Projeto</h3>
          
          <v-card class="mb-5" variant="outlined">
            <v-card-item>
              <v-card-title>Integrantes</v-card-title>
            </v-card-item>
            <v-list-item title="Bernardo Carlos Franceschina"></v-list-item>
            <v-list-item title="Vitor Fernando da Silva" class="mb-2"></v-list-item>
          </v-card>

          <v-card class="mb-5" variant="outlined">
            <v-card-item>
              <v-card-title>Recursos usados</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-chip class="mr-2 mb-2">Javascript</v-chip>
              <v-chip class="mr-2 mb-2">HTML</v-chip>
              <v-chip class="mr-2 mb-2">CSS</v-chip>
              <v-chip class="mr-2 mb-2">MongoDB</v-chip>
            </v-card-text>
          </v-card>

          <v-card class="mb-5" variant="outlined">
            <v-card-item>
              <v-card-title>Links</v-card-title>
            </v-card-item>
            <v-list>
                <v-list-item prepend-icon="mdi-school" title="Curso" href="https://presencial.moodle.ufsc.br/course/view.php?id=32192" target="_blank"></v-list-item>
                <v-list-item prepend-icon="mdi-github" title="GitHub" href="https://github.com/BernardoFranceschina/TrabalhoWeb" target="_blank"></v-list-item>
            </v-list>
          </v-card>
        </aside>
      </v-col>
    </v-row>

    <v-footer class="d-flex flex-column mt-8" border>
      <div class="text-center">
        <p>Lines of Action Web — Jogo online com chat, rankings e gravação de partidas.</p>
        <p>Projeto desenvolvido para a disciplina de Programação para Web (UFSC) 2025/2</p>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="text-center">
        <a href="mailto:vitor.fsz@proton.me" class="text-primary mx-2">vitor.fsz@proton.me</a>
        <a href="mailto:bernardofranceschina@gmail.com" class="text-primary mx-2">bernardofranceschina@gmail.com</a>
      </div>
    </v-footer>

    <v-dialog v-model="dialog" fullscreen scrim="false" transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="primary">
          <v-toolbar-title>Árvore DOM da Página (Tempo Real)</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        
        <v-card-text>
          <v-list>
            <DomTree v-if="rootNode" :node="rootNode" />
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import DomTree from '@/components/domTree.vue';

const dialog = ref(false);
const rootNode = ref(null);

function showDomTree() {
  rootNode.value = document.documentElement;
  dialog.value = true;
}

const regras = [
  "Cada jogador controla doze peças de uma cor, um jogador controla as peças pretas e o outro as brancas.",
  "As peças pretas são colocadas em duas filas, seis na fila de cima e seis na fila de baixo. As peças brancas são colocadas em duas colunas, seis na coluna da esquerda e seis na coluna da direita.",
  "Jogador com as peças pretas joga primeiro.",
  "Em cada volta, o jogador tem que mover uma peça, um certo número de casas em linha recta. O número de casas é exactamente igual ao número de peças, independentemente da sua cor, que existem na linha de movimento (Lines of Action = “Linhas de Acção”).",
  "O jogador pode saltar por cima das próprias peças.",
  "O jogador não pode saltar por cima das peças do adversário, mas pode captura-las, se a sua peça parar sobre a peça do adversário.",
  "O objectivo do jogo é colocar todas as peças que possui ligadas. As ligações entre peças podem ser verticais, horizontais ou diagonais. O primeiro jogador a consegui-lo é o vencedor.",
  "Se um jogador ficar reduzido, por capturas, a uma peça, esse jogador é o vencedor.",
  "Se numa jogada, ocorrer uma situação de vitória para ambos os jogadores, o jogador que efectuou essa jogada é o vencedor.",
  "Se um jogador não conseguir fazer nenhuma jogada, este jogador perde."
];

const scrollTo = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>