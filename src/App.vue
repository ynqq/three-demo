<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less">
  html,
  body {
    width: 100%;
    height: 100%;
  }
  #app,
  .app {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
