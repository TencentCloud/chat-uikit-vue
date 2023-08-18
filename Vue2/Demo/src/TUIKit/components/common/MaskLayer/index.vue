<template>
  <div class="mask" @click.self="!isWeChat && toggleView" v-if="showMask">
    <slot />
  </div>
</template>
  
<script lang="ts" setup>
import { ref, watchEffect } from "../../../adapter-vue";
import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";

const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");

const props = defineProps({
  show: {
    type: Boolean,
    default: () => false,
  }
});

const showMask = ref(false);

watchEffect(() => {
  showMask.value = props.show;
});

const emit = defineEmits(['update:show']);

const toggleView = () => {
  showMask.value = !showMask.value;
  emit('update:show', showMask.value);
}

</script>
  
<style lang="scss" scoped>
@import url('../../../assets/styles/common.scss');

.mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 99;
  background: rgba(#000000, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;

  main {
    position: relative;
  }
}
</style>
  