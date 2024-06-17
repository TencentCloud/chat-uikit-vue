<!-- Drag and drop component, only applicable to web&h5 -->
<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import {
  reactive,
  onMounted,
  watch,
  watchEffect,
  getCurrentInstance,
  nextTick,
} from '../../../adapter-vue';
const props = defineProps({
  show: {
    type: Boolean,
    default: () => false,
  },
  domClassName: {
    type: String,
    default: '',
  },
});
const data = reactive({
  show: false,
  domClassName: '',
  startPosition: {
    left: '',
    top: '',
    cssText: '',
  },
});

const ctx = getCurrentInstance();

watchEffect(() => {
  data.show = props.show;
  data.domClassName = props.domClassName;
});

onMounted(() => {
  let isDrag = false;
  let dragDom = document?.getElementsByClassName(
    props.domClassName,
  )[0] as HTMLElement;
  watch(
    () => data.show,
    (newVal: any, oldVal: any) => {
      data.show = newVal;
      if (newVal === oldVal) return;
      if (data.show === true) {
        nextTick(() => {
          dragDom = document?.getElementsByClassName(
            props.domClassName,
          )[0] as HTMLElement;
          if (!dragDom) return;
          dragDom.style.left = data.startPosition?.left;
          dragDom.style.top = data.startPosition?.top;
          dragDom.style.cssText = data.startPosition?.cssText;
          dragDom.addEventListener('mousedown', mouseDown);
        });
      }
    },
  );
  const mouseDown = (e: MouseEvent) => {
    isDrag = true;
    const X = e.clientX - dragDom.offsetLeft;
    const Y = e.clientY - dragDom.offsetTop;
    const move = (e: MouseEvent) => {
      e.preventDefault();
      if (isDrag) {
        dragDom.style.left = `${e.clientX - X}px`;
        dragDom.style.top = `${e.clientY - Y}px`;
      }
    };
    document.addEventListener('mousemove', throttle(move, 20), false);
    document.addEventListener('mouseup', () => {
      isDrag = false;
      document.removeEventListener('mousemove', move);
    });
  };
});

function throttle(fn: { (e: MouseEvent): void; apply?: any }, timer: number) {
  let initTime = 0;
  return function (...args: any) {
    const nowTime = +new Date();
    if (nowTime - initTime > timer) {
      initTime = nowTime;
      fn.apply(ctx, args);
    }
  };
}

const positionReset = () => {
  const dragDom = document?.getElementsByClassName(
    props.domClassName,
  )[0] as HTMLElement;
  data.startPosition = {
    left: '',
    top: '',
    cssText: '',
  };
  if (!dragDom) {
    return;
  }
  dragDom.style.left = data.startPosition?.left;
  dragDom.style.top = data.startPosition?.top;
  dragDom.style.cssText = data.startPosition?.cssText;
};

defineExpose({
  positionReset,
});
</script>
<style lang="scss" scoped>
@import "../../../assets/styles/common";
</style>
