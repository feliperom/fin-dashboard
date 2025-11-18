<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'Dashboard Financeiro PJ',
  meta: [
    { name: 'description', content: 'Dashboard Financeiro para Desenvolvedor PJ' }
  ]
})
</script>
