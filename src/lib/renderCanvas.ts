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

function getLines(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n')
  return lines.length > 0 ? lines : ['']
}

function computeBoardMetrics(
  ctx: CanvasRenderingContext2D,
  params: { text: string; fontSize: number; resolvedFont: string; linePadding: number },
): BoardMetrics {
  ctx.font = params.resolvedFont

  const lines = getLines(params.text)
  const lineHeight = Math.max(16, params.fontSize) + params.linePadding

  let maxTextWidth = 0
  for (const line of lines) {
    const measured = line.length === 0 ? params.fontSize * 0.55 : ctx.measureText(line).width
    maxTextWidth = Math.max(maxTextWidth, measured)
  }

  const width = Math.max(Math.ceil(maxTextWidth + BOARD_PADDING_X * 2), BOARD_MIN_WIDTH)
  const height = Math.max(
    Math.ceil(lines.length * lineHeight + BOARD_PADDING_Y * 2),
    BOARD_MIN_HEIGHT,
  )

  return { lines, lineHeight, width, height }
}

function computeCanvasSize(
  characterImage: HTMLImageElement,
  boardWidth: number,
  boardHeight: number,
): CanvasLayout {
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
  params: { boardBgColor: string; textColor: string; resolvedFont: string; bold: boolean },
): void {
  const x = pivotX - metrics.width / 2
  const y = pivotY - metrics.height

  ctx.save()
  ctx.translate(pivotX, pivotY)
  ctx.rotate(BOARD_ROTATION_RAD)
  ctx.translate(-pivotX, -pivotY)

  ctx.fillStyle = params.boardBgColor
  ctx.strokeStyle = BOARD_BORDER_COLOR
  ctx.lineWidth = BOARD_BORDER_WIDTH

  ctx.beginPath()
  ctx.rect(x, y, metrics.width, metrics.height)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = params.textColor
  ctx.font = params.resolvedFont
  ctx.font = `${params.bold ? 'bold ' : ''}${ctx.font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const centerX = x + metrics.width / 2
  const textStartY = y + BOARD_PADDING_Y

  for (const [index, line] of metrics.lines.entries()) {
    ctx.fillText(line, centerX, textStartY + index * metrics.lineHeight)
  }

  ctx.restore()
}

export function renderCanvas(params: {
  imageReady: boolean
  canvas: HTMLCanvasElement | null
  characterImage: HTMLImageElement
  text: string
  boardBgColor: string
  textColor: string
  fontSize: number
  resolvedFont: string
  bold: boolean
  linePadding: number
}): void {
  if (!params.imageReady || !params.canvas) {
    return
  }

  const ctx = params.canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const boardMetrics = computeBoardMetrics(ctx, {
    text: params.text,
    fontSize: params.fontSize,
    resolvedFont: params.resolvedFont,
    linePadding: params.linePadding,
  })
  const layout = computeCanvasSize(params.characterImage, boardMetrics.width, boardMetrics.height)

  params.canvas.width = layout.width
  params.canvas.height = layout.height

  ctx.clearRect(0, 0, params.canvas.width, params.canvas.height)

  drawBoard(ctx, layout.boardPivotX, layout.boardPivotY, boardMetrics, {
    boardBgColor: params.boardBgColor,
    textColor: params.textColor,
    resolvedFont: params.resolvedFont,
    bold: params.bold,
  })
  ctx.drawImage(
    params.characterImage,
    layout.charX,
    layout.charY,
    params.characterImage.width * CHARACTER_SCALE,
    params.characterImage.height * CHARACTER_SCALE,
  )
}
