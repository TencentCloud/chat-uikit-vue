<template>
  <div class="message-image" ref="skeleton">
    <img class="message-img" :src="data.url" />
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, reactive, toRefs, nextTick, ref } from 'vue';
import { handleSkeletonSize } from '../utils/utils';

export default defineComponent({
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      data: {},
    });

    const skeleton: any = ref();

    watchEffect(() => {
      data.data = props.data;
      if (!data.data) return;
      nextTick(() => {
        const containerWidth = document.getElementById('messageEle')?.clientWidth || 0;
        const max = props.isH5 ? Math.min(containerWidth - 172, 300) : 300;
        const size = handleSkeletonSize(240, 240, max, max);
        skeleton?.value?.style && (skeleton.value.style.width = `${size.width}px`);
        skeleton?.value?.style && (skeleton.value.style.height = `${size.height}px`);
      });
    });
    return {
      ...toRefs(data),
      skeleton,
    };
  },
});
</script>
<style lang="scss" scoped>
.text-img {
  width: 20px;
  height: 20px;
}
.message-img {
  max-width: min(calc(100vw - 180px), 300px);
  max-height: min(calc(100vw - 180px), 300px);
}
</style>
