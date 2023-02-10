<template>
  <div class="dialog-item" :class="env?.isH5 ? 'dialog-item-h5' : 'dialog-item-web'">
    <MessageEmojiReact
      v-if="env?.isH5 && needEmojiReact"
      :message="message"
      type="dropdown"
      @handleCollapse="handleCollapse"
    />
    <ul
      class="dialog-item-list"
      :class="env?.isH5 ? 'dialog-item-list-h5' : 'dialog-item-list-web'"
      v-show="showToolList"
    >
      <li
        v-if="
          (message.type === types.MSG_FILE || message.type === types.MSG_VIDEO || message.type === types.MSG_IMAGE) &&
          !env.isH5
        "
        @click="openMessage(message)"
      >
        <i class="icon icon-msg-copy"></i>
        <span>{{ $t('TUIChat.打开') }}</span>
      </li>
      <li v-if="message.type === types.MSG_TEXT" @click="handleMseeage(message, constant.handleMessage.copy)">
        <i class="icon icon-msg-copy"></i>
        <span>{{ $t('TUIChat.复制') }}</span>
      </li>
      <li v-if="message.status === 'success'" @click="handleMseeage(message, constant.handleMessage.forward)">
        <i class="icon icon-msg-forward"></i>
        <span>{{ $t('TUIChat.转发') }}</span>
      </li>
      <li v-if="message.status === 'success'" @click="handleMseeage(message, 'reference')">
        <i class="icon icon-msg-quote"></i>
        <span>{{ $t('TUIChat.引用') }}</span>
      </li>
      <li v-if="message.status === 'success'" @click="handleMseeage(message, 'reply')">
        <i class="icon icon-msg-reply"></i>
        <span>{{ $t('TUIChat.回复') }}</span>
      </li>
      <li
        v-if="message.flow === 'out' && message.status === 'success' && message.type !== types.MSG_CUSTOM"
        @click="handleMseeage(message, constant.handleMessage.revoke)"
      >
        <i class="icon icon-msg-revoke"></i>
        <span>{{ $t('TUIChat.撤回') }}</span>
      </li>
      <li v-if="message.status === 'success'" @click="handleMseeage(message, constant.handleMessage.delete)">
        <i class="icon icon-msg-del"></i>
        <span>{{ $t('TUIChat.删除') }}</span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent, watch, reactive, toRefs, ref, watchEffect } from 'vue';
import { Message } from '../interface';
import TIM from '../../../../TUICore/tim';
import { handleErrorPrompts } from '../../utils';
import constant from '../../constant';
import TUIAegis from '../../../../utils/TUIAegis';
import useClipboard from 'vue-clipboard3';
import { useStore } from 'vuex';
import MessageEmojiReact from './message-emoji-react.vue';
export default defineComponent({
  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
    needEmojiReact: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MessageEmojiReact,
  },
  setup(props: any, ctx: any) {
    const TUIServer = (window as any)?.TUIKitTUICore?.TUIServer?.TUIChat;
    const VuexStore = useStore && useStore();
    const data = reactive({
      message: {} as Message,
      show: false,
      types: TIM.TYPES,
      env: TUIServer.TUICore.TUIEnv,
      showToolList: true,
      needEmojiReact: false,
    });

    watchEffect(() => {
      data.needEmojiReact = props.needEmojiReact;
    })

    watch(
      () => props.message,
      () => {
        data.message = props.message;
      },
      { deep: true, immediate: true }
    );

    const openMessage = (item: any) => {
      let url = '';
      switch (item.type) {
        case data.types.MSG_FILE:
          url = item.payload.fileUrl;
          break;
        case data.types.MSG_VIDEO:
          url = item.payload.remoteVideoUrl;
          break;
        case data.types.MSG_IMAGE:
          url = item.payload.imageInfoArray[0].url;
          break;
      }
      window.open(url, '_blank');
    };

    const handleMseeage = async (message: Message, type: string) => {
      switch (type) {
        case constant.handleMessage.revoke:
          try {
            await TUIServer.revokeMessage(message);
            TUIAegis.getInstance().reportEvent({
              name: 'messageOptions',
              ext1: 'messageRevoke',
            });
            (window as any)?.TUIKitTUICore?.isOfficial && VuexStore?.commit('handleTask', 1);
          } catch (error) {
            handleErrorPrompts(error, data.env);
          }
          break;
        case constant.handleMessage.copy:
          try {
            if (message?.type === data.types.MSG_TEXT && message?.payload?.text) {
              const { toClipboard } = useClipboard();
              await toClipboard(message?.payload?.text);
            }
          } catch (error) {
            handleErrorPrompts(error, data.env);
          }
          break;
        case constant.handleMessage.delete:
          await TUIServer.deleteMessage([message]);
          TUIAegis.getInstance().reportEvent({
            name: 'messageOptions',
            ext1: 'messageDelete',
          });
          break;
        case constant.handleMessage.forward:
          TUIAegis.getInstance().reportEvent({
            name: 'messageOptions',
            ext1: 'messageForward',
          });
          ctx.emit('forwardMessage', message);
          break;
        case constant.handleMessage.reference:
          ctx.emit('referOrReplyMessage', message, 'reference');
          break;
        case constant.handleMessage.reply:
          ctx.emit('referOrReplyMessage', message, 'reply');
          break;
      }
    };

    const handleCollapse = (isCollapse: boolean) => {
      if (!data?.env?.isH5) return;
      data.showToolList = isCollapse;
    };

    return {
      ...toRefs(data),
      openMessage,
      handleMseeage,
      constant,
      handleCollapse,
    };
  },
});
</script>
<style lang="scss" scoped>
.dialog-item {
  background: #ffffff;
  min-width: min-content;
  max-width: 220px;
  width: 72px;
  height: fit-content;
  word-break: keep-all;
  top: 30px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  white-space: nowrap;
  &-web {
    padding: 12px 0;
  }

  &-list {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    white-space: nowrap;
    justify-content: space-around;
    width: 100%;
    &-h5 {
      flex-wrap: nowrap;
      margin: 10px;
      li {
        padding: 0 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 8px;
        color: #4f4f4f;
      }
    }
    &-web {
      li:first-child {
        margin-top: 0;
      }

      li {
        padding: 4px 12px;
        font-size: 12px;
        line-height: 17px;
        display: flex;
        flex-direction: row;
        align-items: center;
        span {
          padding-left: 4px;
        }
      }
    }
  }
}
</style>
