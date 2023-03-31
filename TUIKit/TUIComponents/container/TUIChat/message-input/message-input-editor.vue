<template>
  <div :class="['message-input-container', isH5 && 'message-input-container-h5']">
    <div class="message-input-mute" v-show="isMute">
      {{ $t(`TUIChat.${muteText}`) }}
    </div>
    <editor-content
      v-show="!isMute && enableInput"
      :editor="editor"
      class="message-input-area"
      ref="editorContainer"
      @drop="(e:any) => handleFileDropOrPaste(e, 'drop')"
      @paste="(e:any) => handleFileDropOrPaste(e, 'paste')"
      @keydown.enter="handleEnter"
    />
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, toRefs, ref, defineExpose } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Mention from '@tiptap/extension-mention';
import CustomImage from './message-input-file';
import { MessageInputAtSuggestion } from './message-input-at.vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'this is placeholder',
  },
  replayOrReferenceMessage: {
    type: Object,
    default: () => ({}),
  },
  isMute: {
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
  isH5: {
    type: Boolean,
    default: true,
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['sendMessage', 'onTyping']);
const { placeholder, isH5, enableAt, enableDragUpload, isGroup, enableTyping } = toRefs(props);
const inputContentEmpty = ref(true);
const inputBlur = ref(true);

const editor = useEditor({
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
  autofocus: true,
  editable: true,
  injectCSS: false,

  // handle input edtor typing (only in C2C and enable typing)
  onUpdate({ editor, transaction }) {
    if (!enableTyping.value || isGroup.value) return;
    inputBlur.value = !editor.isFocused;
    if (transaction?.doc?.content?.size > 2) {
      inputContentEmpty.value = false;
    } else {
      inputContentEmpty.value = true;
    }
    emits('onTyping', inputContentEmpty.value, inputBlur.value);
  },
  onFocus() {
    if (isH5.value && document?.getElementById('app')?.style) {
      // set app height when keyboard popup
      const keyboardHeight = document.body.scrollHeight - window.innerHeight;
      (document.getElementById('app') as any).style.marginBottom = `${keyboardHeight}px`;
      (document.getElementById('app') as any).style.height = `calc(100% - ${keyboardHeight}px)`;
    }
    if (!enableTyping.value || isGroup.value) return;
    inputBlur.value = true;
    emits('onTyping', inputContentEmpty.value, inputBlur.value);
  },
  onBlur() {
    if (isH5.value && document?.getElementById('app')?.style) {
      // reset app height to normal
      (document.getElementById('app') as any).style.marginBottom = ``;
      (document.getElementById('app') as any).style.height = `100%`;
    }
    if (!enableTyping.value || isGroup.value) return;
    inputBlur.value = true;
    emits('onTyping', inputContentEmpty.value, inputBlur.value);
  },
});

const editorContainer = ref();

const handleEnter = (e: any) => {
  if (isH5?.value) {
    return;
  }
  e?.preventDefault();
  e?.stopPropagation();
  if (e.keyCode === 13 && e.ctrlKey) {
    // ctrl + enter: warp
    editor?.value?.commands?.insertContent('<p></p>');
  } else if (e.keyCode === 13) {
    // enter only: send message
    emits('sendMessage');
  }
};

// fileMap 存储 fileURL 与 fileObject 的映射
const fileMap = new Map<string, any>();
const handleFileDropOrPaste = async (e: any, type: string) => {
  e.preventDefault();
  e.stopPropagation();
  if (isH5.value) {
    return;
  }
  if (!enableDragUpload?.value && type === 'drop') {
    return;
  }
  if ((type === 'drop' && e.dataTransfer) || (type === 'paste' && e.clipboardData)) {
    const files = type === 'drop' ? e?.dataTransfer?.files : e?.clipboardData?.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const fileSrc = isImage ? URL.createObjectURL(file) : await drawFileCanvasToImageUrl(file);
      editor?.value?.commands?.insertContent({
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
          editor?.value?.commands?.focus('end');
          editor?.value?.commands?.scrollIntoView();
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
      let img = new Image();
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
  let width = 160;
  let height = 50;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  // 设置内存中的实际大小（缩放以考虑额外的像素密度）
  var scale = window.devicePixelRatio; // 在视网膜屏幕上更改为 1 以查看模糊
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
  const fileTypes = ['image', 'pdf', 'text', 'ppt', 'presentation', 'sheet', 'zip', 'word', 'video', 'unknown'];
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
  return handleEditorForMessage();
};

const handleEditorForMessage = () => {
  const editorJSON = editor?.value?.getJSON();
  const content: any[] = [];
  const handleEditorContent = (root: any) => {
    if (!root || !root.type) {
      return;
    } else if (root.type !== 'text' && root.type !== 'custom-image' && root.type !== 'mention') {
      if (root.type === 'paragraph') {
        handleEditorNode(root);
      }
      if (root.content && root.content.length) {
        root.content.forEach((item: any) => {
          handleEditorContent(item);
        });
      }
      return;
    } else {
      handleEditorNode(root);
    }
  };
  const handleEditorNode = (node: any) => {
    // handle enter
    if (node.type === 'paragraph') {
      if (content.length > 0 && content[content.length - 1] && content[content.length - 1]?.type === 'text') {
        content[content.length - 1].payload.text += '\n';
      }
    } else if (node.type === 'text' || (node.type === 'custom-image' && node?.attrs?.class === 'emoji')) {
      const text = node.type === 'text' ? node?.text : node?.attrs?.alt;
      if (content.length > 0 && content[content.length - 1] && content[content.length - 1]?.type === 'text') {
        content[content.length - 1].payload.text += text;
      } else {
        content.push({
          type: 'text',
          payload: { text: text },
        });
      }
    } else if (node.type === 'custom-image' && node?.attrs?.class === 'normal') {
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
      if (content.length > 0 && content[content.length - 1] && content[content.length - 1]?.type === 'text') {
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
  };
  handleEditorContent(editorJSON);
  return content;
};

const addEmoji = (emoji: any) => {
  editor?.value?.commands?.insertContent({
    type: 'custom-image',
    attrs: {
      src: emoji?.url,
      alt: emoji?.name,
      title: emoji?.name,
      class: 'emoji',
    },
  });
  editor?.value?.commands.focus('end');
  editor?.value?.commands?.scrollIntoView();
};

const resetEditor = () => {
  editor?.value?.commands?.clearContent(true);
  fileMap?.clear();
  editor?.value?.commands?.focus('end');
  inputBlur.value = true;
  inputContentEmpty.value = true;
};

const setEditorContent = (content: any) => {
  editor?.value?.commands?.insertContent(content);
};

defineExpose({
  getEditorContent,
  addEmoji,
  resetEditor,
  setEditorContent,
});
</script>

<style scoped lang="scss">
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');
.message-input {
  &-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: calc(100% - 13px);
    width: calc(100% - 20px);
    padding: 3px 10px 10px 10px;
    overflow: hidden;
  }
  &-area {
    flex: 1;
    display: flex;
    overflow-y: scroll;
  }
  &-mute {
    flex: 1;
    display: flex;
    color: #999999;
    font-size: 14px;
    justify-content: center;
    align-items: center;
  }
}
.message-input-container-h5 {
  flex: 1;
  height: auto;
  background: #f4f5f9;
  border-radius: 9.4px;
  padding: 7px 0px 7px 10px;
  font-size: 16px !important;
  max-height: 86px;
  margin-right: 7px;
}
</style>
<style lang="scss">
.ProseMirror {
  min-height: 100%;
  height: fit-content;
  flex: 1;
  font-size: 14px;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  div,ul,ol,dl,dt,dd,li,dl,h1,h2,h3,h4,p{
    margin:0;
    padding:0;
    font-style:normal;
  }
  p {
    * {
      vertical-align: bottom;
    }
  }
  -webkit-user-select: text;
  user-select: text;
  &-focused {
    border: none;
    outline: none;
  }
  img {
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
  }

  .ProseMirror-selectednode {
    outline: 2px solid #68cef8;
    cursor: none;
  }
  p,
  [contenteditable] {
    -webkit-user-select: text;
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
