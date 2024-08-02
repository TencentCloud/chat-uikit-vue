<template>
  <div
    v-if="isCallMessage && conversationType === TYPES.CONV_C2C"
    class="call"
    :class="['call-' + conversationType, message.flow === 'out' && 'call-reverse']"
    @click="callAgain"
  >
    <div :class="['icon', message.flow === 'out' && callInfo.type === 2 && 'icon-reverse']">
      <Icon :file="callInfo.icon" />
    </div>
    <span class="call-content">{{ custom }}</span>
  </div>
</template>
<script setup lang="ts">
import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import TUIChatEngine from '@tencentcloud/chat-uikit-engine';
import { computed, ref } from '../../../adapter-vue';
import { JSONToObject } from '../../../utils/index';
import Icon from '../../../components/common/Icon.vue';
import callVideoSVG from '../../../assets/icon/call-video.svg';
import callVoiceSVG from '../../../assets/icon/call-voice.svg';
import OfflinePushInfoManager, { PUSH_SCENE } from '../../../components/TUIChat/offlinePushInfoManager/index';
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
const callInfo = computed((): { type: number; icon: string } => {
  const callType = JSONToObject(props.signalingInfo?.data)?.call_type;
  switch (callType) {
    case 1:
      return {
        type: 1,
        icon: callVoiceSVG,
      };
    case 2:
      return {
        type: 2,
        icon: callVideoSVG,
      };
    default:
      break;
  }
  return {
    type: 0,
    icon: '',
  };
});
const conversationType = computed(() => props.message?.conversationType);
const custom = computed(() => props.customContent?.custom);

const callAgain = () => {
  if (conversationType.value === TUIChatEngine.TYPES.CONV_C2C) {
    const userID = props.message?.flow === 'out' ? props.message?.to : props.message?.from;
    TUICore.callService({
      serviceName: TUIConstants.TUICalling.SERVICE.NAME,
      method: TUIConstants.TUICalling.SERVICE.METHOD.START_CALL,
      params: {
        userIDList: [userID],
        type: callInfo?.value?.type,
        callParams: {
          offlinePushInfo: OfflinePushInfoManager.getOfflinePushInfo(PUSH_SCENE.CALL),
        },
      },
    });
  }
};
</script>
<style scoped lang="scss">
.call {
  display: flex;
  flex-direction: row;
  align-items: center;

  &-C2C {
    cursor: pointer;
  }

  &-GROUP {
    cursor: default;
  }

  &-content {
    padding-left: 5px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }

  &-reverse {
    flex-direction: row-reverse;

    .icon-reverse {
      transform: rotate(180deg);
    }

    .call-content {
      padding-right: 5px;
      padding-left: 0;
    }
  }
}
</style>
