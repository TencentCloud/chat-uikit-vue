<template>
  <div
    class="overlay"
    :style="{
      zIndex: props.zIndex,
      backgroundColor: props.bgColor,
    }"
    @click="click"
    @tap="tap"
  >
    <slot></slot>
  </div>
</template>
  
<script setup lang="ts">
export interface IOverlayProps {
  zIndex?: number;
  bgColor?: string;
}

import { withDefaults } from '../../../adapter-vue';

const emits = defineEmits(['clickHandler', 'touchHandler'])

const props = withDefaults(
  defineProps<IOverlayProps>(),
  {
    zIndex: 9999,
    bgColor: 'rgba(0, 0, 0, 0.6)'
  }
);

function click() {
  emits('clickHandler');
}
function tap() {
  emits('touchHandler');
}
</script>

<style scoped lang="scss">
.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>