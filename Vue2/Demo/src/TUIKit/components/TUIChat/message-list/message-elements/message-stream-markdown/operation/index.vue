<template>
  <div
    ref="operationContainerRef"
    class="message-stream_operation_container"
    v-if="operationConfig.length > 0"
  >
    <div class="message-stream_operation_list">
      <div
        v-for="(operation, key) in operationConfig"
        :key="key"
        :class="{
          'message-stream_operation_item': true,
          'message-stream_operation_item_disabled': operation.isDisabled,
        }"
        :title="operation.name"
        @click="(e) => operation.onClick(e, operation.key)"
      >
        <Icon
          class="message-stream_operation_icon"
          :file="operation.icon"
          :name="operation.name"
          size="14px"
        />
        <label v-if="operation.text">{{ operation.text }}</label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from '../../../../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine-lite';
import Icon from '../../../../../common/Icon.vue';
import copySVG from '../../../../../../assets/icon/msg-copy.svg';
import breakSVG from '../../../../../../assets/icon/break.svg';
import CopyManager from '../../../../utils/copy';
import { IOperationType, IOperation } from './type';

interface IProps {
  // handle the order and display of operations
  operations?: IOperationType[];
  // the content of the message to show, used to copy
  content?: string;
}

interface IEmits {
  // callback when operation is clicked
  (emitKey: 'onOperationClick', e: Event, key: IOperationType): void;
}

const props = withDefaults(defineProps<IProps>(), {
  operations: () => [],
});
const emits = defineEmits<IEmits>();

const defaultOperationConfig: Record<string, IOperation> = {
  [IOperationType.Copy]: {
    key: IOperationType.Copy,
    name: TUITranslateService.t('TUIChat.复制'),
    icon: copySVG,
    isDisabled: false,
    onClick: () => {
      CopyManager.copyTextOrHtml(props.content || '', 'text');
    },
  },
  [IOperationType.Break]: {
    key: IOperationType.Break,
    name: TUITranslateService.t('TUIChat.点击打断'),
    text: TUITranslateService.t('TUIChat.点击打断'),
    icon: breakSVG,
    isDisabled: false,
    onClick: (e) => {
      emits('onOperationClick', e, IOperationType.Break)
    },
  },
};

const operationConfig = computed(() => {
  const currentConfig = props.operations
    .map((key: IOperationType) => {
      const config = defaultOperationConfig?.[key];
      if (!config) {
        return;
      }
      return {
        ...config,
        onClick: (e: Event, key: IOperationType) => {
          if (config.isDisabled) {
            return;
          }
          config.onClick(e, key);
          emits('onOperationClick', e, key);
        },
      };
    })
    .filter(Boolean) as IOperation[];
  return currentConfig;
});
</script>
<style lang="scss" scoped>
  .message-stream_operation_container {
    display: flex;

    .message-stream_operation_list {
      display: flex;

      .message-stream_operation_item {
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: 4px;
        border: 1px solid #E6E9EF;
        padding: 4px 8px;
        font-family: PingFang SC;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        color: #0000008C;
        * {
          cursor: pointer;
        }
      }
    }
  }
</style>
