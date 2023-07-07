<template>
  <div class="tui-contact">
    <TUISearch v-if="isUniFrameWork" :isRelation="true" @handleSwitchConversation="handleSwitchConversation"/>
    <div class="contact-default" v-if="isPC">
      <slot></slot>
    </div>
    <div class="contact-default" v-else>
      <h1 class="inner-content">【敬请期待】</h1>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
import TUISearch from "../TUISearch/index.vue";
import { ref } from "../../adapter-vue";
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== 'undefined');

const handleSwitchConversation = () => {
  if (isUniFrameWork.value)
    uni.navigateTo({
    url: '/TUIKit/components/TUIChat/index',
  });
};
</script>
<style scoped>
.tui-contact {
  height: 100vh;
  width: 100vw;
}

.inner-content {
  text-align: center;
}

</style>