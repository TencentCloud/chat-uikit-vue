<template>
  <li
    ref="content"
    class="TUI-conversation-content"
    :class="[
      currentID === conversation.conversationID && 'selected',
      conversation.isPinned && 'pinned',
      isH5 ? 'list-item-h5' : '',
    ]"
    :id="conversation.conversationID"
  >
    <div
      class="TUI-conversation-item"
      @click.prevent.stop="handleListItem(conversation)"
      v-TUILongPress.self="toggleDialog"
      @click.prevent.right="toggleDialog"
    >
      <aside class="left">
        <img class="avatar" :src="handleConversation?.avator(conversation)" />
        <div
          class="online-status"
          :class="
            userStatusList?.get(conversation?.userProfile?.userID)?.statusType === 1
              ? 'online-status-online'
              : 'online-status-offline'
          "
          v-if="showUserOnlineStatus()"
        ></div>
        <span class="num" v-if="conversation.unreadCount > 0 && conversation.messageRemindType !== 'AcceptNotNotify'">
          {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
        </span>
        <span
          class="num-notify"
          v-if="conversation.unreadCount > 0 && conversation.messageRemindType === 'AcceptNotNotify'"
        ></span>
      </aside>
      <div class="content">
        <div class="content-header">
          <label>
            <p class="name">{{ handleConversation?.name(conversation) }}</p>
          </label>
          <div class="middle-box">
            <span
              class="middle-box-at"
              v-if="conversation.type === 'GROUP' && conversation.groupAtInfoList.length > 0"
              >{{ handleConversation?.showAt(conversation) }}</span
            >
            <p>{{ handleConversation?.showMessage(conversation) }}</p>
          </div>
        </div>
        <div class="content-footer">
          <span class="time">{{ handleConversation?.time(conversation.lastMessage.lastTime) }}</span>
          <img
            v-if="conversation.messageRemindType === 'AcceptNotNotify'"
            class="mute-icon"
            src="../../../../assets/icon/mute.svg"
          />
          <i></i>
        </div>
      </div>
    </div>
    <div class="dialog dialog-item" v-if="toggle" ref="dialog">
      <p class="conversation-options" @click.stop="handleItem('delete')">{{ $t('TUIConversation.删除会话') }}</p>
      <p class="conversation-options" v-if="!conversation.isPinned" @click.stop="handleItem('ispinned')">
        {{ $t('TUIConversation.置顶会话') }}
      </p>
      <p class="conversation-options" v-if="conversation.isPinned" @click.stop="handleItem('dispinned')">
        {{ $t('TUIConversation.取消置顶') }}
      </p>
      <p
        class="conversation-options"
        v-if="conversation.messageRemindType === '' || conversation.messageRemindType === 'AcceptAndNotify'"
        @click.stop="handleItem('mute')"
      >
        {{ $t('TUIConversation.消息免打扰') }}
      </p>
      <p
        class="conversation-options"
        v-if="conversation.messageRemindType === 'AcceptNotNotify'"
        @click.stop="handleItem('notMute')"
      >
        {{ $t('TUIConversation.取消免打扰') }}
      </p>
    </div>
  </li>
</template>
<script lang="ts">
import { onClickOutside, useElementBounding } from '@vueuse/core';
import { defineComponent, nextTick, reactive, ref, toRefs, watch, watchEffect } from 'vue';
import { Conversation } from '../../interface';
const ListItem: any = defineComponent({
  props: {
    conversation: {
      type: Object,
      default: () => ({}),
    },
    handleConversation: {
      type: Object,
      default: () => ({}),
    },
    currentID: {
      type: String,
      default: () => '',
    },
    toggleID: {
      type: String,
      default: () => '',
    },
    isH5: {
      type: Boolean,
      default: () => false,
    },
    displayOnlineStatus: {
      type: Boolean,
      default: () => false,
    },
    userStatusList: {
      type: Map,
      default: () => new Map(),
    },
    types: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props: any, ctx: any) {
    const data = reactive({
      conversation: {} as Conversation,
      currentID: '',
      currentConversation: {},
      toggle: false,
      currentuserID: '',
      conversationType: '',
      loop: 0,
      displayOnlineStatus: false,
      userStatusList: new Map(),
    });

    const dialog: any = ref();
    const content: any = ref();

    onClickOutside(content, () => {
      if (data.toggle === true) {
        ctx.emit('toggle', '');
      }
    });

    watchEffect(() => {
      data.conversation = props.conversation;
      data.currentID = props.currentID;
      data.toggle = false;
      data.displayOnlineStatus = props.displayOnlineStatus;
      data.userStatusList = props.userStatusList;
      props.toggleID === props.conversation.conversationID && (data.toggle = true);
    });

    watch(
      () => data.toggle,
      (val: boolean) => {
        if (val) {
          nextTick(() => {
            const DialogBound = useElementBounding(dialog);
            const ParentEle = content?.value?.offsetParent;
            const ParentBound = useElementBounding(ParentEle);
            if (DialogBound.top.value - ParentBound.top.value - DialogBound.height.value - 30 > 0) {
              dialog.value.style.top = 'auto';
              dialog.value.style.bottom = '30px';
            }
          });
        }
      }
    );

    const handleListItem = (item: any) => {
      ctx.emit('open', item);
      ctx.emit('toggle', '');
    };

    const toggleDialog = (e?: any) => {
      if (e?.target?.oncontextmenu) {
        e.target.oncontextmenu = function () {
          return false;
        };
      }
      ctx.emit('toggle', (data.conversation as any).conversationID);
    };

    const handleItem = (name: string) => {
      ctx.emit('handle', {
        name,
        conversation: data.conversation,
      });
      ctx.emit('toggle', '');
    };

    const showUserOnlineStatus = () => {
      if (data.displayOnlineStatus && data.conversation?.type === props.types.CONV_C2C) return true;
      return false;
    };

    return {
      ...toRefs(data),
      handleListItem,
      handleItem,
      dialog,
      content,
      toggleDialog,
      showUserOnlineStatus,
    };
  },
});
export default ListItem;
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
