<template>
  <div class="message-image" @click.self="toggleShow" ref="skeleton">
    <img
      class="message-img"
      :src="data.url"
      :width="data.width"
      :height="data.height"
      :style="
        isH5
          ? {
              maxWidth: data.width ? data.width + 'px' : 'calc(100vw - 180px)',
              maxHeight: data.height ? data.height + 'px' : 'calc(100vw - 180px)',
            }
          : {}
      "
    />
    <div class="progress" v-if="data.progress">
      <progress :value="data.progress" max="1"></progress>
    </div>
    <div class="dialog" v-if="show" @click.self="toggleShow">
      <header v-if="!isH5">
        <i class="icon icon-close" @click.stop="toggleShow"></i>
      </header>
      <div class="dialog-box" :class="[isH5 ? 'dialog-box-h5' : '']" @click.self="toggleShow">
        <img
          :class="[isWidth ? 'isWidth' : 'isHeight']"
          :src="data.message.payload.imageInfoArray[0].url"
          @click.self="toggleShow"
        />
        <div v-if="isH5" class="dialog-box-h5-footer">
          <p @click="toggleShow">
            <img src="../../../assets/icon/close-image.png" />
          </p>
          <p @click.stop="downloadImage(data.message)">
            <img src="../../../assets/icon/downaload-image.png" />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, reactive, toRefs, computed, ref, nextTick } from 'vue';
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
  emits: ['uploading', 'previewImage'],
  setup(props: any, ctx: any) {
    const data = reactive({
      data: {
        progress: 0,
      },
      show: false,
    });

    const skeleton: any = ref();

    const isWidth = computed(() => {
      const { width = 0, height = 0 } = (data.data as any)?.message?.payload?.imageInfoArray[0];
      return width >= height;
    });

    watchEffect(() => {
      data.data = props.data;
      if (!data.data) return;
      nextTick(() => {
        if (!data.data.progress) {
          const { width = 0, height = 0 } = data.data as any;
          if (width === 0 || height === 0) return;
          const containerWidth = document.getElementById('app')?.clientWidth || 0;
          const max = props.isH5 ? Math.min(containerWidth - 180, 300) : 300;
          const size = handleSkeletonSize(width, height, max, max);
          skeleton?.value?.style && (skeleton.value.style.width = `${size.width}px`);
          skeleton?.value?.style && (skeleton.value.style.height = `${size.height}px`);
        } else {
          ctx.emit('uploading');
        }
      });
    });

    const toggleShow = () => {
      if (!data.data.progress) {
        ctx.emit('previewImage', (data.data as any).message);
      }
    };
    const downloadImage = (message: any) => {
      const targetImage = document.createElement('a');
      const downloadImageName = message.payload.imageInfoArray[0].instanceID;
      targetImage.setAttribute('download', downloadImageName);
      const image = new Image();
      image.src = message.payload.imageInfoArray[0].url;
      image.setAttribute('crossOrigin', 'Anonymous');
      image.onload = () => {
        targetImage.href = getImageDataURL(image);
        targetImage.click();
      };
    };

    const getImageDataURL = (image: any) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(image, 0, 0, image.width, image.height);
      const extension = image.src.substring(image.src.lastIndexOf('.') + 1).toLowerCase();
      return canvas.toDataURL(`image/${extension}`, 1);
    };

    return {
      ...toRefs(data),
      toggleShow,
      skeleton,
      isWidth,
      downloadImage,
    };
  },
});
</script>
<style lang="scss" scoped>
.message-image {
  position: relative;
  overflow: hidden;
  opacity: 1;
  .message-img {
    max-width: min(calc(100vw - 180px), 300px);
    max-height: min(calc(100vw - 180px), 300px);
    width: inherit;
    height: inherit;
  }
  .progress {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0 20px;
    left: 0;
    top: 0;
    background: rgba(#000000, 0.5);
    display: flex;
    align-items: center;
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
.dialog {
  position: fixed;
  z-index: 12;
  width: 100vw;
  height: 100vh;
  background: rgba(#000000, 0.3);
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
  }
}
.dialog-box-h5 {
  width: 100%;
  height: 100%;
  background: #000000;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  &-footer {
    position: fixed;
    bottom: 10px;
    display: flex;
    width: 90vw;
    justify-content: space-between;
    p {
      width: 3.88rem;
      height: 3.88rem;
    }
    img {
      width: 100%;
    }
    i {
      padding: 20px;
    }
  }
}

.isWidth {
  width: 100%;
}
.isHeight {
  height: 100%;
}
</style>
