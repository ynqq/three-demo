<template>
  <div ref="mainRef" class="main"></div>
  <Model v-if="showModel" />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import Model from './components/model.vue';
  import { showModel } from './components/util';
  import './components/test';

  import Index from './index';

  const mainRef = ref<HTMLDivElement>();

  function init() {
    new Index(mainRef.value!);
  }

  onMounted(() => {
    init();
  });
</script>

<style scoped lang="less">
  .main {
    width: 100%;
    height: 100%;
  }
</style>
