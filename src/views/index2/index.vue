<template>
  <div class="loading"></div>
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
  .loading {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 9;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    color: #00baff;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
  }
</style>
