<template>
  <div
    :class="[
      'message-abstract-text',
      `message-abstract-text-${highlightType}`,
      `message-abstract-text-${displayType}`,
    ]"
  >
    <span
      v-for="(contentItem, index) in contentText"
      :key="index"
      :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']"
    >
      {{ contentItem.text }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { ref } from "../../../../../adapter-vue";
const props = defineProps({
  content: {
    type: Array,
    default: [],
  },
  highlightType: {
    type: String,
    default: "font", // "font":字体高亮 "background":背景高亮
  },
  displayType: {
    type: String,
    default: "info", // "info":信息展示形式 "bubble": 气泡展示形式
  },
});
const contentText = ref<Array<{ text: string; isHighlight: boolean }>>(props.content);
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common.scss";
.message-abstract-text {
  justify-content: flex-start;
  &-font {
    color: #999999;
    .highlight {
      color: #007aff;
    }
    .normal {
      color: #999999;
    }
  }
  &-background {
    color: #1f2329;
    .highlight {
      background-color: #007aff33;
    }
    .normal {
      font-size: 14px;
    }
  }
  &-info {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    .highlight {
      font-size: 12px;
    }
    .normal {
      font-size: 12px;
    }
  }
  &-bubble {
    font-size: 14px;
    .highlight {
      font-size: 14px;
    }
    .normal {
      font-size: 14px;
    }
  }
}
</style>
