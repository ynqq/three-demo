<template>
  <div class="container">
    <div class="box">
      <Com :size="400" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Com from './components/com.vue';
</script>

<style scoped>
  .container {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .box {
    width: 400px;
    height: 400px;
  }
</style>
