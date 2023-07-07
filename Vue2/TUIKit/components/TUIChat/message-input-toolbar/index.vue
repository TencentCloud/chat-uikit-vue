<template>
  <div
    :class="[
      'message-input-toolbar',
      !isPC && 'message-input-toolbar-h5',
      isUniFrameWork && 'message-input-toolbar-uni',
    ]"
  >
    <div
      :class="[
        'message-input-toolbar-list',
        !isPC && 'message-input-toolbar-h5-list',
        isUniFrameWork && 'message-input-toolbar-uni-list',
      ]"
    >
      <EmojiPicker
        v-if="!isUniFrameWork"
        @insertEmoji="insertEmoji"
        @dialogShowInH5="dialogShowInH5"
        @dialogCloseInH5="dialogCloseInH5"
      ></EmojiPicker>
      <ImageUpload v-if="isUniFrameWork" imageSourceType="camera"></ImageUpload>
      <ImageUpload imageSourceType="album"></ImageUpload>
      <FileUpload v-if="!isUniFrameWork"></FileUpload>
      <VideoUpload videoSourceType="album"></VideoUpload>
      <VideoUpload v-if="isUniFrameWork" videoSourceType="camera"></VideoUpload>
      <Evaluate></Evaluate>
      <Words></Words>
    </div>
    <div
      v-if="isH5"
      :class="['message-input-toolbar-h5-dialog']"
      ref="h5Dialog"
    ></div>
  </div>
</template>
<script setup lang="ts">
import {
  TUIGlobal,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import {
  ref,
  defineExpose,
  watch,
  nextTick,
  defineEmits,
} from "../../../adapter-vue";
// component
import EmojiPicker from "./emoji-picker/index.vue";
import ImageUpload from "./image-upload/index.vue";
import FileUpload from "./file-upload/index.vue";
import VideoUpload from "./video-upload/index.vue";
import Evaluate from "./evaluate/index.vue";
import Words from "./words/index.vue";

const emits = defineEmits(["insertEmoji"]);

const h5Dialog = ref();
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== 'undefined');
const currentComponentID = ref();

const insertEmoji = (emojiObj: object) => {
  emits("insertEmoji", emojiObj);
};

const dialogShowInH5 = (dialogDom: any) => {
  if (!isH5.value) {
    return;
  }
  h5Dialog?.value?.appendChild && h5Dialog?.value?.appendChild(dialogDom);
};

const dialogCloseInH5 = (dialogDom: any) => {
  if (!isH5.value) {
    return;
  }
  h5Dialog?.value?.removeChild && h5Dialog?.value?.removeChild(dialogDom);
};
</script>
<style lang="scss" scoped>
.message-input-toolbar {
  border-top: 1px solid #f4f5f9;
  height: fit-content;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  &-list {
    list-style: none;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
    &-item {
      .icon {
        margin: 12px 10px 1px;
        width: 20px;
        height: 20px;
      }
    }
  }
}
.message-input-toolbar-h5 {
  padding: 0 10px 10px 10px;
  box-sizing: border-box;
}

.message-input-toolbar-uni {
  background-color: #ebf0f6;
  &-list {
    display: grid;
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(2, 100px);
  }
}
</style>
