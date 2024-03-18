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
      @drop="handleFileDrop"
      @paste="handleFilePaste"
      @input="handleH5Input"
      @blur="handleH5Blur"
      @focus="handleH5Focus"
    />
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, onMounted, watch, onUnmounted } from '../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  StoreName,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { Editor, type JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Mention from '@tiptap/extension-mention';
import CustomImage from './message-input-file';
import type { ITipTapEditorContent } from '../../../interface';
import MessageInputAtSuggestion from './message-input-at/index';
import { isH5, isPC } from '../../../utils/env';

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
const inputContentEmpty = ref(true);
const inputBlur = ref(true);
const isC2C = ref(false);
const allInsertedAtInfo = new Map<string, string>();
const editorDom = ref();
let editor: Editor | null = null;

function onCurrentConversationUpdated(conversation: IConversationModel) {
  isC2C.value = conversation?.type === TUIChatEngine.TYPES.CONV_C2C;
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
          HTMLAttributes: {
            class: 'custom-image',
          },
        }),
      ],
      autofocus: !isH5,
      editable: true,
      injectCSS: false,

      // handle input edtor typing (only in C2C and enable typing)
      onUpdate({ editor, transaction }) {
        if (!enableTyping.value || !isC2C.value) return;
        inputBlur.value = !editor.isFocused;
        if (transaction?.doc?.content?.size > 2) {
          inputContentEmpty.value = false;
        } else {
          inputContentEmpty.value = true;
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
        inputBlur.value = true;
      },
      onBlur() {
        if (isH5 && document?.getElementById('app')?.style) {
          // reset app height to normal
          (document.getElementById('app') as any).style.marginBottom = ``;
          (document.getElementById('app') as any).style.height = `100%`;
        }
        if (!enableTyping.value || !isC2C.value) return;
        inputBlur.value = true;
      },
    })
    : null;

  TUIStore.watch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversation: onCurrentConversationUpdated,
  });
});

const handleEnter = (e: any) => {
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
};

const handleH5Input = (e: any) => {
  if (isH5) {
    e.data === '@' && emits('onAt', true);
    inputContentEmpty.value = editorDom.value?.childNodes ? false : true;
  }
};

const handleH5Blur = () => {
  isH5 && (inputBlur.value = true);
};

const handleH5Focus = () => {
  isH5 && (inputBlur.value = false);
};

const insertAt = (atInfo: { id: string; label: string }) => {
  if (!allInsertedAtInfo.has(atInfo.id)) {
    allInsertedAtInfo.set(atInfo.id, atInfo.label);
  }
  const mentionText = document.createElement('span');
  mentionText.innerHTML = atInfo.label;
  mentionText.className = 'mention';
  editorDom.value?.appendChild(mentionText);
};

// fileMap 存储 fileURL 与 fileObject 的映射
const fileMap = new Map<string, any>();
const handleFileDrop = (e: any) => {
  // pc 端 支持富文本拖拽上传
  // 移动端 不支持
  e.preventDefault();
  e.stopPropagation();
  if (isPC) {
    handleFileDropOrPaste(e, 'drop');
  }
};
const handleFilePaste = (e: any) => {
  // pc 端 屏蔽原生复制，支持富文本复制，走富文本复制上传解析
  // 移动端，仅支持文本复制，走默认复制解析
  if (isPC) {
    // pc 端 支持富文本复制，走富文本复制上传解析
    e.preventDefault();
    e.stopPropagation();
    handleFileDropOrPaste(e, 'paste');
  }
};

const handleFileDropOrPaste = async (e: any, type: string) => {
  if (!enableDragUpload?.value && type === 'drop') {
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
          title: file?.name,
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
};

// create file icon image
// 为了避免重复创建拥有相同icon图标的img dom，将之前已有类型进行记录
// 记录格式为 map<icon type，img dom>
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
  // 设置内存中的实际大小（缩放以考虑额外的像素密度）
  const scale = window.devicePixelRatio; // 在视网膜屏幕上更改为 1 以查看模糊
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }
  // 标准化坐标系以使用 css 像素
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

// 获取字符串的实际占位长度（字母or符号:1，其他（主要是中文):）
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

const getEditorContent = () => {
  return isPC ? parsePCEditorContent() : parseH5EditorContent();
};

function parsePCEditorContent(): Array<ITipTapEditorContent> {
  const editorJSON = editor?.getJSON();
  const content: Array<ITipTapEditorContent> = [];
  handleEditorContent(editorJSON, content);
  if (
    content.length > 0
    && content[content.length - 1]
    && content[content.length - 1]?.type === 'text'
    && content[content.length - 1]?.payload?.text?.endsWith('\n')
  ) {
    const text = content[content.length - 1].payload.text;
    content[content.length - 1].payload.text = text?.substring(
      0,
      text.lastIndexOf('\n'),
    );
  }
  return content;
}

function handleEditorContent(root: JSONContent, content: Array<ITipTapEditorContent>) {
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

function handleEditorNode(node: JSONContent, content: Array<ITipTapEditorContent>) {
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
    || (node.type === 'custom-image' && node?.attrs?.class === 'emoji')
  ) {
    // 处理 text 和 emoji
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
    node.type === 'custom-image'
    && node?.attrs?.class === 'normal'
  ) {
    // 处理富文本图像
    content.push({
      type: 'image',
      payload: { file: fileMap?.get(node?.attrs?.src) },
    });
  } else if (node.type === 'custom-image' && node?.attrs?.class === 'file') {
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
  const atUserList: Array<string> = [];
  try {
    for (const child of root.childNodes) {
      if (
        child.nodeName === '#text'
        || child.nodeName === 'SPAN'
        || (child as HTMLElement).classList?.contains('custom-image-emoji')
        || (child as HTMLElement).classList?.contains('mention')
      ) {
        text += child.nodeValue || (child as any).alt || child.innerHTML;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }

  allInsertedAtInfo?.forEach((value: string, key: string) => {
    if (text.includes('@' + value)) {
      atUserList.push(key);
    }
  });
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

const addEmoji = (emojiData: any) => {
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
  }
  if (!isH5) {
    editor?.commands?.focus();
    editor?.commands?.scrollIntoView();
  } else {
    editorDom.value?.focus();
    placeCaretAtEnd(editorDom.value);
  }
};

function placeCaretAtEnd(el: HTMLElement) {
  el.focus();
  if (typeof window.getSelection !== 'undefined'
    && typeof document.createRange !== 'undefined') {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  } else if (typeof document.body?.createTextRange !== 'undefined') {
    const textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

const blur = () => {
  isPC ? editor?.commands?.blur() : editorDom.value?.blur();
};

const resetEditor = () => {
  editor?.commands?.clearContent(true);
  fileMap?.clear();
  inputBlur.value = true;
  inputContentEmpty.value = true;
  if (!isH5) {
    editor?.commands?.focus();
  } else {
    allInsertedAtInfo?.clear();
    editorDom.value.innerHTML = '';
  }
};

const setEditorContent = (content: any) => {
  editor?.commands?.insertContent(content);
};

watch(
  () => [inputContentEmpty.value, inputBlur.value],
  (newVal: any, oldVal: any) => {
    if (newVal !== oldVal) {
      emits('onTyping', inputContentEmpty.value, inputBlur.value);
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
    line-height: 20px;
    overflow: hidden;
    user-select: text;
    hyphens: auto;
    word-wrap: break-word;
    word-break: break-word;
    flex-wrap: wrap;
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
