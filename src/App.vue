<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import GeneratorForm from './components/GeneratorForm.vue'
import PreviewCanvas from './components/PreviewCanvas.vue'
import { renderCanvas } from './lib/renderCanvas'

type FormState = {
  text: string
  boardBgColor: string
  textColor: string
  fontSize: number
  fontFamilyPreset: string
  fontFamilyCustom: string
  bold: boolean
  linePadding: number
}

const CHARACTER_SRC = '/character3.png'

const presetFonts = [
  'Noto Sans JP',
  'Hiragino Sans',
  'Yu Gothic',
  'Meiryo',
  'Arial',
  'sans-serif',
  'Zen Kurenaido',
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageReady = ref(false)
const characterImage = new Image()

const form = reactive<FormState>({
  text: `いくら
・
はむ`,
  boardBgColor: '#007AFF',
  textColor: '#FFFFFF',
  fontSize: 20,
  fontFamilyPreset: 'Noto Sans JP',
  fontFamilyCustom: '',
  bold: false,
  linePadding: 0,
})

const downloadName = computed(() => {
  const normalizedText = form.text.replace(/\s+/g, '_').slice(0, 20)
  return normalizedText.length > 0 ? `ikura-hamu_${normalizedText}.png` : 'ikura-hamu-board.png'
})

const resolvedFontFamily = computed(() => {
  const custom = form.fontFamilyCustom.trim()
  if (custom.length > 0) {
    return custom
  }
  return form.fontFamilyPreset
})

const resolvedFont = computed(() => `${form.fontSize}px ${resolvedFontFamily.value}`)

function handleCanvasReady(canvas: HTMLCanvasElement | null): void {
  canvasRef.value = canvas
  renderPreview()
}

function renderPreview(): void {
  renderCanvas({
    imageReady: imageReady.value,
    canvas: canvasRef.value,
    characterImage,
    text: form.text,
    boardBgColor: form.boardBgColor,
    textColor: form.textColor,
    fontSize: form.fontSize,
    resolvedFont: resolvedFont.value,
    bold: form.bold,
    linePadding: form.linePadding,
  })
}

function downloadPng(): void {
  if (!canvasRef.value) {
    return
  }

  canvasRef.value.toBlob((blob) => {
    if (!blob) {
      return
    }

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadName.value.trim() || 'ikura-hamu-board.png'
    anchor.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

onMounted(() => {
  characterImage.onload = () => {
    imageReady.value = true
    renderPreview()
  }
  characterImage.src = CHARACTER_SRC
})

watch(
  () => [
    form.text,
    form.boardBgColor,
    form.textColor,
    form.fontSize,
    form.fontFamilyPreset,
    form.fontFamilyCustom,
    form.bold,
    form.linePadding,
  ],
  () => {
    renderPreview()
  },
)

watch(
  () => resolvedFont.value,
  async (font) => {
    if (!('fonts' in document)) {
      return
    }

    try {
      await document.fonts.load(font, form.text || 'あ')
      renderPreview()
    } catch {
      // Keep current rendering when a web font cannot be loaded.
    }
  },
  { immediate: true },
)
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
