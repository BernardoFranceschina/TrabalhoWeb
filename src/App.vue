<template>
  <v-app>
    <nav-bar />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import navBar from '@/components/navBar.vue';
</script>