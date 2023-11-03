<template>
  <div class="message-video">
    <div
      class="message-video-box"
      :class="[
        (!props.messageItem.progress || props.messageItem.progress === 1)
        && !isPC
        && 'message-video-cover',
      ]"
      @click="toggleVideoPreviewer"
      ref="skeleton"
    >
      <img
        class="message-img"
        v-if="
          (props.messageItem.progress > 0 && props.messageItem.progress < 1 && poster) ||
          (!isPC && poster)
        "
        :class="[isWidth ? 'isWidth' : 'isHeight']"
        :src="poster"
      />
      <video
        class="message-img video-h5-uploading"
        v-else-if="!isPC"
        :src="props.content.url + '#t=0.1'"
        :poster="props.content.url"
        preload="auto"
        muted
        ref="videoRef"
      ></video>
      <video
        class="message-img video-web"
        v-else
        :src="props.content.url"
        controls
        preload="metadata"
        :poster="poster"
        ref="videoRef"
      ></video>
    </div>
    <div
      class="dialog-video"
      v-if="isShow && !isPC"
    >
      <div @click.stop="toggleVideoPreviewer" class="dialog-video-close">
        <Icon :file="closeSVG"></Icon>
      </div>
      <div
        class="dialog-video-box"
        :class="[!isPC ? 'dialog-video-h5' : '']"
        @click.self="toggleVideoPreviewer"
      >
        <video
          :class="[isWidth ? 'isWidth' : 'isHeight']"
          :src="props.content.url"
          controls
          autoplay
        ></video>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  watch,
  computed,
  nextTick,
  watchEffect,
  withDefaults,
} from "../../../../adapter-vue";
import { TUIGlobal, IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { handleSkeletonSize } from "../../utils/utils";
import Icon from "../../../common/Icon.vue";
import closeSVG from "../../../../assets/icon/icon-close.svg";
import type { IVideoMessageContent } from "../../../../interface";

const props = withDefaults(
  defineProps<{
    content: IVideoMessageContent;
    messageItem: IMessageModel;
  }>(),
  {
    content: () => ({} as IVideoMessageContent),
    messageItem: () => ({} as IMessageModel),
  }
);

const isPC = TUIGlobal.getPlatform() === "pc";
const emits = defineEmits(["uploading"]);
const isShow = ref(false);
const poster = ref("");
const posterWidth = ref(0);
const posterHeight = ref(0);
const skeleton = ref();
const videoRef = ref();
const transparentPosterUrl = "https://web.sdk.qcloud.com/im/assets/images/transparent.png";

watchEffect(async () => {
  if (!props.content) return;
  poster.value = await handlePosterUrl(props.content, props.messageItem);
  nextTick(async () => {
    const containerWidth =
      document.getElementById("messageScrollList")?.clientWidth || 0;
    const max = !isPC ? Math.min(containerWidth - 172, 300) : 300;
    let size;
    if (props.messageItem.status === "success") {
      let { snapshotWidth = 0, snapshotHeight = 0, snapshotUrl } = props.content;
      if (snapshotWidth === 0 || snapshotHeight === 0) return;
      if (snapshotUrl === transparentPosterUrl) {
        snapshotWidth = posterWidth.value;
        snapshotHeight = posterHeight.value;
      }
      size = handleSkeletonSize(snapshotWidth, snapshotHeight, max, max);
      skeleton?.value?.style &&
        (skeleton.value.style.width = `${size.width}px`);
      skeleton?.value?.style &&
        (skeleton.value.style.height = `${size.height}px`);
      if (isPC) {
        videoRef?.value?.style && (videoRef.value.style.width = `${size.width}px`);
        videoRef?.value?.style && (videoRef.value.style.height = `${size.height}px`);
      }
    } else {
      emits("uploading");
    }
  });
});

const isWidth = computed(() => {
  const { snapshotWidth = 0, snapshotHeight = 0 } = props.messageItem.payload;
  return snapshotWidth >= snapshotHeight;
});

watch(() => props.messageItem.status, (newVal: string, oldVal: string) => {
  if (newVal === "success" && oldVal !== "success") {
    emits("uploading");
  }
});

function toggleVideoPreviewer() {
  // 视频上传过程中不支持全屏播放
  if (props.messageItem.progress > 0 && props.messageItem.progress < 1) {
    return;
  }
  isShow.value = !isShow.value;
}

// h5 部分浏览器（safari / wx）video标签 封面为空 在视频未上传完成前的封面展示需要单独进行处理截取
function getVideoBase64 (url: string) {
  return new Promise((resolve) => {
    let dataURL = "";
    let video = document.createElement("video");
    video.setAttribute("crossOrigin", "anonymous"); //处理跨域
    video.setAttribute("src", url);
    video.setAttribute("preload", "auto");
    video.addEventListener(
      "loadeddata",
      function () {
        let canvas = document.createElement("canvas"),
          width = video.videoWidth, //canvas的尺寸和图片一样
          height = video.videoHeight;
        canvas.width = width;
        canvas.height = height;
        (canvas as any).getContext("2d").drawImage(video, 0, 0, width, height); //绘制canvas
        dataURL = canvas.toDataURL("image/jpeg"); //转换为base64
        posterWidth.value = width;
        posterHeight.value = height;
        resolve(dataURL);
      },
      { once: true }
    );
  });
}

async function handlePosterUrl(messgeContent: IVideoMessageContent, messageItem: IMessageModel) {
  if (!messageItem) return "";
  if (messageItem.status !== "success") {
    return await getVideoBase64(messgeContent.url);
  } else {
    return (
      (messgeContent.snapshotUrl !== transparentPosterUrl && messgeContent.snapshotUrl) ||
      (messageItem?.payload?.snapshotUrl !== transparentPosterUrl &&
        messageItem?.payload?.snapshotUrl) ||
      (messageItem.payload?.thumbUrl !== transparentPosterUrl &&
        messageItem?.payload?.thumbUrl) ||
      (await getVideoBase64(messgeContent.url))
    );
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common.scss";
.message-video {
  position: relative;
  display: flex;
  justify-content: center;
  overflow: hidden;
  &-box {
    max-width: min(calc(100vw - 180px), 300px);
    font-size: 0;
    video {
      max-width: min(calc(100vw - 180px), 300px);
      max-height: min(calc(100vw - 180px), 300px);
      width: inherit;
      height: inherit;
      border-radius: 10px;
    }
    img {
      max-width: min(calc(100vw - 180px), 300px);
      max-height: min(calc(100vw - 180px), 300px);
      width: inherit;
      height: inherit;
      border-radius: 10px;
    }
    img[src=""],
    img:not([src]) {
      opacity: 0;
    }
  }
  &-cover {
    display: inline-block;
    position: relative;
    &::before {
      position: absolute;
      z-index: 1;
      content: "";
      width: 0px;
      height: 0px;
      border: 10px solid transparent;
      border-left: 15px solid #ffffff;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      transform: translate(5px, 0px);
    }
    video {
      max-width: min(calc(100vw - 180px), 300px);
      max-height: min(calc(100vw - 180px), 300px);
      width: inherit;
      height: inherit;
      border-radius: 10px;
    }
  }
}
.dialog-video {
  position: fixed;
  z-index: 12;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  &-close {
    display: flex;
    justify-content: flex-end;
    background: #000000;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 10px;
  }
  &-box {
    display: flex;
    flex: 1;
    max-height: 100%;
    padding: 6rem;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    video {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
.dialog-video-h5 {
  width: 100%;
  height: 100%;
  background: #000000;
  padding: 30px 0;
}

.isWidth {
  width: 100%;
}
.isHeight {
  height: 100%;
}
</style>
