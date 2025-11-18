<!-- components/ColorModeToggle.vue -->
<template>
  <UButton
    :icon="colorMode.value === 'dark' ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
    color="gray"
    variant="ghost"
    @click="toggleColorMode"
    :aria-label="colorMode.value === 'dark' ? 'Alternar para modo claro' : 'Alternar para modo escuro'"
  />
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

