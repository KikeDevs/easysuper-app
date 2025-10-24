<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl'
      | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
}>(), {
  icon: 'envelope',
  size: 'lg', // => text-lg (tu valor por defecto actual)
})

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl',
    '8xl': 'text-8xl',
    '9xl': 'text-9xl',
  }
  return map[props.size] ?? 'text-lg'
})
</script>

<template>
  <i :class="['inline-flex', sizeClass, 'fi', `fi-rr-${props.icon}`]"></i>
</template>
