<template>
  <div>
    query: {{ route.query }}
    <button @click="toa">a</button>
  </div>
</template>

<script setup lang="ts">
  import { useRoute, useRouter } from 'vue-router';
  const route = useRoute();
  const router = useRouter();
  const toa = () => {
    router.push({
      name: 'a',
      query: {
        b: JSON.stringify(['asd', { a: ['asd'] }]),
      },
      params: {
        name: 'aazhongw中文。。，‘-&?a=123.pdf',
        age: 12,
      },
    });
  };
</script>

<style scoped></style>
