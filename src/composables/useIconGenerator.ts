import { renderIconCanvas } from '@ikura-hamu/icon-generator'
import { computed, reactive, ref, watch } from 'vue'
import { createInitialFormStateFromQuery, syncFormStateToQuery } from '../lib/formQuerySync'
import { defaultFormState, type FormState } from '../lib/formState'

const FALLBACK_DOWNLOAD_NAME = 'ikura-hamu-board.png'

const renderDependencies = (form: FormState) => [
  form.text,
  form.boardBgColor,
  form.textColor,
  form.fontSize,
  form.fontFamilyPreset,
  form.fontFamilyCustom,
  form.bold,
  form.linePadding,
]

function createDownloadName(text: string): string {
  const normalizedText = text.replace(/\s+/g, '_').slice(0, 20)
  return normalizedText.length > 0 ? `ikura-hamu_${normalizedText}.png` : FALLBACK_DOWNLOAD_NAME
}

export function useIconGenerator() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const form = reactive<FormState>(
    createInitialFormStateFromQuery(window.location.search, defaultFormState),
  )
  let isRendering = false
  let hasQueuedRender = false

  const downloadName = computed(() => createDownloadName(form.text))

  const resolvedFontFamily = computed(() => {
    const custom = form.fontFamilyCustom.trim()
    return custom.length > 0 ? custom : form.fontFamilyPreset
  })

  const resolvedFont = computed(() => `${form.fontSize}px ${resolvedFontFamily.value}`)

  const renderPreview = async (): Promise<void> => {
    if (!canvasRef.value) {
      return
    }

    if (isRendering) {
      hasQueuedRender = true
      return
    }

    isRendering = true
    const canvas = canvasRef.value

    try {
      await renderIconCanvas({
        canvas,
        text: form.text,
        boardBgColor: form.boardBgColor,
        textColor: form.textColor,
        fontSize: form.fontSize,
        fontName: resolvedFont.value,
        bold: form.bold,
        linePadding: form.linePadding,
      })
    } catch {
      // Keep the current preview when the bundled character image cannot be loaded.
    } finally {
      isRendering = false

      if (hasQueuedRender) {
        hasQueuedRender = false
        void renderPreview()
      }
    }
  }

  const handleCanvasReady = (canvas: HTMLCanvasElement | null): void => {
    canvasRef.value = canvas
    void renderPreview()
  }

  const downloadPng = (): void => {
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
      anchor.download = downloadName.value.trim() || FALLBACK_DOWNLOAD_NAME
      anchor.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const copyUrl = (): void => {
    const url = new URL(window.location.href)
    void navigator.clipboard.writeText(url.toString())
  }

  syncFormStateToQuery(form, defaultFormState)

  watch(
    () => renderDependencies(form),
    () => {
      void renderPreview()
      syncFormStateToQuery(form, defaultFormState)
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
        await renderPreview()
      } catch {
        // Keep current rendering when a web font cannot be loaded.
      }
    },
    { immediate: true },
  )

  return {
    form,
    handleCanvasReady,
    downloadPng,
    copyUrl,
  }
}
