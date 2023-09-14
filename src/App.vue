<template>
  <div class="cssrender"></div>
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
  .tagBox {
    background-color: rgba(#00baff, 0.4);
    border-radius: 10px;
    padding: 10px;
    color: #000;
  }
  .cssrender {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    pointer-events: none;
  }
</style>
