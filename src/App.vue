<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

type FormState = {
  text: string
  boardBgColor: string
  textColor: string
  fontSize: number
  fontFamilyPreset: string
  fontFamilyCustom: string
}

type BoardMetrics = {
  lines: string[]
  lineHeight: number
  width: number
  height: number
}

type CanvasLayout = {
  width: number
  height: number
  charX: number
  charY: number
  boardPivotX: number
  boardPivotY: number
}

const CHARACTER_SRC = '/character3.png'
const CHARACTER_SCALE = 0.9
const CHARACTER_POLE_TOP = { x: 0.483, y: 0.406 }
const BOARD_PADDING_X = 7
const BOARD_PADDING_Y = 5
const BOARD_BORDER_COLOR = '#000000'
const BOARD_BORDER_WIDTH = 4
const CANVAS_MARGIN = 28
const BOARD_ROTATION_DEG = 25
const BOARD_ROTATION_RAD = (BOARD_ROTATION_DEG * Math.PI) / 180
const BOARD_ANCHOR_OFFSET_X = 4
const BOARD_ANCHOR_OFFSET_Y = 1
const BOARD_MIN_WIDTH = 100
const BOARD_MIN_HEIGHT = 40

const presetFonts = ['Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Arial', 'sans-serif']

const canvasRef = ref<HTMLCanvasElement | null>(null)
const downloadName = ref('ikura-hamu-board.png')
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
})

const resolvedFontFamily = computed(() => {
  const custom = form.fontFamilyCustom.trim()
  if (custom.length > 0) {
    return custom
  }
  return form.fontFamilyPreset
})

const resolvedFont = computed(() => `${form.fontSize}px ${resolvedFontFamily.value}`)

function getLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  return lines.length > 0 ? lines : ['']
}

function computeBoardMetrics(ctx: CanvasRenderingContext2D): BoardMetrics {
  ctx.font = resolvedFont.value

  const lines = getLines(form.text)
  const lineHeight = Math.max(16, form.fontSize)

  let maxTextWidth = 0
  for (const line of lines) {
    const measured = line.length === 0 ? form.fontSize * 0.55 : ctx.measureText(line).width
    maxTextWidth = Math.max(maxTextWidth, measured)
  }

  const width = Math.max(Math.ceil(maxTextWidth + BOARD_PADDING_X * 2), BOARD_MIN_WIDTH)
  const height = Math.max(
    Math.ceil(lines.length * lineHeight + BOARD_PADDING_Y * 2),
    BOARD_MIN_HEIGHT,
  )

  return { lines, lineHeight, width, height }
}

function computeCanvasSize(boardWidth: number, boardHeight: number): CanvasLayout {
  const charWidth = characterImage.width * CHARACTER_SCALE
  const charHeight = characterImage.height * CHARACTER_SCALE

  const poleX = characterImage.width * CHARACTER_POLE_TOP.x * CHARACTER_SCALE
  const poleY = characterImage.height * CHARACTER_POLE_TOP.y * CHARACTER_SCALE

  const boardPivotX = poleX + BOARD_ANCHOR_OFFSET_X
  const boardPivotY = poleY + BOARD_ANCHOR_OFFSET_Y
  const boardX = boardPivotX - boardWidth / 2
  const boardY = boardPivotY - boardHeight

  const boardCorners = [
    { x: boardX, y: boardY },
    { x: boardX + boardWidth, y: boardY },
    { x: boardX + boardWidth, y: boardY + boardHeight },
    { x: boardX, y: boardY + boardHeight },
  ]

  const rotatedCorners = boardCorners.map((point) => {
    const dx = point.x - boardPivotX
    const dy = point.y - boardPivotY
    return {
      x: boardPivotX + dx * Math.cos(BOARD_ROTATION_RAD) - dy * Math.sin(BOARD_ROTATION_RAD),
      y: boardPivotY + dx * Math.sin(BOARD_ROTATION_RAD) + dy * Math.cos(BOARD_ROTATION_RAD),
    }
  })

  const boardMinX = Math.min(...rotatedCorners.map((point) => point.x))
  const boardMinY = Math.min(...rotatedCorners.map((point) => point.y))
  const boardMaxX = Math.max(...rotatedCorners.map((point) => point.x))
  const boardMaxY = Math.max(...rotatedCorners.map((point) => point.y))

  const minX = Math.min(0, boardMinX)
  const minY = Math.min(0, boardMinY)
  const maxX = Math.max(charWidth, boardMaxX)
  const maxY = Math.max(charHeight, boardMaxY)

  return {
    width: Math.ceil(maxX - minX + CANVAS_MARGIN * 2),
    height: Math.ceil(maxY - minY + CANVAS_MARGIN * 2),
    charX: Math.round(CANVAS_MARGIN - minX),
    charY: Math.round(CANVAS_MARGIN - minY),
    boardPivotX: Math.round(CANVAS_MARGIN - minX + boardPivotX),
    boardPivotY: Math.round(CANVAS_MARGIN - minY + boardPivotY),
  }
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  metrics: BoardMetrics,
): void {
  const x = pivotX - metrics.width / 2
  const y = pivotY - metrics.height

  ctx.save()
  ctx.translate(pivotX, pivotY)
  ctx.rotate(BOARD_ROTATION_RAD)
  ctx.translate(-pivotX, -pivotY)

  ctx.fillStyle = form.boardBgColor
  ctx.strokeStyle = BOARD_BORDER_COLOR
  ctx.lineWidth = BOARD_BORDER_WIDTH

  ctx.beginPath()
  ctx.rect(x, y, metrics.width, metrics.height)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = form.textColor
  ctx.font = resolvedFont.value
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const centerX = x + metrics.width / 2
  const textStartY = y + BOARD_PADDING_Y

  for (const [index, line] of metrics.lines.entries()) {
    ctx.fillText(line, centerX, textStartY + index * metrics.lineHeight)
  }

  ctx.restore()
}

function renderCanvas(): void {
  if (!imageReady.value || !canvasRef.value) {
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const boardMetrics = computeBoardMetrics(ctx)
  const layout = computeCanvasSize(boardMetrics.width, boardMetrics.height)

  canvas.width = layout.width
  canvas.height = layout.height

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawBoard(ctx, layout.boardPivotX, layout.boardPivotY, boardMetrics)
  ctx.drawImage(
    characterImage,
    layout.charX,
    layout.charY,
    characterImage.width * CHARACTER_SCALE,
    characterImage.height * CHARACTER_SCALE,
  )
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

onMounted(async () => {
  characterImage.src = CHARACTER_SRC
  characterImage.onload = async () => {
    imageReady.value = true
    await nextTick()
    renderCanvas()
  }
})

watch(
  () => [
    form.text,
    form.boardBgColor,
    form.textColor,
    form.fontSize,
    form.fontFamilyPreset,
    form.fontFamilyCustom,
  ],
  () => {
    renderCanvas()
  },
)
</script>

<template>
  <main class="app">
    <section class="controls">
      <h1>ikura-hamu アイコンジェネレーター</h1>

      <label class="field">
        <span>看板テキスト</span>
        <textarea v-model="form.text" rows="5" placeholder="好きな文字を入力（改行OK）" />
      </label>

      <div class="row">
        <label class="field">
          <span>背景色</span>
          <input v-model="form.boardBgColor" type="color" />
        </label>

        <label class="field">
          <span>文字色</span>
          <input v-model="form.textColor" type="color" />
        </label>
      </div>

      <label class="field">
        <span>フォントサイズ: {{ form.fontSize }}px</span>
        <input v-model.number="form.fontSize" type="range" min="16" max="140" step="1" />
      </label>

      <div class="row">
        <label class="field grow">
          <span>フォント（プリセット）</span>
          <select v-model="form.fontFamilyPreset">
            <option v-for="font in presetFonts" :key="font" :value="font">{{ font }}</option>
          </select>
        </label>

        <label class="field grow">
          <span>フォント（自由入力）</span>
          <input v-model="form.fontFamilyCustom" type="text" placeholder="例: M PLUS Rounded 1c" />
        </label>
      </div>

      <label class="field">
        <span>保存ファイル名</span>
        <input v-model="downloadName" type="text" placeholder="ikura-hamu-board.png" />
      </label>

      <button type="button" class="download" @click="downloadPng">PNGをダウンロード</button>
      <p class="note">看板の枠線は黒固定です。</p>
    </section>

    <section class="preview">
      <canvas ref="canvasRef" />
    </section>
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

.controls {
  padding: 20px;
  border: 1px solid #cccccc;
  border-radius: 14px;
  background-color: #ffffffdd;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

h1 {
  margin: 0;
  font-size: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.92rem;
}

.row {
  display: flex;
  gap: 12px;
}

.grow {
  flex: 1;
}

textarea,
input[type='text'],
select {
  width: 100%;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  padding: 9px 10px;
  font: inherit;
  background: #fff;
}

textarea {
  resize: vertical;
}

input[type='range'] {
  width: 100%;
}

input[type='color'] {
  width: 100%;
  height: 42px;
  padding: 2px;
  border: 1px solid #bcbcbc;
  border-radius: 8px;
  background: #fff;
}

.download {
  border: none;
  border-radius: 9px;
  padding: 12px 14px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  background: #1f3c88;
  cursor: pointer;
}

.note {
  margin: 0;
  font-size: 0.84rem;
  color: #4d4d4d;
}

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

@media (max-width: 780px) {
  .app {
    grid-template-columns: 1fr;
  }
}
</style>
