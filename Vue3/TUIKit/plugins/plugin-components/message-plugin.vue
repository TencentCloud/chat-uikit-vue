<template>
  <MessagePluginLayout
    :message="props.message"
    :showStyle="pluginMessageType.showStyle"
    :bubbleClassNameList="[pluginMessageType.pluginType === 'room' ? 'message-bubble-room':'']"
    @resendMessage="resendMessage"
    @handleToggleMessageItem="handleToggleMessageItem"
    @handleH5LongPress="handleH5LongPress"
  >
    <template #messageTip>
      <MessageCallGroup
        :message="props.message"
        :signalingInfo="messageSignalingInfo"
        :customContent="messageCustomContent"
        :blinkMessageIDList="props.blinkMessageIDList"
      />
    </template>
    <template #messageBubble>
      <MessageCallC2C
        v-if="pluginMessageType.pluginType === 'call'"
        :message="props.message"
        :signalingInfo="messageSignalingInfo"
        :customContent="messageCustomContent"
      />
      <MessageCustomerService
        v-if="pluginMessageType.pluginType === 'customer'"
        :message="props.message"
      />
      <MessageRoom
        v-if="pluginMessageType.pluginType === 'room'"
        :message="props.message"
      />
    </template>
  </MessagePluginLayout>
</template>

<script lang="ts" setup>
import { computed } from '../../adapter-vue';
import { TUIStore } from '@tencentcloud/chat-uikit-engine';
import TUIChatEngine, { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import {
  isCustomerServicePluginMessage,
  isCustomServiceMessageInvisible,
} from './message-customer/index';
import { isCallMessage, isRoomCardMessage } from './index';
import MessagePluginLayout from './message-plugin-layout.vue';
import MessageCallGroup from './message-call/message-call-group.vue';
import MessageCallC2C from './message-call/message-call-c2c.vue';
import MessageCustomerService from './message-customer/message-customer-service.vue';
// If TUIRoom is not integrated, please introduce the following path
import MessageRoom from './message-room/message-room-default.vue';
// After integrating TUIRoom, please comment the above path and open the following path to import
// import MessageRoom from './message-room/message-room.vue';

interface IProps {
  message: IMessageModel;
  blinkMessageIDList?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  message: () => ({} as IMessageModel),
  blinkMessageIDList: () => [] as string[],
});

const emits = defineEmits(['resendMessage', 'handleToggleMessageItem', 'handleH5LongPress']);
const messageModel = computed(() => TUIStore.getMessageModel(props.message.ID));
const messageSignalingInfo = computed(() => messageModel?.value?.getSignalingInfo());
const messageCustomContent = computed(() => messageModel?.value?.getMessageContent());

const pluginMessageType = computed<{ pluginType: string; showStyle: string }>(() => {
  let typeObj = { pluginType: '', showStyle: '' };
  if (isCallMessage(messageModel.value)) {
    typeObj = {
      pluginType: 'call',
      showStyle:
        messageModel.value?.conversationType === TUIChatEngine.TYPES.CONV_GROUP ? 'tip' : 'bubble',
    };
  } else if (isRoomCardMessage(messageModel.value)) {
    typeObj = {
      pluginType: 'room',
      showStyle: 'bubble',
    };
  } else if (isCustomerServicePluginMessage(messageModel.value)) {
    typeObj = {
      pluginType: 'customer',
      showStyle: isCustomServiceMessageInvisible(messageModel.value) ? '' : 'bubble',
    };
  }
  return typeObj;
});

// The following are for external interaction such as messageTool, no special processing is required, please do not touch
const resendMessage = (message: IMessageModel) => {
  emits('resendMessage', message);
};
const handleToggleMessageItem = (e: any, message: IMessageModel, isLongpress = false) => {
  emits('handleToggleMessageItem', e, message, isLongpress);
};
const handleH5LongPress = (e: any, message: IMessageModel, type: string) => {
  emits('handleH5LongPress', e, message, type);
};
</script>

<style lang="scss" scoped>
/* stylelint-disable-next-line no-empty-source */
</style>
