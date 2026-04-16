<script setup lang="ts">
import { onMounted, ref } from 'vue'

const emit = defineEmits<{
  (e: 'canvas-ready', canvas: HTMLCanvasElement | null): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  emit('canvas-ready', canvasRef.value)
})
</script>

<template>
  <section class="preview">
    <canvas ref="canvasRef" />
  </section>
</template>

<style scoped>
.preview {
  display: grid;
  place-items: center;
  border: 1px solid #cccccc;
  border-radius: 14px;
  padding: 14px;
  background: #f9f9f9;
  overflow: auto;
}

canvas {
  max-width: 100%;
  height: auto;
  border: 1px dashed #b9b9b9;
  background-image:
    linear-gradient(45deg, #f2f2f2 25%, transparent 25%),
    linear-gradient(-45deg, #f2f2f2 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f2f2f2 75%),
    linear-gradient(-45deg, transparent 75%, #f2f2f2 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0;
}
</style>
