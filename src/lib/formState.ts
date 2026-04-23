export type FormState = {
  text: string
  boardBgColor: string
  textColor: string
  fontSize: number
  fontFamilyPreset: string
  fontFamilyCustom: string
  bold: boolean
  linePadding: number
}

export const presetFonts = [
  'Noto Sans JP',
  'Hiragino Sans',
  'Yu Gothic',
  'Meiryo',
  'Arial',
  'sans-serif',
  'Zen Kurenaido',
]

export const defaultFormState: FormState = {
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
}

export const fontSizeRange = {
  min: 16,
  max: 140,
}

export const linePaddingRange = {
  min: 0,
  max: 20,
}
