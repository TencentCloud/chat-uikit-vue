<template>
  <div :class="['message-input-button', !isPC && 'message-input-button-h5']">
    <button
      v-if="props.enableSend"
      :class="['message-input-button-cont', props.className]"
      data-type="text"
      :disabled="false"
      @click="sendMessage"
    >
      <p
        v-if="displayHover"
        class="message-input-button-hover"
      >
        {{ props.hoverText }}
      </p>
      <slot v-if="$slots.default"></slot>
      <div v-else class="default-content">
        {{ TUITranslateService.t("发送") }}
      </div>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from '../../../adapter-vue';
import { TUITranslateService } from '@tencentcloud/chat-uikit-engine-lite';
import { TUIConstants } from '@tencentcloud/tui-core-lite';
import { isPC } from '../../../utils/env';
import TUIChatConfig from '../config';

const props = defineProps({
  enableSend: {
    type: Boolean,
    default: true,
  },
  className: {
    type: String,
    default: '',
  },
  hoverText: {
    type: String,
    default: TUITranslateService.t("TUIChat.按Enter发送，Ctrl+Enter换行"),
  },
});

const displayHover = ref(TUIChatConfig.getChatType() !== TUIConstants.TUIChat.TYPE.ROOM);

const emits = defineEmits(['sendMessage']);

const sendMessage = () => {
  emits('sendMessage');
};
</script>
<style scoped lang="scss">
@import "../../../assets/styles/common";

.message-input-button {
  position: absolute;
  bottom: 20px;
  right: 20px;

  &-h5 {
    position: static;
  }

  &-cont {
    padding: 8px 20px;
    border-radius: 4px;
    border: none;
    font-size: 14px;
    text-align: center;
    line-height: 20px;
    font-weight: 400;
    background: #006eff;
    color: #fff;
    letter-spacing: 0;
    cursor: pointer;
  }

  &-hover {
    display: none;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 120%;
    word-break: keep-all;
    height: 30px;
    white-space: nowrap;
    top: 0;
    bottom: 0;
    margin: auto 0;
    padding: 5px 10px;
    border-radius: 3px;
    background: #000;
    color: #fff;
    opacity: 0.3;

    &::before {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      right: -20px;
      border: 10px solid transparent;
      border-left: 10px solid #000;
    }
  }

  &:hover {
    .message-input-button-hover {
      display: flex;
    }
  }
}
</style>
