<script setup lang="ts">
import { watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import type { UploadedImage } from '@/api/uploads'
import ImageUploader from './ImageUploader.vue'

// ใช้กับ v-model ได้: รับค่า modelValue (HTML) และส่ง update:modelValue เมื่อพิมพ์
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [html: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  // StarterKit มีย่อหน้า หัวข้อ ตัวหนา ตัวเอียง รายการ ฯลฯ ส่วน Image เพิ่มการแสดงรูป
  extensions: [StarterKit, Image],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

// ถ้าค่าจากภายนอกเปลี่ยน (เช่น โหลดบทความเสร็จหลังเปิดหน้า) ให้แสดงค่าใหม่ใน editor
watch(
  () => props.modelValue,
  (html) => {
    if (editor.value && html !== editor.value.getHTML()) {
      editor.value.commands.setContent(html, { emitUpdate: false })
    }
  },
)

function insertImage(image: UploadedImage) {
  editor.value?.chain().focus().setImage({ src: image.url }).run()
}
</script>

<template>
  <div v-if="editor" class="editor">
    <div class="toolbar">
      <!-- แต่ละปุ่มสั่งงาน editor ผ่าน chain() และแสดงสถานะว่ากำลังเปิดใช้อยู่หรือไม่ -->
      <button
        type="button"
        :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        • รายการ
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        1. รายการ
      </button>
      <button
        type="button"
        :class="{ active: editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        อ้างอิง
      </button>
      <button type="button" @click="editor.chain().focus().undo().run()">เลิกทำ</button>
      <button type="button" @click="editor.chain().focus().redo().run()">ทำซ้ำ</button>
      <ImageUploader label="แทรกรูป" @uploaded="insertImage" />
    </div>
    <EditorContent :editor="editor" class="content" />
  </div>
</template>

<style scoped>
.editor {
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-soft);
}

.toolbar button.active {
  background: var(--color-primary);
  color: white;
}

.content {
  padding: 0 1rem;
  min-height: 240px;
}

/* :deep() ให้ style มีผลกับ HTML ที่ TipTap สร้างข้างใน */
.content :deep(.ProseMirror) {
  min-height: 240px;
  outline: none;
}

.content :deep(img) {
  max-width: 100%;
}
</style>
