<script setup lang="ts">
import GeneratorForm from './components/GeneratorForm.vue'
import PreviewCanvas from './components/PreviewCanvas.vue'
import { useIconGenerator } from './composables/useIconGenerator'
import { presetFonts } from './lib/formState'

const { form, handleCanvasReady, downloadPng, copyUrl } = useIconGenerator()
</script>

<template>
  <main class="app">
    <GeneratorForm
      :text="form.text"
      :board-bg-color="form.boardBgColor"
      :text-color="form.textColor"
      :font-size="form.fontSize"
      :font-family-preset="form.fontFamilyPreset"
      :font-family-custom="form.fontFamilyCustom"
      :preset-fonts="presetFonts"
      :bold="form.bold"
      :line-padding="form.linePadding"
      @update:text="form.text = $event"
      @update:board-bg-color="form.boardBgColor = $event"
      @update:text-color="form.textColor = $event"
      @update:font-size="form.fontSize = $event"
      @update:font-family-preset="form.fontFamilyPreset = $event"
      @update:font-family-custom="form.fontFamilyCustom = $event"
      @update:line-padding="form.linePadding = $event"
      @update:bold="form.bold = $event"
      @download="downloadPng"
      @copy-url="copyUrl"
    />
    <PreviewCanvas @canvas-ready="handleCanvasReady" />
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

.app {
  min-height: 100vh;
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(300px, 420px) minmax(0, 1fr);
  padding: 20px;
  background: linear-gradient(160deg, #f4f4f4, #e8ecef);
}

@media (max-width: 780px) {
  .app {
    grid-template-columns: 1fr;
  }
}
</style>
