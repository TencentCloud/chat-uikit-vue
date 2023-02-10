<template>
  <div class="message-bubble" :class="[message.flow === 'in' ? '' : 'reverse']" ref="htmlRefHook">
    <img
      class="avatar"
      :src="message?.avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
      onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
    />
    <main class="message-area">
      <label class="name" v-if="message.flow === 'in' && message.conversationType === 'GROUP'">
        {{ message.nameCard || message.nick || message.from }}
      </label>
      <div :class="handleImageOrVideoBubbleStyle(message)" @click.prevent.right="toggleDialog">
        <div
          class="message-replie-area"
          :class="[message?.flow === 'in' ? '' : 'message-replies-area-reverse']"
          v-if="message?.cloudCustomData && referenceMessage && referenceMessage?.messageRootID"
          @click="showRepliesDialog(message, false)"
        >
          <MessageReference
            :message="message"
            :referenceMessage="referenceMessage"
            :referenceForShow="referenceForShow"
            :url="url"
            :face="face"
            :allMessageID="allMessageID"
            type="reply"
          />
        </div>
        <slot />
        <div v-if="dropdown" ref="dropdownRef" class="dropdown-inner">
          <div class="dialog" :class="[message.flow === 'in' ? '' : 'dialog-right']" @click="dropdown = false">
            <slot name="dialog" />
          </div>
        </div>
        <MessageEmojiReact :message="message" type="content" v-if="needEmojiReact && isEmojiReactionInMessage(message)" />
      </div>
    </main>
    <label class="message-label fail" v-if="message.status === 'fail'" @click="resendMessage(message)">!</label>
    <label
      class="message-label"
      :class="readReceiptStyle(message)"
      v-if="showReadReceiptTag(message)"
      @click="showReadReceiptDialog(message)"
    >
      <span>{{ readReceiptCont(message) }}</span>
    </label>
  </div>
  <div
    class="message-reference-area"
    :class="[message.flow === 'in' ? '' : 'message-reference-area-reverse']"
    v-if="message?.cloudCustomData && referenceMessage && !referenceMessage?.messageRootID"
    @click="jumpToAim(referenceMessage)"
  >
    <MessageReference
      :message="message"
      :referenceMessage="referenceMessage"
      :referenceForShow="referenceForShow"
      :url="url"
      :face="face"
      :allMessageID="allMessageID"
      type="reference"
    />
  </div>
  <label
    class="message-replies"
    :class="[message.flow === 'in' ? '' : 'message-replies-reverse']"
    v-if="replies?.length"
    @click="showRepliesDialog(message, true)"
  >
    <i class="icon icon-msg-replies"></i>
    <span>{{ replies?.length + $t('TUIChat.条回复') }}</span>
  </label>
</template>

<script lang="ts">
import { decodeText } from '../utils/decodeText';
import constant from '../../constant';
import { defineComponent, watchEffect, reactive, toRefs, ref, nextTick, watch } from 'vue';
import { onClickOutside, onLongPress, useElementBounding } from '@vueuse/core';
import { deepCopy, JSONToObject } from '../utils/utils';
import { handleErrorPrompts } from '../../utils';
import TUIChat from '../index.vue';
import MessageReference from './message-reference.vue';
import { Message } from '../interface';
import { TUIEnv } from '../../../../../TUIKit/TUIPlugin';
import MessageEmojiReact from './message-emoji-react.vue';
import TIM from '../../../../TUICore/tim/index';

const messageBubble = defineComponent({
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    messagesList: {
      type: Array,
      default: () => [],
    },
    isH5: {
      type: Boolean,
      default: false,
    },
    needGroupReceipt: {
      type: Boolean,
      default: false,
    },
    needReplies: {
      type: Boolean,
      default: true,
    },
    flow: {
      type: String,
      default: '',
    },
    needEmojiReact: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['jumpID', 'resendMessage', 'showReadReceiptDialog', 'showRepliesDialog', 'dropDownOpen'],
  components: {
    MessageReference,
    MessageEmojiReact,
  },
  setup(props: any, ctx: any) {
    const { t } = (window as any).TUIKitTUICore.config.i18n.useI18n();
    const { TUIServer } = TUIChat;
    const data = reactive({
      env: TUIEnv(),
      message: {} as Message,
      messagesList: [],
      show: false,
      type: {},
      referenceMessage: {},
      referenceForShow: {},
      allMessageID: '',
      needGroupReceipt: false,
      needReplies: true,
      replies: [],
      face: [],
      url: '',
      needEmojiReact: false,
    });

    watchEffect(() => {
      data.type = constant;
      data.messagesList = props.messagesList;
      data.needEmojiReact = props.needEmojiReact;
      data.message = deepCopy(
        data.messagesList?.find((item: any) => (item as any)?.ID === props.message?.ID) || props.data
      );
      data.needGroupReceipt = props.needGroupReceipt;
      data.needReplies = props.needReplies;
      if ((data.message as any).cloudCustomData) {
        const messageIDList: any[] = [];
        const cloudCustomData = JSONToObject((data.message as any).cloudCustomData);
        data.replies = cloudCustomData?.messageReplies?.replies || [];
        data.referenceMessage = cloudCustomData.messageReply ? cloudCustomData.messageReply : '';
        for (let index = 0; index < (data.messagesList as any).length; index++) {
          // To determine whether the referenced message is still in the message list, the corresponding field of the referenced message is displayed if it is in the message list. Otherwise, messageabstract/messagesender is displayed
          messageIDList.push((data.messagesList as any)[index].ID);
          (data as any).allMessageID = JSON.stringify(messageIDList);
          if ((data.messagesList as any)[index].ID === (data.referenceMessage as any)?.messageID) {
            data.referenceForShow = (data.messagesList as any)[index];
            if ((data.referenceMessage as any).messageType === constant.typeText) {
              (data as any).face = decodeText((data.referenceForShow as any).payload);
            }
            if ((data.referenceMessage as any).messageType === constant.typeFace) {
              (data as any).url = `https://web.sdk.qcloud.com/im/assets/face-elem/${
                (data.referenceForShow as any).payload.data
              }@2x.png`;
            }
          }
        }
      } else {
        data.replies = [];
      }
    });

    const htmlRefHook = ref<HTMLElement | null>(null);
    const dropdown = ref(false);
    const dropdownRef = ref(null);

    const toggleDialog = (e: any) => {
      dropdown.value = !dropdown.value;
      if (dropdown.value) {
        ctx.emit('dropDownOpen', dropdownRef);
        nextTick(() => {
          const dialogDom = (dropdownRef as any)?.value?.children[0];
          const dialogElement = document.getElementsByClassName('dialog-item')[0] as HTMLElement;
          const parentDom = (dropdownRef as any)?.value?.offsetParent;
          const parentBound = useElementBounding(parentDom);
          const messageListDom = document.getElementById('messageEle') as HTMLElement;
          const messageListBound = useElementBounding(messageListDom);
          const leftRange = messageListBound?.left?.value;
          const rightRange =
            messageListBound?.left?.value + (messageListDom as any).clientWidth - dialogDom.clientWidth + 76;
          const topRange = messageListBound?.top?.value;
          const bottomRange =
            messageListBound?.top?.value + (messageListDom as any).clientHeight - dialogDom.clientHeight;
          const { clientX, clientY } = e;
          if (data?.env?.isH5) {
            if (parentBound?.top?.value <= dialogElement?.clientHeight) {
              dialogDom.style.bottom = `-${dialogElement?.clientHeight}px`;
            } else {
              if (data?.message?.flow === 'in') {
                dialogDom.style.top = `-${dialogElement?.clientHeight - 20}px`;
              } else {
                dialogDom.style.top = `-${dialogElement?.clientHeight}px`;
              }
            }
            const centerWidth = parentBound?.left?.value + parentBound?.width?.value / 2;
            if (
              centerWidth > dialogElement.clientWidth / 2 &&
              centerWidth < messageListDom?.clientWidth - dialogElement.clientWidth / 2
            ) {
              dialogDom.style.left = 'calc(50% - 135px)';
            } else if (centerWidth <= dialogElement.clientWidth / 2) {
              dialogDom.style.left = '-20px';
            } else {
              dialogDom.style.left = `-${dialogElement.clientWidth / 2 + 10}px`;
            }
            return;
          }
          switch (true) {
            case clientX > leftRange && clientX < rightRange:
              dialogDom.style.left = `${Math.max(e.clientX - parentBound?.left?.value - 76, -40)}px`;
              break;
            case clientX <= leftRange:
              dialogDom.style.left = '20px';
              break;
            case clientX >= rightRange:
              dialogDom.style.right = `${Math.max(
                parentBound?.left?.value + parentDom?.clientWidth - e.clientX - 256,
                -10
              )}px`;
              break;
          }
          switch (true) {
            case clientY > topRange && clientY < bottomRange:
              dialogDom.style.top = `${e.clientY - parentBound?.top?.value}px`;
              dialogDom.style.cssText = dialogDom.style.cssText.replace('align-items:end;', '');
              break;
            case clientY <= topRange:
              dialogDom.style.top = '0px';
              dialogDom.style.cssText = dialogDom.style.cssText.replace('align-items:end;', '');
              break;
            case clientY >= bottomRange:
              dialogDom.style.bottom = `${parentBound?.top?.value + parentDom?.clientHeight - e.clientY}px`;
              dialogDom.style.cssText += 'align-items:end;';
              break;
          }
        });
      }
    };

    const jumpToAim = (message: any) => {
      if (
        (data.referenceMessage as any)?.messageID &&
        data.allMessageID.includes((data.referenceMessage as any)?.messageID)
      ) {
        ctx.emit('jumpID', (data.referenceMessage as any).messageID);
      } else {
        const message = t('TUIChat.无法定位到原消息');
        handleErrorPrompts(message, props);
      }
    };

    onClickOutside(dropdownRef, () => {
      dropdown.value = false;
    });

    const toggleDialogH5 = (e: any) => {
      if (data?.env?.isH5) toggleDialog(e);
      return;
    };

    onLongPress(htmlRefHook, toggleDialogH5);

    const resendMessage = (message: any) => {
      ctx.emit('resendMessage', message);
    };

    const showReadReceiptTag = (message: any) => {
      if (message.flow === 'out' && message.status === 'success' && message.needReadReceipt) {
        return true;
      }
      return false;
    };

    const readReceiptStyle = (message: any) => {
      if (
        message?.readReceiptInfo?.isPeerRead ||
        (message?.readReceiptInfo?.isPeerRead === undefined && message?.isPeerRead) ||
        message?.readReceiptInfo?.unreadCount === 0
      ) {
        return '';
      }
      return 'unRead';
    };

    const readReceiptCont = (message: any) => {
      switch (message.conversationType) {
        case TUIServer.TUICore.TIM.TYPES.CONV_C2C:
          if (
            message?.readReceiptInfo?.isPeerRead ||
            (message?.readReceiptInfo?.isPeerRead === undefined && message?.isPeerRead)
          ) {
            return t('TUIChat.已读');
          }
          return t('TUIChat.未读');
        case TUIServer.TUICore.TIM.TYPES.CONV_GROUP:
          if (message.readReceiptInfo.unreadCount === 0) {
            return t('TUIChat.全部已读');
          }
          if (
            message.readReceiptInfo.readCount === 0 ||
            (message.readReceiptInfo.unreadCount === undefined && message.readReceiptInfo.readCount === undefined)
          ) {
            return t('TUIChat.未读');
          }
          return `${message.readReceiptInfo.readCount + t('TUIChat.人已读')}`;
        default:
          return '';
      }
    };

    const showReadReceiptDialog = (message: any) => {
      ctx.emit('showReadReceiptDialog', message, 'receipt');
    };

    const showRepliesDialog = (message: any, isRoot: boolean) => {
      if (isRoot) {
        ctx.emit('showRepliesDialog', message, 'replies');
        return;
      }
      if ((data.referenceMessage as any)?.messageRootID) {
        const message = data.messagesList?.find(
          (item: Message) => item.ID === (data.referenceMessage as any)?.messageRootID
        );
        if (message) {
          ctx.emit('showRepliesDialog', message, 'replies');
          return;
        } else {
          const message = t('TUIChat.无法定位到原消息');
          handleErrorPrompts(message, props);
        }
      }
    };

    const handleImageOrVideoBubbleStyle = (message: Message) => {
      const classNameList = ['content'];
      if (!message) return classNameList;
      classNameList.push(`content-${data.message.flow}`);
      if (data.message.type === TIM.TYPES.MSG_IMAGE && !isEmojiReactionInMessage(message)) {
        classNameList.push('content-image');
      }
      if (data.message.type === TIM.TYPES.MSG_VIDEO && !isEmojiReactionInMessage(message)) {
        classNameList.push('content-video');
      }
      return classNameList;
    };

    const isEmojiReactionInMessage = (message: Message) => {
      try {
        if (!message?.cloudCustomData) return;
        const reactList = JSONToObject(message?.cloudCustomData)?.messageReact?.reacts;
        if (!reactList || Object.keys(reactList).length === 0) return false;
        return true;
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    return {
      ...toRefs(data),
      toggleDialog,
      htmlRefHook,
      jumpToAim,
      dropdown,
      dropdownRef,
      resendMessage,
      showReadReceiptTag,
      readReceiptStyle,
      readReceiptCont,
      showReadReceiptDialog,
      showRepliesDialog,
      handleImageOrVideoBubbleStyle,
      isEmojiReactionInMessage,
      TIM,
    };
  },
});
export default messageBubble;
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
.message-img {
  max-width: min(calc(100vw - 180px), 300px);
  max-height: min(calc(100vw - 180px), 300px);
}
.message-video-cover {
  display: inline-block;
  position: relative;
  &::before {
    position: absolute;
    z-index: 1;
    content: '';
    width: 0px;
    height: 0px;
    border: 15px solid transparent;
    border-left: 20px solid #ffffff;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
  }
}
.message-videoimg {
  max-width: min(calc(100vw - 160px), 300px);
  max-height: min(calc(100vw - 160px), 300px);
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
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  .name {
    padding-bottom: 4px;
    font-weight: 400;
    font-size: 0.8rem;
    color: #999999;
    letter-spacing: 0;
  }
  .reference-content {
    padding: 12px;
    font-weight: 400;
    font-size: 14px;
    color: burlywood;
    letter-spacing: 0;
    word-wrap: break-word;
    word-break: break-all;
    animation: reference 800ms;
  }
  @-webkit-keyframes reference {
    from {
      opacity: 1;
    }
    50% {
      background-color: #ff9c19;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes reference {
    from {
      opacity: 1;
    }
    50% {
      background-color: #ff9c19;
    }
    to {
      opacity: 1;
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
      background: #fbfbfb;
      border-radius: 0px 10px 10px 10px;
    }
    &-out {
      background: #dceafd;
      border-radius: 10px 0px 10px 10px;
    }
    &-image {
      padding: 0px;
      height: fit-content;
      border-radius: 10px 0px 10px 10px;
    }
    &-video {
      padding: 0px;
      height: fit-content;
      background: transparent;
      border-radius: 10px;
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
.dialog {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: row;
  width: fit-content;
  &-right {
    right: 0;
  }
}
</style>
