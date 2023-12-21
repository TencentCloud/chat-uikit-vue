<template>
  <div id="app" class="container">
    <router-view :key="locale" :language="locale" @changeLanguage="changeLanguage" />
  </div>
</template>
<script lang="ts" setup>
import { ref } from "./TUIKit/adapter-vue";
import { TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import router from "./router/index";
let locale = ref<string>("zh");
TUIStore.watch(StoreName.USER, {
  kickedOut: (value: string) => {
    if (value && router.currentRoute.name !== "login") {
      localStorage.removeItem("TUIKit-userInfo");
      router.replace({ name: "login" });
    }
  },
});
function changeLanguage(language: string) {
  locale.value = language;
}
</script>
<!-- 动态引入验证码JS示例 -->
<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
