<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    :class="['common-icon-container', !isPC && 'common-icon-container-mobile']"
    :style="{
      padding: iconHotAreaSize,
    }"
    @click="handleImgClick"
  >
    <image
      v-if="isApp"
      class="common-icon"
      :src="props.file"
      :style="{ width: iconWidth, height: iconHeight }"
    />
    <img
      v-else
      class="common-icon"
      :src="props.file"
      :style="{ width: iconWidth, height: iconHeight }"
    >
  </div>
</template>
<script setup lang="ts">
import { withDefaults, computed } from '../../adapter-vue';
import { isApp, isPC } from '../../utils/env';

interface IProps {
  file: string;
  size?: string;
  width?: string;
  height?: string;
  hotAreaSize?: number | string;
}

interface IEmits {
  (key: 'onClick', e: Event): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  file: '',
  width: '20px',
  height: '20px',
});

const iconHotAreaSize = computed<undefined | string>(() => {
  if (!props.hotAreaSize) {
    return undefined;
  }
  if (isNaN(Number(props.hotAreaSize))) {
    return String(props.hotAreaSize);
  }
  return `${props.hotAreaSize}px`;
});

const iconWidth = computed(() => {
  return props.size ? props.size : props.width;
});

const iconHeight = computed(() => {
  return props.size ? props.size : props.height;
});

const handleImgClick = (e: Event) => {
  emits('onClick', e);
};
</script>

<style lang="scss" scoped>
.common-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.common-icon-container-mobile{
  cursor: none;
}
</style>
