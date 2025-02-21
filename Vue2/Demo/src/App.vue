<template>
  <div
    id="app"
    class="container"
  >
    <UIKitProvider theme="light">
      <router-view
        :key="locale"
        :language="locale"
        @changeLanguage="changeLanguage"
      />
    </UIKitProvider>
  </div>
</template>
<script lang="ts" setup>
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import { UIKitProvider } from '@tencentcloud/uikit-base-component-vue2';
import router from './router/index';
import { ref } from './TUIKit/adapter-vue';

const locale = ref<string>('zh');
TUIStore.watch(StoreName.USER, {
  kickedOut: (value: string) => {
    if (value && router.currentRoute.name !== 'login') {
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
