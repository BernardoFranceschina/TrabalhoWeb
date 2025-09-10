<template>
  <v-list-item>
    <v-list-item-title>
      <code class="font-weight-bold">&lt;{{ node.tagName.toLowerCase() }}&gt;</code>
      <span v-if="node.id" class="text-blue ml-2">#{{ node.id }}</span>
      <span v-if="node.className && typeof node.className === 'string'" class="text-purple ml-2">
        .{{ node.className.split(' ').join('.') }}
      </span>
    </v-list-item-title>

    <v-list-group v-if="filteredChildren.length > 0" :value="uniqueId">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" title="..."></v-list-item>
      </template>

      <dom-tree v-for="(child, index) in filteredChildren" :key="index" :node="child" />
    </v-list-group>
  </v-list-item>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const uniqueId = Math.random().toString(36).slice(2);

const filteredChildren = computed(() => {
  return Array.from(props.node.children).filter(child =>
    child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && child.nodeType === 1
  );
});
</script>

<style scoped>
code {
  color: #c41a16;
}
.v-theme--dark code {
  color: #ff8b82;
}
</style>