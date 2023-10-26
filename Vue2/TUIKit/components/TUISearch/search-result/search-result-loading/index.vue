<template>
  <div :class="['search-result-loading', !isPC && 'search-result-loading-h5']">
    <Loading width="40px" height="40px" />
  </div>
</template>
<script setup lang="ts">
import Loading from "../../../common/Loading/index.vue";
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import { ref } from "../../../../adapter-vue";
const isPC = ref<boolean>(TUIGlobal.getPlatform() === "pc");
</script>
<style scoped lang="scss">
.search-result-loading {
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  &-h5 {
    background-color: #f4f4f4;
  }
}
</style>
