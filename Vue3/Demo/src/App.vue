<template>
  <div id="app">
    <router-view
      :key="locale"
      :language="locale"
      @changeLanguage="changeLanguage"
    />
    <!-- <ConferenceMainView displayMode="wake-up" /> -->
  </div>
</template>
<script setup lang="ts">
import { ref } from './TUIKit/adapter-vue';
import { RouterView, useRouter } from 'vue-router';
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
// import ConferenceMainView from '@tencentcloud/roomkit-web-vue3';
const router = useRouter();
const locale = ref<string>('zh');
TUIStore.watch(StoreName.USER, {
  kickedOut: (value: string) => {
    if (value && router.currentRoute.value.name !== 'login') {
      localStorage.removeItem('TUIKit-userInfo');
      router.replace({ name: 'login' });
    }
  },
});
function changeLanguage(language: string) {
  locale.value = language;
}
</script>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
