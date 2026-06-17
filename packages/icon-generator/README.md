# @ikura-hamu/icon-generator

Canvas renderer for generating ikura-hamu icon images with the bundled character image.

## Install

```sh
npm install @ikura-hamu/icon-generator
```

## Usage

```ts
import { renderIconCanvas } from '@ikura-hamu/icon-generator'

await renderIconCanvas({
  canvas,
  text: 'ikura-hamu',
  boardBgColor: '#007AFF',
  textColor: '#FFFFFF',
  fontSize: 20,
  resolvedFont: '20px sans-serif',
  bold: false,
  linePadding: 4,
})
```

`renderIconCanvas` loads and caches the bundled `character.png` image, then draws the board and character onto the provided `HTMLCanvasElement`.

This package is published as `UNLICENSED`. The generated image and bundled character asset are subject to the usage restrictions of the ikura-hamu icon generator application.
