<template>
  <div
    v-if="timestampShowFlag"
    class="message-timestamp"
  >
    {{ timestampShowContent }}
  </div>
</template>
<script setup lang="ts">
import { toRefs, ref, watch } from '../../../../adapter-vue';
import { calculateTimestamp } from '../../utils/utils';

const props = defineProps({
  currTime: {
    type: Number,
    default: 0,
  },
  prevTime: {
    type: Number,
    default: 0,
  },
});
const { currTime, prevTime } = toRefs(props);
const timestampShowFlag = ref(false);
const timestampShowContent = ref('');

const handleItemTime = (currTime: number, prevTime: number) => {
  timestampShowFlag.value = false;
  if (currTime <= 0) {
    return '';
  } else if (!prevTime || prevTime <= 0) {
    timestampShowFlag.value = true;
    return calculateTimestamp(currTime * 1000);
  } else {
    const minDiffToShow = 10 * 60; // 10min 10*60s
    const diff = currTime - prevTime; // s
    if (diff >= minDiffToShow) {
      timestampShowFlag.value = true;
      return calculateTimestamp(currTime * 1000);
    }
  }
  return '';
};

watch(
  () => [currTime.value, prevTime.value],
  (newVal: any, oldVal: any) => {
    if (newVal?.toString() === oldVal?.toString()) {
      return;
    } else {
      timestampShowContent.value = handleItemTime(
        currTime.value,
        prevTime.value,
      );
    }
  },
  {
    immediate: true,
  },
);
</script>
<style lang="scss" scoped>
@import "../../../../assets/styles/common";

.message-timestamp {
  margin: 10px auto;
  color: #999;
  font-size: 12px;
  overflow-wrap: anywhere;
  display: flex;
  align-items: center;
  text-align: center;
}
</style>
