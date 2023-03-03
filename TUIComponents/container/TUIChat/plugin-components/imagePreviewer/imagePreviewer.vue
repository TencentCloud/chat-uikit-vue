<template>
  <div class="image-previewer" :class="[isH5 && 'image-previewer-h5']">
    <div class="image-wrapper" ref="image">
      <ul
        class="image-list"
        :style="{
          width: `${imageList.length * 100}%`,
          transform: `translateX(-${(currentImageIndex * 100) / imageList.length}%)`,
        }"
        ref="ul"
      >
        <li class="image-item" v-for="(item, index) in imageList" :key="index">
          <img
            class="image-preview"
            :style="{
              transform: `scale(${zoom}) rotate(${rotate}deg)`,
            }"
            :src="item?.payload?.imageInfoArray[0]?.url"
          />
        </li>
      </ul>
    </div>
    <i class="icon icon-close" @click="close" v-show="!isH5" />
    <div class="image-button image-button-left" v-show="!isH5 && currentImageIndex > 0" @click="goPrev">
      <i class="icon icon-left-arrow"></i>
    </div>
    <div
      class="image-button image-button-right"
      v-show="!isH5 && currentImageIndex < imageList?.length - 1"
      @click="goNext"
    >
      <i class="icon icon-right-arrow"></i>
    </div>
    <div class="actions-bar">
      <i class="icon icon-zoom-in" @click="zoomIn"></i>
      <i class="icon icon-zoom-out" @click="zoomOut"></i>
      <i class="icon icon-refresh-left" @click="rotateLeft"></i>
      <i class="icon icon-refresh-right" @click="rotateRight"></i>
      <span class="image-counter">{{ currentImageIndex + 1 }} / {{ imageList.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import TUIEnv from '../../../../../TUIPlugin/TUIEnv';
import { defineProps, ref, defineEmits, watchEffect, onMounted, onbe, onUnmounted } from 'vue';
import { Message } from '../../interface';
import { isNumber } from '@vueuse/shared';
interface touchesPosition {
  pageX1?: number;
  pageY1?: number;
  pageX2?: number;
  pageY2?: number;
}
const props = defineProps({
  imageList: {
    type: Array,
    default: () => [] as Array<Message>,
  },
  currentImage: {
    type: Object,
    default: () => ({} as Message),
  },
});
const emit = defineEmits(['close']);
const zoom = ref(1);
const rotate = ref(0);
const minZoom = ref(0.1);
const currentImageIndex = ref(0);
const image = ref();
const ul = ref();
const { isH5 } = TUIEnv();
// touch
let startX = 0;
let touchStore = {} as touchesPosition;
let moveFlag = false;
let twoTouchesFlag = false;
let timer: number | null = null;

watchEffect(() => {
  currentImageIndex.value = props.imageList.findIndex((message: any) => {
    return message.ID === props.currentImage.ID;
  });
});

const debounce = (func: any, wait = 200) => {
  let timer: any;
  return function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, wait);
  };
};

const handleTouchStart = (e: any) => {
  e.preventDefault();
  moveInit(e);
  twoTouchesInit(e);
};

const handleTouchMove = (e: any) => {
  e.preventDefault();
  moveFlag = true;
  if (e.touches && e.touches.length === 2) {
    twoTouchesFlag = true;
    handleTwoTouches(e);
  }
};

const handleTouchEnd = (e: any) => {
  e.preventDefault();
  let moveEndX = 0;
  let X = 0;
  if (twoTouchesFlag) {
    if (!timer) {
      twoTouchesFlag = false;
      delete touchStore.pageX2;
      delete touchStore.pageY2;
      timer = setTimeout(() => {
        timer = null;
      }, 200);
    }
    return;
  }
  // H5 touch move to left to go to prev image
  // H5 touch move to right to go to next image
  if (timer === null) {
    switch (moveFlag) {
      // touch event
      case true:
        moveEndX = e?.changedTouches[0]?.pageX;
        X = moveEndX - startX;
        if (X > 100) {
          goPrev();
        } else if (X < -100) {
          goNext();
        }
        break;
      // click event
      case false:
        close();
        break;
    }
    timer = setTimeout(() => {
      timer = null;
    }, 200);
  }
};

const handleTouchCancel = (e: any) => {
  twoTouchesFlag = false;
  delete touchStore.pageX1;
  delete touchStore.pageY1;
};

const handleWheel = (e: any) => {
  e.preventDefault();
  if (Math.abs(e.deltaX) !== 0 && Math.abs(e.deltaY) !== 0) return;
  let scale = zoom.value;
  scale += e.deltaY * (e.ctrlKey ? -0.01 : 0.002);
  scale = Math.min(Math.max(0.125, scale), 4);
  zoom.value = scale;
};

const moveInit = (e: any) => {
  startX = e?.changedTouches[0]?.pageX;
  moveFlag = false;
};

const twoTouchesInit = (e: any) => {
  let touch1 = e?.touches[0];
  let touch2 = e?.touches[1];
  touchStore.pageX1 = touch1?.pageX;
  touchStore.pageY1 = touch1?.pageY;
  if (touch2) {
    touchStore.pageX2 = touch2?.pageX;
    touchStore.pageY2 = touch2?.pageY;
  }
};

const handleTwoTouches = (e: any) => {
  let touch1 = e?.touches[0];
  let touch2 = e?.touches[1];
  if (touch2) {
    if (!isNumber(touchStore.pageX2)) {
      touchStore.pageX2 = touch2.pageX;
    }
    if (!isNumber(touchStore.pageY2)) {
      touchStore.pageY2 = touch2.pageY;
    }
  }
  const getDistance = (startX: number, startY: number, stopX: number, stopY: number) => {
    return Math.hypot(stopX - startX, stopY - startY);
  };
  if (
    !isNumber(touchStore.pageX1) ||
    !isNumber(touchStore.pageY1) ||
    !isNumber(touchStore.pageX2) ||
    !isNumber(touchStore.pageY2)
  ) {
    return;
  }
  let touchZoom =
    getDistance(touch1.pageX, touch1.pageY, touch2.pageX, touch2.pageY) /
    getDistance(touchStore.pageX1, touchStore.pageY1, touchStore.pageX2, touchStore.pageY2);
  zoom.value = Math.min(Math.max(0.5, zoom.value * touchZoom), 4);
};

onMounted(() => {
  image?.value?.addEventListener('touchstart', handleTouchStart);
  image?.value?.addEventListener('touchmove', handleTouchMove);
  image?.value?.addEventListener('touchend', handleTouchEnd);
  image?.value?.addEventListener('touchcancel;', handleTouchCancel);
  // web: mouse wheel & mac wheel
  image?.value?.addEventListener('wheel', handleWheel);
  // web: close on esc keydown
  document?.addEventListener('keydown', handleEsc);
});

const handleEsc = (e: any) => {
  e.preventDefault();
  if (e?.keyCode === 27) {
    close();
  }
};
const zoomIn = () => {
  zoom.value += 0.1;
};
const zoomOut = () => {
  zoom.value = zoom.value - 0.1 > minZoom.value ? zoom.value - 0.1 : minZoom.value;
};
const close = () => {
  emit('close');
};
const rotateLeft = () => {
  rotate.value -= 90;
};
const rotateRight = () => {
  rotate.value += 90;
};
const goNext = () => {
  ul.value.style.transition = '0.5s';
  currentImageIndex.value < props.imageList.length - 1 && currentImageIndex.value++;
  initStyle();
};
const goPrev = () => {
  ul.value.style.transition = '0.5s';
  currentImageIndex.value > 0 && currentImageIndex.value--;
  initStyle();
};
const initStyle = () => {
  zoom.value = 1;
  rotate.value = 0;
};

onUnmounted(() => {
  image?.value?.removeEventListener('touchstart', handleTouchStart);
  image?.value?.removeEventListener('touchmove', handleTouchMove);
  image?.value?.removeEventListener('touchend', handleTouchEnd);
  image?.value?.removeEventListener('touchcancel;', handleTouchCancel);
  image?.value?.removeEventListener('wheel', handleWheel);
  document?.removeEventListener('keydown', handleEsc);
});
</script>

<style lang="scss" scoped>
.image-previewer {
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
  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .image-list {
    position: absolute;
    height: 100%;
    left: 0;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
    .image-item {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  }
  .image-preview {
    max-width: 100%;
    max-height: 100%;
    transition: transform 0.1s ease 0s;
    pointer-events: auto;
  }
  .image-button {
    position: absolute;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    top: calc(50% - 20px);
    background: rgba(255, 255, 255, 0.8);
    &-left {
      left: 10px;
    }
    &-right {
      right: 10px;
    }
    .icon {
      position: absolute;
      bottom: 0;
      top: 0;
      left: 0;
      right: 0;
      margin: auto;
      line-height: 40px;
    }
  }
  .icon-close {
    position: absolute;
    cursor: pointer;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    top: 3%;
    right: 3%;
    padding: 6px;
    background: rgba(255, 255, 255, 0.8);
    &::before,
    &::after {
      background-color: #444444;
    }
  }
}
.image-previewer-h5 {
  width: 100%;
  height: 100%;
  background: #000000;
  display: flex;
  flex-direction: column;
}
.actions-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  bottom: 5%;
  padding: 12px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  .icon {
    position: static;
    font-size: 24px;
    cursor: pointer;
    margin: 0 6px;
    width: 27px;
    height: 27px;
    margin: 5px;
  }
}
.image-counter {
  background: rgba(20, 18, 20, 0.53);
  padding: 3px 5px;
  margin: 5px;
  border-radius: 3px;
  color: #fff;
}
</style>
