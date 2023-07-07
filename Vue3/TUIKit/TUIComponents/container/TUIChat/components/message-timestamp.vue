<template>
  <div class="message-timestamp" v-show="timestampShowFlag">
    {{ timestampShowContent }}
  </div>
</template>
<script setup lang="ts">
import { defineProps, toRefs, ref, watch } from 'vue';
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
const { t } = (window as any)?.TUIKitTUICore?.config?.i18n?.useI18n();
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
    const minDiffToShow = 10 * 60; //10min 10*60s
    const diff = currTime - prevTime; //s
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
      timestampShowContent.value = handleItemTime(currTime.value, prevTime.value);
    }
  },
  {
    immediate: true,
  }
);

// 计算时间戳函数
// calculate timestamp
function calculateTimestamp(timestamp: number): string {
  const todayZero = new Date().setHours(0, 0, 0, 0);
  const thisYear = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
  const target = new Date(timestamp);

  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneYear = 365 * oneDay;

  const diff = todayZero - target.getTime();

  function formatNum(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  if (diff <= 0) {
    // today, only display hour:minute
    return `${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
  } else if (diff <= oneDay) {
    // yesterday, display yesterday:hour:minute
    return `${t('time.昨天')} ${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
  } else if (diff <= oneWeek - oneDay) {
    // Within a week, display weekday hour:minute
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[target.getDay()];
    return `${t('time.' + weekday)} ${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
  } else if (target.getTime() >= thisYear) {
    // Over a week, within this year, display mouth/day hour:minute
    return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(target.getHours())}:${formatNum(
      target.getMinutes()
    )}`;
  } else {
    // Not within this year, display year/mouth/day hour:minute
    return `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()} ${formatNum(
      target.getHours()
    )}:${formatNum(target.getMinutes())}`;
  }
}
</script>
<style lang="scss" scoped>
@import url('../../../styles/common.scss');
@import url('../../../styles/icon.scss');
.message-timestamp {
  margin: 0 auto;
  color: #999999;
  font-size: 12px;
  width: -webkit-fill-available;
  overflow-wrap: anywhere;
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px 30px;
}
</style>
