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
      {{ transformTextWithKeysToEmojiNames(contentItem.text) }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { ref, withDefaults } from '../../../../../adapter-vue';
import { transformTextWithKeysToEmojiNames } from '../../../../TUIChat/emoji-config';
import { IHighlightContent } from '../../../type';

interface IProps {
  content: IHighlightContent[];
  highlightType: 'font' | 'background';
  displayType: 'info' | 'bubble';
}
const props = withDefaults(defineProps<IProps>(), {
  content: () => ([]) as IHighlightContent[],
  highlightType: 'font',
  displayType: 'info',
});

const contentText = ref<Array<{ text: string; isHighlight: boolean }>>(props.content);
</script>
<style scoped lang="scss">
@import "../../../../../assets/styles/common";

.message-abstract-text {
  justify-content: flex-start;

  &-font {
    color: #999;

    .highlight {
      color: #007aff;
    }

    .normal {
      color: #999;
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
