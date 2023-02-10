<template>
  <div class="message-video">
    <div
      class="message-video-box"
      :class="[!data.progress && data.message.status === 'success' && isH5 && 'message-video-cover']"
      @click="toggleShow"
      ref="skeleton"
    >
      <img
        class="message-img"
        v-if="(data.progress && poster) || (isH5 && poster)"
        :class="[isWidth ? 'isWidth' : 'isHeight']"
        :src="poster"
      />
      <video
        class="message-img video-h5-uploading"
        v-else-if="isH5"
        :src="data.url + '#t=0.1'"
        :poster="data.url"
        preload="auto"
        muted
        ref="video"
      ></video>
      <video
        class="message-img video-web"
        v-else-if="!data.progress && !isH5"
        :src="data.url"
        controls
        preload="metadata"
        :poster="poster"
        ref="video"
      ></video>
      <div class="progress" v-if="data.progress">
        <progress :value="data.progress" max="1"></progress>
      </div>
    </div>
    <div class="dialog-video" v-if="show && isH5" @click.self="toggleShow">
      <header>
        <i class="icon icon-close" @click.stop="toggleShow"></i>
      </header>
      <div class="dialog-video-box" :class="[isH5 ? 'dialog-video-h5' : '']" @click.self="toggleShow">
        <video :class="[isWidth ? 'isWidth' : 'isHeight']" :src="data.url" controls autoplay></video>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, reactive, toRefs, computed, nextTick, ref, watch } from 'vue';
import { handleSkeletonSize } from '../utils/utils';

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    isH5: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      data: {},
      show: false,
      poster: '',
      posterWidth: 0,
      posterHeight: 0,
    });
    const skeleton = ref();
    const video = ref();
    const isWidth = computed(() => {
      const { snapshotWidth = 0, snapshotHeight = 0 } = (data.data as any)?.message?.payload;
      return snapshotWidth >= snapshotHeight;
    });
    const transparentPosterUrl = 'https://web.sdk.qcloud.com/im/assets/images/transparent.png';

    const toggleShow = () => {
      if (!(data.data as any).progress) {
        data.show = !data.show;
      }
    };

    // h5 部分浏览器（safari / wx）video标签 封面为空 在视频未上传完成前的封面展示需要单独进行处理截取
    const getVideoBase64 = (url: string) => {
      return new Promise(function (resolve, reject) {
        let dataURL = '';
        let video = document.createElement('video');
        video.setAttribute('crossOrigin', 'anonymous'); //处理跨域
        video.setAttribute('src', url);
        video.setAttribute('preload', 'auto');
        video.addEventListener(
          'loadeddata',
          function () {
            let canvas = document.createElement('canvas'),
              width = video.videoWidth, //canvas的尺寸和图片一样
              height = video.videoHeight;
            canvas.width = width;
            canvas.height = height;
            (canvas as any).getContext('2d').drawImage(video, 0, 0, width, height); //绘制canvas
            dataURL = canvas.toDataURL('image/jpeg'); //转换为base64
            data.posterWidth = width;
            data.posterHeight = height;
            resolve(dataURL);
          },
          { once: true }
        );
      });
    };

    const handlePosterUrl = async (data: any) => {
      if (!data) return '';
      if (data.progress) {
        return await getVideoBase64(data.url);
      } else {
        return (
          (data.snapshotUrl !== transparentPosterUrl && data.snapshotUrl) ||
          (data?.message?.payload?.snapshotUrl !== transparentPosterUrl && data?.message?.payload?.snapshotUrl) ||
          (data?.message?.payload?.thumbUrl !== transparentPosterUrl && data?.message?.payload?.thumbUrl) ||
          (await getVideoBase64(data.url))
        );
      }
    };

    watchEffect(async () => {
      data.data = props.data;
      if (!data.data) return;
      data.poster = await handlePosterUrl(data.data);
      await nextTick(async () => {
        const containerWidth = document.getElementById('messageEle')?.clientWidth || 0;
        const max = props.isH5 ? Math.min(containerWidth - 172, 300) : 300;
        let size;
        if (!(data.data as any).progress) {
          let { snapshotWidth = 0, snapshotHeight = 0, snapshotUrl } = data.data as any;
          if (snapshotWidth === 0 || snapshotHeight === 0) return;
          if (snapshotUrl === transparentPosterUrl) {
            snapshotWidth = data.posterWidth;
            snapshotHeight = data.posterHeight;
          }
          size = handleSkeletonSize(snapshotWidth, snapshotHeight, max, max);
          skeleton?.value?.style && (skeleton.value.style.width = `${size.width}px`);
          skeleton?.value?.style && (skeleton.value.style.height = `${size.height}px`);
          if (!props.isH5) {
            video?.value?.style && (video.value.style.width = `${size.width}px`);
            video?.value?.style && (video.value.style.height = `${size.height}px`);
          }
        } else {
          ctx.emit('uploading');
        }
      });
    });

    watch(
      () => (data.data as any)?.progress,
      (newVal, oldVal) => {
        if (!newVal && oldVal) {
          ctx.emit('uploading');
        }
      }
    );

    return {
      ...toRefs(data),
      toggleShow,
      isWidth,
      getVideoBase64,
      handlePosterUrl,
      skeleton,
      video,
    };
  },
});
</script>
<style lang="scss" scoped>
.message-video {
  position: relative;
  display: flex;
  justify-content: center;
  overflow: hidden;
  &-box {
    max-width: min(calc(100vw - 180px), 300px);
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
    img[src=''],
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
      content: '';
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
  .progress {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0 20px;
    border-radius: 10px;
    left: 0;
    top: 0;
    background: rgba(#000000, 0.5);
    display: flex;
    align-items: center;
    flex: 1;
    progress {
      color: #006eff;
      appearance: none;
      border-radius: 0.25rem;
      background: rgba(#ffffff, 1);
      width: 100%;
      height: 0.5rem;
      &::-webkit-progress-value {
        background-color: #006eff;
        border-radius: 0.25rem;
      }
      &::-webkit-progress-bar {
        border-radius: 0.25rem;
        background: rgba(#ffffff, 1);
      }
      &::-moz-progress-bar {
        color: #006eff;
        background: #006eff;
        border-radius: 0.25rem;
      }
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
  header {
    display: flex;
    justify-content: flex-end;
    background: rgba(0, 0, 0, 0.49);
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
