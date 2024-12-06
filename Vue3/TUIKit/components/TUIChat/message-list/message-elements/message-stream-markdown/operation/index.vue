<template>
  <div
    ref="operationContainerRef"
    class="message-stream_operation_container"
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
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from '../../../../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import Icon from '../../../../../common/Icon.vue';
import copySVG from '../../../../../../assets/icon/msg-copy.svg';
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
  operations: () => [IOperationType.Copy],
});
const emits = defineEmits<IEmits>();

const defaultOperationConfig: Record<string, IOperation> = {
  [IOperationType.Copy]: {
    key: IOperationType.Copy,
    name: TUITranslateService.t('TUIChat.复制'),
    icon: copySVG,
    isDisabled: false,
    onClick: () => {
      CopyManager.copyTextOrHtml(props.content, 'text');
    },
  },
};

const operationConfig = computed(() => {
  return props.operations
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
});
</script>
<style lang="scss" scoped>
  .message-stream_operation_container {
    display: flex;
    flex-direction: row;
    align-self: flex-end;
    padding: 5px;
    border-radius: 3px;
    margin: 3px;

    .message-stream_operation_list {
      display: flex;
      flex-direction: row;

      .message-stream_operation_item {
        display: flex;
      }

      .message-stream_operation_item_disabled {
        * {
          cursor: not-allowed;
        }
      }
    }
  }
</style>
