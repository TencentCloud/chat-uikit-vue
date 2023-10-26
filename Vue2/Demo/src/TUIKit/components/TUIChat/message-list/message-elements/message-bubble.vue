 
<template>
  <div
    class="message-bubble"
    :class="[message.flow === 'in' ? '' : 'reverse']"
    ref="htmlRefHook"
  >
    <!-- todo 统一组件处理-->
    <img
      class="avatar"
      :src="
        message.avatar ||
        'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
      "
      onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
    />
    <main class="message-area">
      <label
        class="name"
        v-if="message.flow === 'in' && message.conversationType === 'GROUP'"
      >
        {{ messageShowName }}
      </label>
      <div
        :class="[
          'content',
          `content-${message.flow}`,
          isNoPadding ? 'content-noPadding' : ''
        ]"
      >
        <slot />
      </div>
    </main>
    <label
      class="message-label fail"
      v-if="message.status === 'fail'"
      @click="resendMessage()"
      >!</label
    >
    <Icon
      :file="loading"
      class="message-label loadingCircle"
      :width="'15px'"
      :height="'15px'"
      v-if="message.status === 'unSend' && needLoadingIconMessageType.includes(message.type)"
    ></Icon>
    <label
      class="message-label"
      :class="[!message.isPeerRead && 'unRead']"
      v-if="
        message.conversationType === 'C2C' &&
        message.flow == 'out' &&
        message.status === 'success'
      "
    >
      <span v-if="!message.isPeerRead">未读</span>
      <span v-else>已读</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { watchEffect, ref, computed } from "../../../../adapter-vue";
import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
import Icon from "../../../common/Icon.vue";
import loading from "../../../../assets/icon/loading.png";
const emits = defineEmits(["resendMessage"]);
const props = defineProps({
  messageItem: {
    type: Object,
    default: () => ({}),
  },
  content: {
    type: Object,
    default: () => ({}),
  },
});
const needLoadingIconMessageType = [
  TUIChatEngine.TYPES.MSG_LOCATION,
  TUIChatEngine.TYPES.MSG_TEXT,
  // TUIChatEngine.TYPES.MSG_IMAGE,
  // TUIChatEngine.TYPES.MSG_SOUND,
  // TUIChatEngine.TYPES.MSG_AUDIO,
  // TUIChatEngine.TYPES.MSG_VIDEO,
  // TUIChatEngine.TYPES.MSG_FILE,
  TUIChatEngine.TYPES.MSG_CUSTOM,
  TUIChatEngine.TYPES.MSG_MERGER,
  TUIChatEngine.TYPES.MSG_FACE,
];
const message = ref();
const messageShowName = ref("");
const TYPES = ref(TUIChatEngine.TYPES);

watchEffect(() => {
  message.value = props.messageItem;
  messageShowName.value = props?.content?.showName;
});

const resendMessage = () => {
  emits("resendMessage");
};

const isNoPadding = computed(() => {
  return [TYPES.value.MSG_IMAGE, TYPES.value.MSG_VIDEO].includes(props.messageItem.type);
});
</script>

<style lang="scss" scoped>
.reverse {
  flex-direction: row-reverse;
  justify-content: flex-start;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 5px;
}
.message-bubble {
  width: 100%;
  display: flex;
  padding-bottom: 5px;
}
.line-left {
  border: 1px solid rgba(0, 110, 255, 0.5);
}
.message-reference-area {
  display: flex;
  background: #f2f2f2;
  border-radius: 0.5rem;
  border-radius: 0.63rem;
  align-self: start;
  margin-left: 44px;
  margin-right: 8px;
  &-show {
    width: 100%;
    display: flex;
    flex-direction: inherit;
    justify-content: center;
    padding: 6px;
    p {
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 0.88rem;
      color: #999999;
      letter-spacing: 0;
      word-break: keep-all;
      padding-right: 5px;
    }
    span {
      height: 1.25rem;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 0.88rem;
      color: #999999;
      letter-spacing: 0;
      display: inline-block;
    }
  }
}
.message-replies {
  display: flex;
  align-self: start;
  margin-left: 44px;
  margin-right: 8px;
  padding: 2px;
  color: #999999;
  font-size: 10px;
  i {
    margin: 4px;
  }
  span {
    line-height: 20px;
  }
}
.message-reference-area-reverse,
.message-replies-reverse {
  align-self: end;
  margin-right: 44px;
  margin-left: 8px;
}

.face-box {
  display: flex;
  align-items: center;
}
.text-img {
  width: 20px;
  height: 20px;
}
.message-audio {
  padding-left: 10px;
  display: flex;
  align-items: center;
  position: relative;
  .icon {
    margin: 0 4px;
  }
  audio {
    width: 0;
    height: 0;
  }
}
.reserve {
  flex-direction: row-reverse;
}
.message-area {
  max-width: calc(100% - 54px);
  // position: relative;
  display: flex;
  flex-direction: column;
  margin: 0 8px;
  .name {
    padding-bottom: 4px;
    font-weight: 400;
    font-size: 0.8rem;
    color: #999999;
    letter-spacing: 0;
  }
  .content-highlight {
    padding: 12px;
    font-weight: 400;
    font-size: 14px;
    color: burlywood;
    letter-spacing: 0;
    word-wrap: break-word;
    word-break: break-all;
    position: relative;
    animation: highlight 1000ms infinite;
    &-noPadding::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      opacity: 0.3;
      animation: highlight 1000ms infinite;
    }
    @-webkit-keyframes highlight {
      50% {
        background-color: #ff9c19;
      }
    }
    @keyframes highlight {
      50% {
        background-color: #ff9c19;
      }
    }
  }

  .content {
    padding: 12px;
    font-weight: 400;
    font-size: 14px;
    color: #000000;
    letter-spacing: 0;
    word-wrap: break-word;
    word-break: break-all;
    width: fit-content;
    position: relative;
    overflow: hidden;

    &-in {
      background: #fbfbfb;
      border-radius: 0px 10px 10px 10px;
    }
    &-out {
      background: #dceafd;
      border-radius: 10px 0px 10px 10px;
    }
    &-noPadding {
      padding: 0px;
      height: fit-content;
      background: transparent;
      border-radius: 10px;
      overflow: hidden;
    }
  }
}
.message-label {
  align-self: flex-end;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  font-size: 12px;
  color: #b6b8ba;
  word-break: keep-all;
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

.loadingCircle {
  opacity: 0;
  animation: circleLoading 2s linear 1s infinite;
}
.fail {
  width: 15px;
  height: 15px;
  border-radius: 15px;
  background: red;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}
.unRead {
  color: #679ce1;
}
.dropdown-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}
</style>
