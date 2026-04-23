import {
  defaultFormState,
  fontSizeRange,
  linePaddingRange,
  type FormState,
} from './formState'

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeColor(value: string): string | null {
  if (!HEX_COLOR_PATTERN.test(value)) {
    return null
  }
  return value.toUpperCase()
}

function parseNumberParam(value: string | null, min: number, max: number): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }

  return clamp(Math.round(parsed), min, max)
}

function parseQueryToFormState(search: string, base: FormState): FormState {
  const params = new URLSearchParams(search)
  const next = { ...base }

  const text = params.get('text')
  if (text !== null) {
    next.text = text
  }

  const boardBgColor = normalizeColor(params.get('bg') ?? '')
  if (boardBgColor) {
    next.boardBgColor = boardBgColor
  }

  const textColor = normalizeColor(params.get('fg') ?? '')
  if (textColor) {
    next.textColor = textColor
  }

  const fontSize = parseNumberParam(params.get('size'), fontSizeRange.min, fontSizeRange.max)
  if (fontSize !== null) {
    next.fontSize = fontSize
  }

  const fontFamilyPreset = params.get('preset')
  if (fontFamilyPreset !== null) {
    next.fontFamilyPreset = fontFamilyPreset
  }

  const fontFamilyCustom = params.get('custom')
  if (fontFamilyCustom !== null) {
    next.fontFamilyCustom = fontFamilyCustom
  }

  const bold = params.get('bold')
  if (bold !== null) {
    next.bold = bold === '1' || bold.toLowerCase() === 'true'
  }

  const linePadding = parseNumberParam(params.get('pad'), linePaddingRange.min, linePaddingRange.max)
  if (linePadding !== null) {
    next.linePadding = linePadding
  }

  return next
}

function buildSearchParams(form: FormState, base: FormState): URLSearchParams {
  const params = new URLSearchParams()

  if (form.text !== base.text) {
    params.set('text', form.text)
  }

  const currentBoardBg = normalizeColor(form.boardBgColor)
  const baseBoardBg = normalizeColor(base.boardBgColor)
  if (currentBoardBg && currentBoardBg !== baseBoardBg) {
    params.set('bg', currentBoardBg)
  }

  const currentTextColor = normalizeColor(form.textColor)
  const baseTextColor = normalizeColor(base.textColor)
  if (currentTextColor && currentTextColor !== baseTextColor) {
    params.set('fg', currentTextColor)
  }

  if (form.fontSize !== base.fontSize) {
    params.set('size', String(clamp(form.fontSize, fontSizeRange.min, fontSizeRange.max)))
  }

  if (form.fontFamilyPreset !== base.fontFamilyPreset) {
    params.set('preset', form.fontFamilyPreset)
  }

  if (form.fontFamilyCustom !== base.fontFamilyCustom) {
    params.set('custom', form.fontFamilyCustom)
  }

  if (form.bold !== base.bold) {
    params.set('bold', form.bold ? '1' : '0')
  }

  if (form.linePadding !== base.linePadding) {
    params.set('pad', String(clamp(form.linePadding, linePaddingRange.min, linePaddingRange.max)))
  }

  return params
}

function replaceUrlQuery(params: URLSearchParams): void {
  const query = params.toString()
  const normalizedSearch = query.length > 0 ? `?${query}` : ''
  if (window.location.search === normalizedSearch) {
    return
  }

  const nextUrl = `${window.location.pathname}${normalizedSearch}${window.location.hash}`
  window.history.replaceState(window.history.state, '', nextUrl)
}

export function createInitialFormStateFromQuery(
  search: string,
  base: FormState = defaultFormState,
): FormState {
  return parseQueryToFormState(search, base)
}

export function syncFormStateToQuery(
  form: FormState,
  base: FormState = defaultFormState,
): void {
  replaceUrlQuery(buildSearchParams(form, base))
}
