<template>
  <div class="message-video">
    <div
      ref="skeleton"
      class="message-video-box"
      :class="[
        (!props.messageItem.progress || props.messageItem.progress === 1)
          && !isPC
          && 'message-video-cover',
      ]"
      @click="toggleVideoPreviewer"
    >
      <img
        v-if="(props.messageItem.progress > 0 && props.messageItem.progress < 1 && poster) ||
          (!isPC && poster)
        "
        class="message-img"
        :class="[isWidth ? 'is-width' : 'is-height']"
        :src="poster"
      >
      <video
        v-else-if="!isPC"
        ref="videoRef"
        class="message-img video-h5-uploading"
        :src="props.content.url + '#t=0.1'"
        :poster="props.content.url"
        preload="auto"
        muted
      />
      <video
        v-else
        ref="videoRef"
        class="message-img video-web"
        :src="props.content.url"
        controls
        preload="metadata"
        :poster="poster"
      />
    </div>
    <div
      v-if="isShow && !isPC"
      class="dialog-video"
    >
      <div
        class="dialog-video-close"
        @click.stop="toggleVideoPreviewer"
      >
        <Icon :file="closeSVG" />
      </div>
      <div
        class="dialog-video-box"
        :class="[!isPC ? 'dialog-video-h5' : '']"
        @click.self="toggleVideoPreviewer"
      >
        <video
          :class="[isWidth ? 'is-width' : 'is-height']"
          :src="props.content.url"
          controls
          autoplay
        />
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
} from '../../../../adapter-vue';
import { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { handleSkeletonSize } from '../../utils/utils';
import Icon from '../../../common/Icon.vue';
import closeSVG from '../../../../assets/icon/icon-close.svg';
import type { IVideoMessageContent } from '../../../../interface';
import { isPC } from '../../../../utils/env';

const props = withDefaults(
  defineProps<{
    content: IVideoMessageContent;
    messageItem: IMessageModel;
  }>(),
  {
    content: () => ({} as IVideoMessageContent),
    messageItem: () => ({} as IMessageModel),
  },
);

const emits = defineEmits(['uploading']);
const isShow = ref(false);
const poster = ref('');
const posterWidth = ref(0);
const posterHeight = ref(0);
const skeleton = ref();
const videoRef = ref();
const transparentPosterUrl = 'https://web.sdk.qcloud.com/im/assets/images/transparent.png';

watchEffect(async () => {
  if (!props.content) return;
  poster.value = await handlePosterUrl(props.content, props.messageItem);
  nextTick(async () => {
    const containerWidth
      = document.getElementById('messageScrollList')?.clientWidth || 0;
    const max = !isPC ? Math.min(containerWidth - 172, 300) : 300;
    let size;
    if (props.messageItem.status === 'success') {
      let { snapshotWidth = 0, snapshotHeight = 0 } = props.content;
      const { snapshotUrl } = props.content;
      if (snapshotWidth === 0 || snapshotHeight === 0) return;
      if (snapshotUrl === transparentPosterUrl) {
        snapshotWidth = posterWidth.value;
        snapshotHeight = posterHeight.value;
      }
      size = handleSkeletonSize(snapshotWidth, snapshotHeight, max, max);
      skeleton?.value?.style
      && (skeleton.value.style.width = `${size.width}px`);
      skeleton?.value?.style
      && (skeleton.value.style.height = `${size.height}px`);
      if (isPC) {
        videoRef?.value?.style && (videoRef.value.style.width = `${size.width}px`);
        videoRef?.value?.style && (videoRef.value.style.height = `${size.height}px`);
      }
    } else {
      emits('uploading');
    }
  });
});

const isWidth = computed(() => {
  const { snapshotWidth = 0, snapshotHeight = 0 } = props.messageItem.payload;
  return snapshotWidth >= snapshotHeight;
});

watch(() => props.messageItem.status, (newVal: string, oldVal: string) => {
  if (newVal === 'success' && oldVal !== 'success') {
    emits('uploading');
  }
});

function toggleVideoPreviewer() {
  // Video upload process does not support full-screen playback.
  if (props.messageItem.progress > 0 && props.messageItem.progress < 1) {
    return;
  }
  isShow.value = !isShow.value;
}

// For H5, some browsers (Safari/WeChat) have an issue where the cover image of the<video>` tag is empty before the video is fully uploaded.
//  A separate processing and clipping method is required to display the cover image before the video upload is complete.
function getVideoBase64(url: string) {
  return new Promise((resolve) => {
    let dataURL = '';
    const video = document.createElement('video');
    video.setAttribute('crossOrigin', 'anonymous');
    video.setAttribute('src', url);
    video.setAttribute('preload', 'auto');
    video.addEventListener(
      'loadeddata',
      function () {
        const canvas = document.createElement('canvas'),
          width = video.videoWidth,
          height = video.videoHeight;
        canvas.width = width;
        canvas.height = height;
        (canvas as any).getContext('2d').drawImage(video, 0, 0, width, height);
        dataURL = canvas.toDataURL('image/jpeg');
        posterWidth.value = width;
        posterHeight.value = height;
        resolve(dataURL);
      },
      { once: true },
    );
  });
}

async function handlePosterUrl(messgeContent: IVideoMessageContent, messageItem: IMessageModel) {
  if (!messageItem) return '';
  if (messageItem.status !== 'success') {
    return await getVideoBase64(messgeContent.url);
  } else {
    return (
      (messgeContent.snapshotUrl !== transparentPosterUrl && messgeContent.snapshotUrl)
      || (messageItem?.payload?.snapshotUrl !== transparentPosterUrl
      && messageItem?.payload?.snapshotUrl)
      || (messageItem.payload?.thumbUrl !== transparentPosterUrl
      && messageItem?.payload?.thumbUrl)
      || (await getVideoBase64(messgeContent.url))
    );
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/styles/common";

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
      width: 0;
      height: 0;
      border: 10px solid transparent;
      border-left: 15px solid #fff;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      transform: translate(5px, 0);
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
    background: #000;
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
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
  background: #000;
  padding: 30px 0;
}

.is-width {
  width: 100%;
}

.is-height {
  height: 100%;
}
</style>
