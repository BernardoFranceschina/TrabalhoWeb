<template>
  <div>
    <v-app-bar app flat border>
      <v-container class="d-flex align-center pa-0">
        <v-app-bar-title class="font-weight-bold" style="cursor: pointer;" @click="router.push('/')">
          Lines of Action
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <div class="d-none d-md-flex align-center">
          <v-btn variant="text" to="/game">Jogo</v-btn>
          <v-btn variant="text" to="/">Sobre</v-btn>
          <v-btn variant="text" to="/login">Login</v-btn>

          <v-btn
            @click="toggleTheme"
            :icon="theme.global.name.value === 'dark' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
            class="ml-2"
          ></v-btn>
        </div>

        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </v-container>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary app location="right">
      <v-list>
        <v-list-item prepend-icon="mdi-chess-pawn" title="Jogo" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-information-outline" title="Sobre" @click="scrollTo('sobre')"></v-list-item>
        <v-list-item prepend-icon="mdi-gavel" title="Regras" @click="scrollTo('regras')"></v-list-item>
        <v-list-item prepend-icon="mdi-text-box-outline" title="Descrição" @click="scrollTo('descricao')"></v-list-item>
        <v-divider class="my-2"></v-divider>
        <v-list-item prepend-icon="mdi-login-variant" title="Login" to="/login"></v-list-item>
        <v-list-item prepend-icon="mdi-theme-light-dark" title="Mudar Tema" @click="toggleTheme"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import { useRouter, useRoute } from 'vue-router';

const drawer = ref(false);
const theme = useTheme();
const router = useRouter();
const route = useRoute();

function toggleTheme () {
  theme.change(theme.global.name.value === 'dark' ? 'light' : 'dark');
  localStorage.setItem('theme', theme.global.name.value)
}
</script>