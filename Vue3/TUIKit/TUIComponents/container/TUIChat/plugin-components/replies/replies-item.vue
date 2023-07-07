<template>
  <div class="replies-item" :class="!isRoot ? 'replies-item-normal' : ''">
    <div class="message-bubble" ref="htmlRefHook">
      <img
        class="avatar"
        :src="message?.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
        onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
      />
      <main class="message-area">
        <div class="message-area-title">
          <label class="name">
            {{ isRoot ? message.nameCard || message.nick || message.from : message.messageSender }}
          </label>
          <label class="time">
            {{ caculateTimeago((isRoot ? message?.time : message?.messageTime) * 1000) }}
          </label>
        </div>
        <div class="content content-in">
          <MessageText
            v-if="message.messageType === constant.typeText || message.type === TIM.TYPES.MSG_TEXT || !isRoot"
            :data="handleTextMessageShowContext(isRoot ? message : { payload: { text: message?.messageAbstract } })"
          />
          <span v-if="message.messageType === constant.typeCustom || message.type === TIM.TYPES.MSG_CUSTOM">{{
            handleCustomMessageShowContext(message)?.custom
          }}</span>
          <img
            v-if="message.messageType === constant.typeImage || message.type === TIM.TYPES.MSG_IMAGE"
            class="message-img"
            :src="message?.payload?.imageInfoArray[1].url"
          />
          <div
            v-if="message.messageType === constant.typeAudio || message.type === TIM.TYPES.MSG_AUDIO"
            class="message-audio"
            :style="`width: ${message?.payload?.second * 10 + 40}px`"
          >
            <i class="icon icon-voice"></i>
            <label>{{ message?.payload?.second }}s</label>
          </div>
          <div
            v-if="message.messageType === constant.typeVideo || message.type === TIM.TYPES.MSG_VIDEO"
            class="message-video-cover"
          >
            <img class="message-videoimg" :src="message?.payload?.snapshotUrl || message?.payload?.thumbUrl" />
          </div>
          <img
            v-if="message.messageType === constant.typeFace || message.type === TIM.TYPES.MSG_FACE"
            class="message-img"
            :src="url"
          />
          <div
            v-if="message.messageType === constant.typeFile || message.type === TIM.TYPES.MSG_FILE"
            class="message-file"
          >
            <i class="icon icon-files"></i>
            <div class="message-file-content">
              <label>{{ message?.payload?.fileName }}</label>
              <span>{{ handleFileMessageShowContext(message)?.size || message?.payload?.fileSize }}</span>
            </div>
          </div>
          <MessageEmojiReact :message="message" type="content" />
        </div>
      </main>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, watchEffect } from 'vue';
import { Message } from '../../interface';
import {
  handleTextMessageShowContext,
  handleCustomMessageShowContext,
  handleFileMessageShowContext,
} from '../../utils/utils';
import { MessageText, MessageEmojiReact } from '../../components';
import { caculateTimeago } from '../../../utils';
import constant from '../../../constant';
import TIM from '../../../../../TUICore/tim/index';
const RepliesItem = defineComponent({
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
    isH5: {
      type: Boolean,
      default: false,
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MessageText,
    MessageEmojiReact,
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      message: {} as Message,
      isH5: false,
      url: '',
      isRoot: false,
      constant,
      TIM,
    });
    watchEffect(() => {
      data.message = props.message;
      data.isH5 = props.isH5;
      data.isRoot = props.isRoot;
      if (data.message.type === TIM.TYPES.MSG_FACE) {
        data.url = `https://web.sdk.qcloud.com/im/assets/face-elem/${data.message?.payload?.data}@2x.png`;
      }
    });
    return {
      ...toRefs(data),
      handleTextMessageShowContext,
      handleCustomMessageShowContext,
      handleFileMessageShowContext,
      caculateTimeago,
    };
  },
});
export default RepliesItem;
</script>
<style lang="scss" scoped>
.replies-item {
  padding: 15px;
  width: auto;
  &-normal {
    padding: 12.8px 15px 0 17px;
    .message-bubble {
      padding-bottom: 0;
      .avatar {
        width: 48px;
        height: 48px;
        border-radius: 8px;
      }
      .message-area {
        padding: 0 0 8px 0;
        margin: 0 0 0 16px;
        border-bottom: 0.1px solid #dbdbdb;
        &-title {
          .name {
            font-size: 14px;
            line-height: 20px;
          }
          .time {
            font-size: 12px;
            line-height: 18px;
          }
        }
        .content,
        .content-in {
          background: inherit;
          border-radius: 0;
          padding: 0;
          line-height: 22px;
        }
      }
    }
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

  .message-area {
    max-width: calc(100% - 54px);
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 8px;
    flex: 1;
    &-title {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .name,
      .time {
        padding-bottom: 4px;
        font-weight: 400;
        font-size: 0.8rem;
        color: #999999;
        letter-spacing: 0;
      }
      .name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      &-in {
        background: #F2F2F2;
        border-radius: 0px 10px 10px 10px;
        .message-img,
        .message-videoimg {
          width: inherit;
          height: inherit;
          max-height: 100%;
          max-width: 100%;
          max-height: 300px;
        }
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
  .message-file {
    flex: 1;
    display: flex;
    cursor: pointer;
    .message-file-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }

  .message-audio {
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    max-width: 100%;
    overflow: hidden;
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
}
</style>
