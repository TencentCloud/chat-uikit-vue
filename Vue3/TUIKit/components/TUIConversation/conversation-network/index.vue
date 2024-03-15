<template>
  <div
    v-if="isNotNetwork"
    class="network"
  >
    <i class="icon icon-error">!</i>
    <p class="network-content">
      {{
        TUITranslateService.t("TUIConversation.网络异常，请您检查网络设置")
      }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import {
  ref,
} from '../../../adapter-vue';

const isNotNetwork = ref(false);

TUIStore.watch(StoreName.USER, {
  netStateChange: (value: string) => {
    isNotNetwork.value = (value === TUIChatEngine.TYPES.NET_STATE_DISCONNECTED);
  },
});
</script>

<style lang="scss" scoped src="../style/index.scss"></style>
