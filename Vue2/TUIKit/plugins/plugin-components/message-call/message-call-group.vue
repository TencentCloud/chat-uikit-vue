<template>
  <div
    v-if="isCallMessage && conversationType === TYPES.CONV_GROUP"
  >
    {{ custom }}
  </div>
</template>
<script setup lang="ts">
import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
import { computed, ref } from "../../../adapter-vue";
const props = defineProps({
  message: {
    type: Object,
    default: () => ({}),
  },
  signalingInfo: {
    type: Object,
    default: () => ({}),
  },
  customContent: {
    type: Object,
    default: () => ({}),
  },
});
const TYPES = ref(TUIChatEngine.TYPES);
const isCallMessage = computed(() => props.signalingInfo != null);
const conversationType = computed(() => props.message?.conversationType);
const custom = computed(() => props.customContent?.custom);
</script>
<style scoped lang="scss"></style>
