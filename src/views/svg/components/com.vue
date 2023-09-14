<template>
  <svg class="svgBox">
    <g>
      <circle :cx="200" :cy="10" :r="10" fill="#00baff" />
      <circle :cx="50" :cy="320" :r="10" fill="#00baff" />
      <circle :cx="350" :cy="320" :r="10" fill="#00baff" />
    </g>
    <circle :cx="size / 2" :cy="size / 2" :r="(size - 10) / 2" stroke="#00baff" stroke-width="2" fill="#efefef" />
    <circle :cx="size / 2" :cy="size / 2" :r="(size - 40) / 2" stroke="transparent" stroke-width="2" fill="#fff" />
    <g>
      <path
        draggable
        class="pathItem"
        d="M 200 200 L 380 200 A 180 180 0 0 1 200 380 "
        stroke="#00baff"
        fill="transparent"
        stroke-width="1"
        @dragstart="handleStart"
        @drop="handleDrop"
        @click="handleClick(1)"
      ></path>
      <path
        class="pathItem"
        d="M 200 200 L 200 380 A 180 180 0 0 1 20 200 Z"
        stroke="#00baff"
        fill="transparent"
        stroke-width="1"
        @click="handleClick(2)"
      ></path>
      <path
        class="pathItem"
        d="M 200 200 L 20 200 A 180 180 0 0 1 200 20 Z"
        stroke="#00baff"
        fill="transparent"
        stroke-width="1"
        @click="handleClick(3)"
      ></path>
      <path
        class="pathItem"
        d="M 200 200 L 200 20 A 180 180 0 0 1 380 200 Z"
        stroke="#00baff"
        fill="transparent"
        stroke-width="1"
        @click="handleClick(4)"
      ></path>
    </g>
    <g>
      <text x="20" y="20">A区</text>
      <text :x="380 - 30" y="20">B区 {{ num }}</text>
      <text x="20" :y="380 - 30">C区</text>
      <text :x="380 - 30" :y="380 - 30">D区</text>
    </g>
    <g>
      <circle :cx="200" :cy="200" :r="80" stroke="#00baff" stroke-width="8" fill="#efefef" />
      <rect x="150" y="170" width="100" height="60" stroke="#00baff" stroke-width="2" fill="#efefef" />
      <image :href="imgSrc" x="160" y="175" alt="" width="80" height="50" />
    </g>
    <g>
      <circle :cx="170" :cy="250" :r="6" stroke-width="2" stroke="#00baff" fill="transparent" />
      <circle :cx="230" :cy="250" :r="6" stroke-width="2" stroke="#00baff" fill="transparent" />
      <line stroke-width="2" stroke="#00baff" x1="176" y1="248" x2="224" y2="248" />
      <line stroke-width="2" stroke="#00baff" x1="176" y1="252" x2="224" y2="252" />
    </g>
    <svg x="80.41669750802298" y="74">
      <foreignObject width="80" height="50" class="text-center cursor-pointer text-xs">
        <div draggable="true" style="background-color: red" @dragstart="drag" @drop="drop" @dragover="allowDrop">
          <p class="shelf-code" title="SS00000314">SS00000314</p>
          <p title="1 * 10">1*10</p>
        </div>
      </foreignObject>
    </svg>
  </svg>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import imgSrc from '../../../assets/4.png';
  // A rx,ry ratation_deg,flag1,flag2,x2,y2
  defineProps<{
    size: number;
  }>();

  const num = ref(1);
  setInterval(() => {
    num.value++;
  }, 1000);

  function handleClick(val) {
    console.log(val);
  }
  function handleDrop(e: DragEvent) {
    console.log(e);

    e.preventDefault();
  }
  function handleStart(e) {
    console.log(e);
  }

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function drag(ev) {
    console.log(ev);

    ev.dataTransfer.setData('text', ev.target.id);
  }

  function drop(ev) {
    console.log(ev);

    ev.preventDefault();
    let data = ev.dataTransfer.getData('text');
    ev.target.appendChild(document.getElementById(data));
  }
</script>

<style scoped lang="less">
  .svgBox {
    width: 100%;
    height: 100%;
  }
  .pathItem {
    transition: all 0.2s linear;
    cursor: pointer;
    &:hover {
      fill: red;
    }
  }
</style>
