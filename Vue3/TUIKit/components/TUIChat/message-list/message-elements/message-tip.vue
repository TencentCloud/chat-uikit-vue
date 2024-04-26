<template>
  <div class="message-tip">
    <span>{{ tipContent }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from '../../../../adapter-vue';
const props = defineProps({
  content: {
    type: Object,
    default: () => ({}),
  },
});
const tipContent = computed(() => props.content?.text || props.content?.custom || '');
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common";

.message-tip {
  margin: 0 auto;
  padding: 0 20px;
  color: #999;
  font-size: 12px;
  overflow-wrap: anywhere;
  display: flex;
  place-content: center center;
  align-items: center;
  text-align: center;
  margin-bottom: 10px;

  &-highlight {
    animation: highlight 1000ms infinite;

    @keyframes highlight {
      50% {
        color: #ff9c19;
      }
    }

    @keyframes highlight {
      50% {
        color: #ff9c19;
      }
    }
  }
}
</style>
