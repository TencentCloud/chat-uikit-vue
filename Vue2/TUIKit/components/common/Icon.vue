<template>
  <!--本地 icon 资源, uniapp 打包到 app 仅支持标签 image, 打包小程序和 H5 均可支持标签 img -->
  <div class="common-icon-container" @click="handlerImgClick">
    <image class="common-icon" :src="props.file" v-if="isApp"
    :style="{ width: props.width, height: props.height }" />
    <img class="common-icon" :src="props.file" v-else
      :style="{ width: props.width, height: props.height }" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "../../adapter-vue";
import { isApp } from "../../utils/env";

const emits = defineEmits(["click"]);
const props = defineProps({
  file: {
    type: String,
    default: "",
  },
  width: {
    type: String,
    default: "20px",
  },
  height: {
    type: String,
    default: "20px",
  },
});
const handlerImgClick = () => {
  emits("click");
};
</script>
<style lang="scss" scoped>
.common-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
