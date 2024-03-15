<template>
  <div :class="['message-abstract-file', `message-abstract-file-${displayType}`]">
    <div :class="['message-abstract-file-left']">
      <img
        :class="['message-abstract-file-left-icon']"
        :src="typeIcon.iconSrc"
      >
    </div>
    <div :class="['message-abstract-file-main']">
      <div :class="['message-abstract-file-main-name']">
        <span
          v-for="(contentItem, index) in contentText"
          :key="index"
          :class="[(contentItem && contentItem.isHighlight) ? 'highlight' : 'normal']"
        >
          {{ contentItem.text }}
        </span>
      </div>
      <div :class="['message-abstract-file-main-size']">
        {{ fileSize }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults } from '../../../../../adapter-vue';
import { IHighlightContent } from '../../../type';
interface IProps {
  contentText: Array<IHighlightContent>;
  messageContent: Record<string, unknown> | undefined;
  displayType: 'bubble' | 'info';
}
const props = withDefaults(defineProps<IProps>(), {
  contentText: () => ([]) as Array<IHighlightContent>,
  messageContent: () => ({}) as Record<string, unknown>,
  displayType: 'bubble',
});

const contentText = ref<Array<{ text: string; isHighlight: boolean }>>(props.contentText);
const typeIcon = computed(() => {
  const fileUrl = props?.messageContent?.url as string;
  const index = fileUrl?.lastIndexOf('.');
  const type = fileUrl?.substring(index + 1);
  return handleFileIconForShow(type);
});
const fileSize = computed(() => props?.messageContent?.size);
const handleFileIconForShow = (type: string) => {
  const urlBase = 'https://web.sdk.qcloud.com/component/TUIKit/assets/file-';
  const fileTypes = [
    'image',
    'pdf',
    'text',
    'ppt',
    'presentation',
    'sheet',
    'zip',
    'word',
    'video',
    'unknown',
  ];
  let url = '';
  let iconType = '';
  fileTypes?.forEach((typeName: string) => {
    if (type?.includes(typeName)) {
      url = urlBase + typeName + '.svg';
      iconType = typeName;
    }
  });
  return {
    iconSrc: url ? url : urlBase + 'unknown.svg',
    iconType: iconType ? iconType : 'unknown',
  };
};
</script>

<style scoped lang="scss">
@import "../../../../../assets/styles/common";

.message-abstract-file {
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  &-left {
    width: 42px;
    height: 32px;

    &-icon {
      width: 32px;
      height: 32px;
      margin-right: 10px;
      border-radius: 5px;
    }
  }

  &-main {
    flex: 1;
    overflow: hidden;

    &-name {
      width: 100%;
      color: #000;
      font-size: 14px;
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      .highlight {
        background-color: #007aff33;
      }

      .normal {
        color: #000;
      }
    }

    &-size {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #888;
      font-size: 12px;
    }
  }

  &-bubble {
    background-color: #f1f1f1;

    .message-abstract-file-main {
      .message-abstract-file-main-name {
        color: #1f2329;

        .normal {
          color: #1f2329;
        }
      }
    }
  }

  &-file {
    margin: 8px 10px 5px;
    padding: 10px;
    background-color: #f1f1f1;
    height: 51px;
  }
}
</style>
