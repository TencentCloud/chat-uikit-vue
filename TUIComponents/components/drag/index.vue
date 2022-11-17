<template>
  <div class="drag-container" v-show="show">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, onMounted, watch, watchEffect } from 'vue';
export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: () => false,
    },
    domClassName: {
      type: String,
      default: '',
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      show: false,
      domClassName: '',
      startPosition: {
        left: '',
        top: '',
        cssText: '',
      },
    });

    watchEffect(() => {
      data.show = props.show;
      data.domClassName = props.domClassName;
    });

    onMounted(() => {
      const dragDom = document.getElementsByClassName(
        props.domClassName ? props.domClassName : 'drag-container'
      )[0] as HTMLElement;
      if (!dragDom) return;
      let isDrag = false;
      watch(
        () => data.show,
        (newVal, oldVal) => {
          data.show = newVal;
          if (newVal === oldVal) return;
          if (data.show === true) {
            dragDom.style.left = data.startPosition?.left;
            dragDom.style.top = data.startPosition?.top;
            dragDom.style.cssText = data.startPosition?.cssText;
          }
        }
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
      dragDom.addEventListener('mousedown', mouseDown);
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

    return {
      ...toRefs(data),
      throttle,
    };
  },
});
</script>
<style lang="scss">
.drag-container {
  position: fixed;
  z-index: 100;
}
</style>
