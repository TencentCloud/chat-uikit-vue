<template>
  <div
    :class="['message-input-editor-container', isH5 && 'message-input-editor-container-h5']"
  >
    <div
      v-if="isMuted"
      class="message-input-mute"
    >
      {{ muteText }}
    </div>
    <div
      v-if="!isMuted && enableInput"
      ref="editorDom"
      class="message-input-editor-area"
      :contenteditable="isH5"
      @keydown.enter="handleEnter"
      @drop="handlePCFileDrop"
      @paste="handlePaste"
      @input="handleH5Input"
      @blur="handleH5Blur"
      @focus="handleH5Focus"
    />
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, onMounted, watch, onUnmounted } from '../../../adapter-vue';
import {
  TUIStore,
  StoreName,
  IMessageModel,
} from '@tencentcloud/chat-uikit-engine';
import { Editor, JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Mention from '@tiptap/extension-mention';
import CustomImage from './message-input-file';
import { ITipTapEditorContent } from '../../../interface';
import MessageInputAtSuggestion from './message-input-at/index';
import { parseTextToRenderArray } from '../emoji-config';
import { isH5, isPC } from '../../../utils/env';
import DraftManager from '../utils/conversationDraft';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'this is placeholder',
  },
  replayOrReferenceMessage: {
    type: Object,
    default: () => ({}),
  },
  isMuted: {
    type: Boolean,
    default: true,
  },
  muteText: {
    type: String,
    default: '',
  },
  enableInput: {
    type: Boolean,
    default: true,
  },
  enableAt: {
    type: Boolean,
    default: true,
  },
  enableDragUpload: {
    type: Boolean,
    default: true,
  },
  enableTyping: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['sendMessage', 'onTyping', 'onAt']);
const { placeholder, enableAt, enableDragUpload, enableTyping } = toRefs(props);
const isEditorEmpty = ref<boolean>(true);
const isEditorBlur = ref<boolean>(true);
const isC2C = ref<boolean>(false);
const currentConversationID = ref<string>('');
const currentQuoteMessage = ref<{ message: IMessageModel; type: string }>();
const editorDom = ref();
let editor: Editor | null = null;
const fileMap = new Map<string, any>();

function onCurrentConversationIDUpdated(conversationID: string) {
  if (currentConversationID.value !== conversationID) {
    if (currentConversationID.value) {
      DraftManager.setStore(
        currentConversationID.value,
        getEditorHTML(),
        DraftManager.generateAbstract(getEditorContent()),
        currentQuoteMessage.value,
      );
    }
    resetEditor();
    if (conversationID) {
      DraftManager.getStore(conversationID, setEditorContent);
    }
  }
  currentConversationID.value = conversationID;
}

function onQuoteMessageUpdated(options?: { message: IMessageModel; type: string }) {
  currentQuoteMessage.value = options;
}

onMounted(() => {
  editor = isPC
    ? new Editor({
      element: editorDom.value,
      extensions: [
        Document,
        Paragraph,
        Text,
        Placeholder.configure({
          emptyEditorClass: 'is-editor-empty',
          placeholder: placeholder.value,
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          suggestion: enableAt.value && (MessageInputAtSuggestion() as any),
        }),
        CustomImage.configure({
          inline: true,
          allowBase64: true,
        }),
      ],
      autofocus: !isH5,
      editable: true,
      injectCSS: false,
      editorProps: {
        transformPastedText() {
          // prevent editor's default paste for resolve emoji
          return '';
        },
      },
      // handle input editor typing (only in C2C and enable typing)
      onUpdate({ editor, transaction }) {
        if (!enableTyping.value || !isC2C.value) return;
        isEditorBlur.value = !editor.isFocused;
        if (transaction?.doc?.content?.size > 2) {
          isEditorEmpty.value = false;
        } else {
          isEditorEmpty.value = true;
        }
      },
      onFocus() {
        if (isH5 && document?.getElementById('app')?.style) {
          // set app height when keyboard popup
          const keyboardHeight = document.body.scrollHeight - window.innerHeight;
          (
            document.getElementById('app') as any
          ).style.marginBottom = `${keyboardHeight}px`;
          (
            document.getElementById('app') as any
          ).style.height = `calc(100% - ${keyboardHeight}px)`;
        }
        if (!enableTyping.value || !isC2C.value) return;
        isEditorBlur.value = true;
      },
      onBlur() {
        if (isH5 && document?.getElementById('app')?.style) {
          // reset app height to normal
          (document.getElementById('app') as any).style.marginBottom = ``;
          (document.getElementById('app') as any).style.height = `100%`;
        }
        if (!enableTyping.value || !isC2C.value) return;
        isEditorBlur.value = true;
      },
    })
    : null;

  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  TUIStore.watch(StoreName.CHAT, {
    quoteMessage: onQuoteMessageUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
  });

  TUIStore.unwatch(StoreName.CHAT, {
    quoteMessage: onQuoteMessageUpdated,
  });

  // clear map store
  fileMap.clear();
});

function handleEnter(e: any) {
  if (isH5) {
    return;
  }
  e?.preventDefault();
  e?.stopPropagation();
  if (e.keyCode === 13 && e.ctrlKey) {
    // ctrl + enter: warp
    editor?.commands?.insertContent('<p></p>');
  } else if (e.keyCode === 13) {
    // enter only: send message
    emits('sendMessage');
  }
}

function handleH5Input(e: any) {
  if (isH5) {
    e.data === '@' && emits('onAt', true);
    isEditorEmpty.value = editorDom.value?.childNodes ? false : true;
  }
}

function handleH5Blur() {
  isH5 && (isEditorBlur.value = true);
}

function handleH5Focus() {
  isH5 && (isEditorBlur.value = false);
}

function insertAt(atInfo: { id: string; label: string }) {
  const mentionText = document.createElement('span');
  mentionText.innerHTML = atInfo.label;
  mentionText.className = 'mention';
  mentionText.id = atInfo.id;
  editorDom.value?.appendChild(mentionText);
}

function handlePCFileDrop(e: any) {
  // Only the PC version supports drag and drop upload of rich text
  isPC && handleFileDropOrPaste(e, 'drop');
}

function handlePaste(e: ClipboardEvent) {
  // In the PC version, disable native copy and support rich text copy, and go through rich text copy upload parsing
  // In the mobile version, only text copy is supported, and default copy parsing is used
  if (!e.clipboardData) {
    return;
  }
  if (isPC && e.clipboardData.files.length) {
    handleFileDropOrPaste(e, 'paste');
  } else {
    handlePasteText(e);
    // Caret: https://developer.mozilla.org/en-US/docs/Web/API/CaretPosition
    scrollToCaret(editorDom.value);
  }
}

function handlePasteText(e: ClipboardEvent) {
  e.preventDefault();
  const html = e.clipboardData?.getData('text/html');
  const text = e.clipboardData?.getData('text/plain') || '';
  // if paste html in pc, paste by tiptap editor default
  // if paste text in pc or mobile, parse text to html to render emoji
  if (!html) {
    const renderArray = parseTextToRenderArray(text);
    insertEditorContent(renderArray);
  }
}

async function handleFileDropOrPaste(e: any, type: string) {
  e.preventDefault();
  e.stopPropagation();
  if (!enableDragUpload.value && type === 'drop') {
    return;
  }
  if (
    (type === 'drop' && e.dataTransfer)
    || (type === 'paste' && e.clipboardData)
  ) {
    const files
      = type === 'drop' ? e?.dataTransfer?.files : e?.clipboardData?.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const fileSrc = isImage
        ? URL.createObjectURL(file)
        : await drawFileCanvasToImageUrl(file);
      editor?.commands?.insertContent({
        type: 'custom-image',
        attrs: {
          src: fileSrc,
          alt: file?.name,
          class: isImage ? 'normal' : 'file',
        },
      });
      fileMap.set(fileSrc, file);
      if (i === files.length - 1) {
        setTimeout(() => {
          editor?.commands?.focus('end');
          editor?.commands?.scrollIntoView();
        }, 10);
      }
    }
  }
}

/**
 * create file icon image
 * To avoid creating img dom with the same icon repeatedly, record the previous type of icon that has been created.
 * The format of the record is map<icon type, img dom>.
*/
const fileIconDomMap = new Map<string, HTMLImageElement>();
const addImageProcess = (src: string, type: string) => {
  return new Promise((resolve, reject) => {
    if (fileIconDomMap.has(type)) {
      resolve(fileIconDomMap.get(type));
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        fileIconDomMap.set(type, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    }
  });
};

// draw file tag canvas
const drawFileCanvasToImageUrl = async (file: any) => {
  const { name, type } = file;
  const canvas = document.createElement('canvas');
  const width = 160;
  const height = 50;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  // Set the actual size in memory (scaled to account for additional pixel density)
  const scale = window.devicePixelRatio; // Change to 1 to view blurry on a retina screen
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  // To use CSS pixels, normalize the coordinate system
  ctx.scale(scale, scale);
  // draw icon
  const { iconSrc, iconType } = handleFileIconForShow(type);
  const img = await addImageProcess(iconSrc, iconType);
  ctx?.drawImage(img as any, 10, 10, 30, 30);
  // draw font
  const nameForShow = handleNameForShow(name);
  ctx.fillText(nameForShow, 45, 22);
  // canvas to url
  const dataURL = canvas.toDataURL();
  return dataURL;
};

const handleFileIconForShow = (type: string) => {
  const urlBase = 'https://web.sdk.qcloud.com/component/TUIKit/assets/file-';
  const fileTypes = [
    'image',
    'pdf',
    'text',
    'ppt',
    'presentation',
    'sheet',
    'zip',
    'word',
    'video',
    'unknown',
  ];
  let url = '';
  let iconType = '';
  fileTypes.forEach((typeName: string) => {
    if (type.includes(typeName)) {
      url = urlBase + typeName + '.svg';
      iconType = typeName;
    }
  });
  return {
    iconSrc: url ? url : urlBase + 'unknown.svg',
    iconType: iconType ? iconType : 'unknown',
  };
};

const handleNameForShow = (value: string): string => {
  if (!value) {
    return value;
  }
  let res = '';
  let length = 0;
  for (let i = 0; i < value?.length; i++) {
    if (length > 16) {
      res += '...';
      break;
    }
    res += value[i];
    if (/[a-z]|[0-9]|[,;.!@#-+/\\$%^*()<>?:"'{}~]/i.test(value[i])) {
      length += 1;
    } else {
      length += 2;
    }
  }
  return res;
};

function getEditorContent() {
  return isPC ? parsePCEditorContent() : parseH5EditorContent();
}

function parsePCEditorContent(): ITipTapEditorContent[] {
  const editorJSON = editor?.getJSON();
  const content: ITipTapEditorContent[] = [];
  handleEditorContent(editorJSON, content);
  if (
    content.length > 0
    && content[content.length - 1]
    && content[content.length - 1].type === 'text'
    && content[content.length - 1].payload?.text?.endsWith('\n')
  ) {
    const text = content[content.length - 1].payload.text || '';
    content[content.length - 1].payload.text = text?.substring(
      0,
      text.lastIndexOf('\n'),
    );
  }
  return content;
}

function handleEditorContent(root: JSONContent, content: ITipTapEditorContent[]) {
  if (!root || !root.type) {
    return;
  }
  if (
    root.type !== 'text'
    && root.type !== 'custom-image'
    && root.type !== 'mention'
  ) {
    if (root.type === 'paragraph') {
      handleEditorNode(root, content);
    }
    if (root.content?.length) {
      root.content.forEach((item: JSONContent) => {
        handleEditorContent(item, content);
      });
    }
    return;
  } else {
    handleEditorNode(root, content);
  }
}

function handleEditorNode(node: JSONContent, content: ITipTapEditorContent[]) {
  // handle enter
  if (node.type === 'paragraph') {
    if (
      content.length > 0
      && content[content.length - 1]
      && content[content.length - 1]?.type === 'text'
    ) {
      content[content.length - 1].payload.text += '\n';
    }
  } else if (
    node.type === 'text'
    || (node.type === 'custom-image' && node?.attrs?.class?.includes('emoji'))
  ) {
    // Process text and emojis
    const text = node.type === 'text' ? node?.text : node?.attrs?.alt;
    if (
      content.length > 0
      && content[content.length - 1]
      && content[content.length - 1]?.type === 'text'
    ) {
      content[content.length - 1].payload.text += text;
    } else {
      content.push({
        type: 'text',
        payload: { text: text },
      });
    }
  } else if (
    node.type === 'custom-image' && node?.attrs?.class?.includes('normal')
  ) {
    // Process rich text images
    content.push({
      type: 'image',
      payload: { file: fileMap?.get(node?.attrs?.src) },
    });
  } else if (node.type === 'custom-image' && node?.attrs?.class?.includes('file')) {
    const file = fileMap?.get(node?.attrs?.src);
    content.push({
      type: file?.type?.includes('video') ? 'video' : 'file',
      payload: { file },
    });
  } else if (node.type === 'mention') {
    const text = '@' + node?.attrs?.label + ' ';
    if (
      content.length > 0
      && content[content.length - 1]
      && content[content.length - 1]?.type === 'text'
    ) {
      content[content.length - 1].payload.text += text;
    } else {
      content.push({
        type: 'text',
        payload: { text: text },
      });
    }
    if (content[content.length - 1]?.payload?.atUserList) {
      content[content.length - 1]?.payload?.atUserList?.push(node?.attrs?.id);
    } else {
      content[content.length - 1].payload.atUserList = [node?.attrs?.id];
    }
  }
}

function parseH5EditorContent() {
  const root = editorDom.value;
  let text: string = '';
  const atUserList: string[] = [];
  try {
    for (const child of root.childNodes) {
      if (
        child.nodeName === '#text'
        || child.nodeName === 'SPAN'
        || (child as HTMLElement).classList?.contains('custom-image-emoji')
        || (child as HTMLElement).classList?.contains('mention')
      ) {
        text += child.nodeValue || (child as any).alt || child.innerHTML || '';
        if (child.classList?.contains('mention') && child.id && !atUserList?.includes(child.id)) {
          atUserList.push(child.id);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
  return [
    {
      type: 'text',
      payload: {
        text,
        atUserList,
      },
    },
  ];
}

function addEmoji(emojiData: any) {
  if (isPC) {
    editor?.commands?.insertContent({
      type: 'custom-image',
      attrs: {
        src: emojiData?.url,
        alt: emojiData?.emoji.key,
        title: emojiData?.emoji.key,
        class: 'emoji',
      },
    });
  } else {
    const emojiImgNode = document.createElement('img');
    emojiImgNode?.setAttribute('src', emojiData?.url);
    emojiImgNode?.setAttribute('class', 'custom-image custom-image-emoji');
    emojiImgNode?.setAttribute('alt', emojiData?.emoji.key);
    emojiImgNode?.setAttribute('title', emojiData?.emoji.key);
    emojiImgNode?.setAttribute('width', '20px');
    emojiImgNode?.setAttribute('height', '20px');
    editorDom.value?.appendChild(emojiImgNode);
    const spanNode = document.createElement('span');
    spanNode.contentEditable = 'true';
    editorDom.value?.appendChild(spanNode);
  }
  if (!isH5) {
    editor?.commands?.focus();
    editor?.commands?.scrollIntoView();
  }
}

function blur() {
  isPC ? editor?.commands?.blur() : editorDom.value?.blur();
}

function resetEditor() {
  editor?.commands?.clearContent(true);
  isEditorBlur.value = true;
  isEditorEmpty.value = true;
  isH5 && (editorDom.value.innerHTML = '');
}

function getEditorHTML(): string {
  if (isPC) {
    return editor?.getHTML();
  }
  return editorDom.value.innerHTML;
}

function setEditorContent(content: any) {
  if (isPC) {
    editor?.commands?.setContent(content);
  } else {
    editorDom.value!.innerHTML = content;
  }
}

function insertEditorContent(content: Array<{ type: 'text' | 'image'; content: string; emojiKey?: string }>) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount) {
    const currentRange = selection.getRangeAt(0);
    content.forEach((item) => {
      const newNode = item.type === 'image' ? createEmojiNode(item.emojiKey || '', item.content) : createTextNode(item.content);
      currentRange.insertNode(newNode);
      currentRange.setStartAfter(newNode);
      if (item.type === 'image' && isH5) {
        // insert empty span instead of caret after emoji
        const textNode = document.createElement('span');
        textNode.contentEditable = 'true';
        currentRange.insertNode(textNode);
        currentRange.setStartAfter(textNode);
      }
    });
    // update caret to current range and scroll to caret
    currentRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(currentRange);
  }
}

function createTextNode(text: string) {
  return document.createTextNode(text);
}

function createEmojiNode(key: string, url: string) {
  const imgNode = document.createElement('img');
  imgNode.src = url;
  imgNode.alt = key || '';
  imgNode.classList.add('custom-image', 'custom-image-emoji');
  imgNode.width = 20;
  imgNode.height = 20;
  return imgNode;
}

function scrollToCaret(el: HTMLElement) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    // create a new range with zero width space text node in current caret
    const newRange = document.createRange();
    const emptyPlaceholder = '\u200B';
    const textNode = document.createTextNode(emptyPlaceholder);
    newRange.setStart(range.startContainer, range.startOffset);
    newRange.insertNode(textNode);
    // get new range bounding rect for caret position information
    const rect = newRange.getBoundingClientRect();
    // remove text node
    if (textNode.parentNode) {
      textNode.parentNode.removeChild(textNode);
    }
    // scroll to caret
    el.scrollTop = rect.top - el.getBoundingClientRect().top;
  }
}

watch(
  () => [isEditorEmpty.value, isEditorBlur.value],
  (newVal: boolean[], oldVal: boolean[]) => {
    if (newVal !== oldVal) {
      emits('onTyping', isEditorEmpty.value, isEditorBlur.value);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

defineExpose({
  getEditorContent,
  addEmoji,
  resetEditor,
  insertAt,
  setEditorContent,
  getEditorHTML,
  insertEditorContent,
  blur,
});
</script>

<style scoped lang="scss">
@import "../../../assets/styles/common";

.message-input-editor {
  &-container {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 3px 10px 10px;
  }

  &-area {
    box-sizing: border-box;
    height: 100%;
    flex: 1;
    display: flex;
    overflow-y: auto;
    border: none;
    outline: none;
  }

  &-mute {
    box-sizing: border-box;
    flex: 1;
    display: flex;
    color: #999;
    font-size: 14px;
    justify-content: center;
    align-items: center;
  }
}

.message-input-editor-container-h5 {
  box-sizing: border-box;
  flex: 1;
  height: auto;
  background: #f4f5f9;
  border-radius: 9.4px;
  padding: 8px 0 8px 10px;
  font-size: 16px !important;
  max-height: 86px;
  margin-right: 7px;
  overflow: hidden;

  .message-input-editor-area {
    overflow: auto;
    user-select: text;
    hyphens: auto;
    word-wrap: break-word;
    word-break: break-word;
    flex-wrap: wrap;

    .custom-image,
    .custom-image-emoji {
      display: inline;
    }
  }
}
</style>
<style lang="scss">
/* stylelint-disable-next-line selector-class-pattern */
.ProseMirror {
  min-height: 100%;
  height: fit-content;
  flex: 1;
  font-size: 14px;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;

  div,
  ul,
  ol,
  dt,
  dd,
  li,
  dl,
  h1,
  h2,
  h3,
  h4,
  p {
    margin: 0;
    padding: 0;
    font-style: normal;
  }

  p {
    * {
      vertical-align: bottom;
    }
  }

  user-select: text;

  &-focused {
    border: none;
    outline: none;
  }

  img {

    /* stylelint-disable-next-line selector-class-pattern */
    &.ProseMirror-selectednode {
      outline: 2px solid #68cef8;
    }
  }

  .custom-image {
    &-normal {
      max-height: 120px;
      max-width: 200px;
    }

    &-file {
      height: 50px;
      width: 160px;
      border: 1px solid #e8e8e9;
      border-radius: 5px;
    }

    &-emoji {
      height: 20px;
      width: 20px;
    }

    &-image {
      display: none;
    }
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .ProseMirror-selectednode {
    outline: 2px solid #68cef8;
    cursor: none;
  }

  p,
  [contenteditable] {
    user-select: text;
  }

  // placeholder style
  p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
}
</style>
