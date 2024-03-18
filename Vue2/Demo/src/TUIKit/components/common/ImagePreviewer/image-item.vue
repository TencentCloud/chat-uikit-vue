<template>
  <img
    class="image-preview"
    :style="{
      transform: `scale(${props.zoom}) rotate(${props.rotate}deg)`,
    }"
    :src="props.src"
  >
</template>
<script setup lang="ts">
const props = defineProps({
  zoom: {
    type: Number,
    default: 1,
  },
  rotate: {
    type: Number,
    default: 0,
  },
  src: {
    type: String,
    default: '',
  },
});
</script>
<style lang="scss">
.image-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.1s ease 0s;
  pointer-events: auto;
}
</style>
