<template>
  <div>
    params: {{ route.params }}
    <div>query: {{ route.query }}</div>
    <button @click="tob">a</button>
  </div>
</template>

<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';

  const route = useRoute();
  console.log(route.query, route.params);

  const router = useRouter();
  const tob = () => {
    router.push({
      path: '/b',
      query: {
        name: 'azhongw中文。。，‘-&?a=123.pdf',
        age: 12,
      },
    });
  };
</script>

<style scoped></style>
