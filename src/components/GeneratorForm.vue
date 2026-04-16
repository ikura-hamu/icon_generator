<script setup lang="ts">
defineProps<{
  text: string
  boardBgColor: string
  textColor: string
  fontSize: number
  fontFamilyPreset: string
  fontFamilyCustom: string
  presetFonts: string[]
  bold: boolean
}>()

const emit = defineEmits<{
  (e: 'update:text', value: string): void
  (e: 'update:boardBgColor', value: string): void
  (e: 'update:textColor', value: string): void
  (e: 'update:fontSize', value: number): void
  (e: 'update:fontFamilyPreset', value: string): void
  (e: 'update:fontFamilyCustom', value: string): void
  (e: 'update:bold', value: boolean): void
  (e: 'download'): void
}>()
</script>

<template>
  <section class="controls">
    <h1>ikura-hamu アイコンジェネレーター</h1>

    <label class="field">
      <span>看板テキスト</span>
      <textarea
        :value="text"
        rows="5"
        placeholder="好きな文字を入力（改行OK）"
        @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>

    <div class="row">
      <label class="field">
        <span>背景色</span>
        <input
          :value="boardBgColor"
          type="color"
          @input="emit('update:boardBgColor', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="field">
        <span>文字色</span>
        <input
          :value="textColor"
          type="color"
          @input="emit('update:textColor', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <label class="field">
      <span>フォントサイズ: {{ fontSize }}px</span>
      <input
        :value="fontSize"
        type="range"
        min="16"
        max="140"
        step="1"
        @input="emit('update:fontSize', Number(($event.target as HTMLInputElement).value))"
      />
    </label>

    <label class="row">
      <span>太字</span>
      <input
        :checked="bold"
        type="checkbox"
        @input="emit('update:bold', ($event.target as HTMLInputElement).checked)"
      />
    </label>

    <div class="row">
      <label class="field grow">
        <span>フォント（プリセット）</span>
        <select
          :value="fontFamilyPreset"
          @change="emit('update:fontFamilyPreset', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="font in presetFonts" :key="font" :value="font">{{ font }}</option>
        </select>
      </label>

      <label class="field grow">
        <span>フォント（自由入力）</span>
        <input
          :value="fontFamilyCustom"
          type="text"
          placeholder="例: M PLUS Rounded 1c"
          @input="emit('update:fontFamilyCustom', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>

    <button type="button" class="download" @click="emit('download')">PNGをダウンロード</button>
    <p class="note">看板の枠線は黒固定です。</p>
  </section>
</template>

<style scoped>
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
</style>
