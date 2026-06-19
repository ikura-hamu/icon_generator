# @ikura-hamu/icon-generator

Canvas renderer for generating ikura-hamu icon images with the default character image.

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
  fontName: '20px sans-serif',
  bold: false,
  linePadding: 4,
})
```

`renderIconCanvas` loads and caches the default character image from `https://icons.ikura-hamu.work/character.png`, then draws the board and character onto the provided `HTMLCanvasElement`.

## License

The renderer code in this package is licensed under the MIT License.

The default character image loaded from `https://icons.ikura-hamu.work/character.png` is not included in this package and is not licensed under the MIT License. Use of the default character image and images generated with it is subject to the usage restrictions of the ikura-hamu icon generator application.
