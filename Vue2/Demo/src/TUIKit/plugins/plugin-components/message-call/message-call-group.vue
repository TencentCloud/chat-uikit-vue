<template>
  <div
    v-if="isCallMessage && conversationType === TYPES.CONV_GROUP"
    :class="{ 'blink-text': isBlink }"
  >
    {{ custom }}
  </div>
</template>

<script setup lang="ts">
import { computed } from '../../../adapter-vue';
import TUIChatEngine, { IMessageModel } from '@tencentcloud/chat-uikit-engine';

interface IProps {
  message: IMessageModel;
  signalingInfo: any;
  customContent: any;
  blinkMessageIDList?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({}) as IMessageModel,
  signalingInfo: () => ({}),
  customContent: () => ({}),
  blinkMessageIDList: () => [],
});

const TYPES = TUIChatEngine.TYPES;
const isCallMessage = computed(() => !!props.signalingInfo);
const conversationType = computed(() => props.message?.conversationType);
const custom = computed(() => props.customContent?.custom);

const isBlink = computed(() => {
  if (props.message?.ID) {
    return props.blinkMessageIDList?.includes(props.message.ID);
  }
  return false;
});
</script>

<style scoped lang="scss">
@keyframes blink-text {
  50% {
    color: #ff9c19;
  }
}

.blink-text {
  animation: blinkText 1s linear 3;
}
</style>
