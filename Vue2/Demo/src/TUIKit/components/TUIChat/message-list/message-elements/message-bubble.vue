 
<template>
  <div class="message-bubble">
    <!-- todo 统一组件处理-->
    <div class="message-bubble-main-content" :class="[message.flow === 'in' ? '' : 'reverse']">
      <img
        class="message-avatar"
        :src="message.avatar || defaultAvatarUrl"
        onerror="this.src=defaultAvatarUrl"
      />
      <main class="message-body">
        <div
          v-if="message.flow === 'in' && message.conversationType === 'GROUP'"
          class="message-body-nickName"
        >
          {{ props.content.showName }}
        </div>
        <div
          :class="[
            'blink',
            'message-body-content',
            message.flow === 'out' ? 'content-out' : 'content-in',
            isNoPadding ? 'content-noPadding' : '',
            isNoPadding && isBlink ? 'blink-shadow' : '',
            !isNoPadding && isBlink ? 'blink-content' : '',
          ]"
        >
          <slot></slot>
        </div>
      </main>
      <!-- 发送失败 -->
      <div
        v-if="message.status === 'fail'"
        class="message-label fail"
        @click="resendMessage()"
      >
      !
      </div>
      <!-- 加载图标 -->
      <Icon
        v-if="message.status === 'unSend' && needLoadingIconMessageType.includes(message.type)"
        class="message-label loadingCircle"
        :file="loadingIcon"
        :width="'15px'"
        :height="'15px'"
      ></Icon>
      <!-- 已读 & 未读 -->
      <div
        v-if="
          message.conversationType === 'C2C' &&
          message.flow === 'out' &&
          message.status === 'success'
        "
        class="message-label"
        :class="[!message.isPeerRead && 'unRead']"
      >
        <span v-if="!message.isPeerRead">未读</span>
        <span v-else>已读</span>
      </div>
    </div>
    <!-- 消息附加区域 -->
    <div
      class="message-bubble-extra-content"
      :class="message.flow === 'in' || 'reverse'"
    >
      <!-- 消息引用 -->
      <MessageQuote
        :message="message"
        @blinkMessage="blinkMessage"
        @scrollTo="scrollTo"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "../../../../adapter-vue";
import TUIChatEngine, {
  IMessageModel,
} from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import MessageQuote from "./message-quote/index.vue";
import loadingIcon from "../../../../assets/icon/loading.png";

interface IProps {
  messageItem: IMessageModel;
  content?: any;
  blinkMessageIDList?: string[];
}

interface IEmits {
  (e: 'resendMessage'): void;
  (e: 'blinkMessage', messageID: string): void;
  // 下面的方法是 uniapp 专属
  (e: 'scrollTo', scrollHeight: number): void;
}

const emits = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  messageItem: () => ({} as IMessageModel),
  content: () => ({}),
  blinkMessageIDList: () => [],
});

const TYPES = TUIChatEngine.TYPES;
const defaultAvatarUrl = 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png';
const needLoadingIconMessageType = [
  TYPES.MSG_LOCATION,
  TYPES.MSG_TEXT,
  TYPES.MSG_CUSTOM,
  TYPES.MSG_MERGER,
  TYPES.MSG_FACE
];

const {
  blinkMessageIDList,
  messageItem: message
} = toRefs(props);


const isNoPadding = computed(() => {
  return [TYPES.MSG_IMAGE, TYPES.MSG_VIDEO].includes(message.value.type);
});

const isBlink = computed(() => {
  if (message.value?.ID) {
    return blinkMessageIDList?.value?.includes(message.value.ID);
  }
  return false;
});

function resendMessage() {
  emits("resendMessage");
}

function blinkMessage(messageID: string) {
  emits('blinkMessage', messageID);
}

function scrollTo(scrollHeight: number) {
  emits('scrollTo', scrollHeight);
}
</script>

<style lang="scss" scoped>
.reverse {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-start;
}
.message-bubble {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 5px;

  .message-bubble-main-content {
    display: flex;

    .message-avatar {
      display: block;
      width: 36px;
      height: 36px;
      border-radius: 5px;
      flex: 0 0 auto;
    }

    .message-body {
      display: flex;
      flex: 0 1 auto;
      flex-direction: column;
      align-items: flex-start;
      margin: 0 8px;
      max-width: calc(100% - 54px);

      .message-body-nickName {
        margin-bottom: 4px;
        font-size: 10px;
        color: #999;
      }

      .message-body-content {
        padding: 12px;
        font-size: 14px;
        color: #000;
        letter-spacing: 0;
        word-wrap: break-word;
        word-break: break-all;
        position: relative;
        overflow: hidden;
      }
      .content-in {
        background: #fbfbfb;
        border-radius: 0px 10px 10px 10px;
      }

      .content-out {
        background: #dceafd;
        border-radius: 10px 0px 10px 10px;
      }

      .content-noPadding {
        padding: 0px;
        background: transparent;
        border-radius: 10px;
        overflow: hidden;
      }
      .blink-shadow {
        @keyframes shadowBlink {
          50% {
            box-shadow: rgba(255, 156, 25, 1) 0px 0px 10px 0px;
          }
        }
        box-shadow: rgba(255, 156, 25, 0) 0px 0px 10px 0px;
        animation: shadowBlink 1s linear 3;
      }

      .blink-content {
        @keyframes referenceBlink {
          50% {
            background-color: #ff9c19;
          }
        }
        animation: referenceBlink 1s linear 3;
      }
    }

    .message-label {
      align-self: flex-end;
      font-family: PingFangSC-Regular;
      font-size: 12px;
      color: #b6b8ba;
      word-break: keep-all;
      flex: 0 0 auto;

      &.fail {
        width: 15px;
        height: 15px;
        border-radius: 15px;
        background: red;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &.loadingCircle {
        opacity: 0;
        animation: circleLoading 2s linear 1s infinite;
      }

      &.unRead {
        color: #679ce1;
      }

      @keyframes circleLoading {
        0% {
          transform: rotate(0);
          opacity: 1;
        }

        100% {
          opacity: 1;
          transform: rotate(360deg);
        }
      }
    }
  }

  .message-bubble-extra-content {
    display: flex;
  }
}
</style>
