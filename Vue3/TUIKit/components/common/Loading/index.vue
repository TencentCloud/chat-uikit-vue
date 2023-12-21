<template>
  <div
    class="tui-loading"
    :style="{
      width: width,
      height: height,
      border: `2px solid ${color}`,
      borderTopColor: 'transparent',
    }"
  ></div>
</template>
<script setup lang="ts">
const props = defineProps({
  width: {
    type: String,
    default: "30px",
  },
  height: {
    type: String,
    default: "30px",
  },
  color: {
    type: String,
    default: "#D9D9D9",
  },
});
</script>
<style scoped lang="scss">
.tui-loading {
  width: 30px;
  height: 30px;
  border: 2px solid #d9d9d9;
  border-top-color: transparent;
  border-radius: 100%;

  animation: circle infinite 0.75s linear;
}

// 转转转动画
@keyframes circle {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
