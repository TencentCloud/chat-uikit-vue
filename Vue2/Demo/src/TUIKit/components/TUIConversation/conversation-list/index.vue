<template>
  <div class="tui-conversation-list">
    <ActionsMenu
      v-if="isShowOverlay"
      :selectedConversation="currentConversation"
      :actionsMenuPosition="actionsMenuPosition"
      :selectedConversationDomRect="currentConversationDomRect"
      @closeConversationActionMenu="closeConversationActionMenu"
    />
    <div
      v-for="(conversation, index) in conversationList"
      :id="`convlistitem-${index}`"
      :key="index"
      :class="[
        'tui-conversation-content',
        !isPC && 'tui-conversation-content-h5',
      ]"
    >
      <div
        :class="[
          isPC && 'isPC',
          'tui-conversation-item',
          currentConversationID === conversation.conversationID &&
            'tui-conversation-item-selected',
          conversation.isPinned && 'tui-conversation-item-pinned',
        ]"
        @click="enterConversationChat(conversation.conversationID)"
        @longpress="showConversationActionMenu($event, conversation, index)"
        @contextmenu.prevent="showConversationActionMenu($event, conversation, index, true)"
      >
        <aside class="left">
          <Avatar
            useSkeletonAnimation
            :url="conversation.getAvatar()"
            size="30px"
          />
          <div
            v-if="userOnlineStatusMap && isShowUserOnlineStatus(conversation)"
            :class="[
              'online-status',
              Object.keys(userOnlineStatusMap).length > 0 &&
                Object.keys(userOnlineStatusMap).includes(
                  conversation.userProfile.userID
                ) &&
                userOnlineStatusMap[conversation.userProfile.userID]
                  .statusType === 1
                ? 'online-status-online'
                : 'online-status-offline',
            ]"
          />
          <span
            v-if="conversation.unreadCount > 0 && !conversation.isMuted"
            class="num"
          >
            {{
              conversation.unreadCount > 99 ? "99+" : conversation.unreadCount
            }}
          </span>
          <span
            v-if="conversation.unreadCount > 0 && conversation.isMuted"
            class="num-notify"
          />
        </aside>
        <div class="content">
          <div class="content-header">
            <label class="content-header-label">
              <p class="name">{{ conversation.getShowName() }}</p>
            </label>
            <div class="middle-box">
              <span
                v-if="
                  conversation.type === 'GROUP' &&
                    conversation.groupAtInfoList &&
                    conversation.groupAtInfoList.length > 0
                "
                class="middle-box-at"
              >{{ conversation.getGroupAtInfo() }}</span>
              <p class="middle-box-content">
                {{ conversation.getLastMessage("text") }}
              </p>
            </div>
          </div>
          <div class="content-footer">
            <span class="time">{{ conversation.getLastMessage("time") }}</span>
            <Icon
              v-if="conversation.isMuted"
              :file="muteIcon"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface IUserStatus {
  statusType: number;
  customStatus: string;
}

interface IUserStatusMap {
  [userID: string]: IUserStatus;
}

import { ref } from '../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUIConversationService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import Icon from '../../common/Icon.vue';
import Avatar from '../../common/Avatar/index.vue';
import ActionsMenu from '../actions-menu/index.vue';
import muteIcon from '../../../assets/icon/mute.svg';
import { isPC, isH5, isUniFrameWork } from '../../../utils/env';

const emits = defineEmits(['handleSwitchConversation', 'getPassingRef']);
const currentConversation = ref<IConversationModel>();
const currentConversationID = ref<string>();
const currentConversationDomRect = ref<DOMRect>();
const isShowOverlay = ref<boolean>(false);
const conversationList = ref<IConversationModel[]>([]);
const conversationListDomRef = ref<HTMLElement | undefined>();
const actionsMenuPosition = ref<{ top: number; left?: number; conversationHeight?: number }>({
  top: 0,
});
const displayOnlineStatus = ref(false); // 在线状态 默认关闭
const userOnlineStatusMap = ref<IUserStatusMap>();

let lastestOpenActionsMenuTime: number | null = null;

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    currentConversationID.value = id;
  },
  conversationList: (list: Array<IConversationModel>) => {
    conversationList.value = list;
  },
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
  },
});

// 初始状态
TUIStore.watch(StoreName.USER, {
  displayOnlineStatus: (status: boolean) => {
    displayOnlineStatus.value = status;
  },
  userStatusList: (list: Map<string, IUserStatus>) => {
    if (list.size !== 0) {
      userOnlineStatusMap.value = [...list.entries()].reduce(
        (obj, [key, value]) => {
          obj[key] = value;
          return obj;
        },
        {} as IUserStatusMap,
      );
    }
  },
});

const isShowUserOnlineStatus = (conversation: IConversationModel): boolean => {
  return (
    displayOnlineStatus.value
    && conversation.type === TUIChatEngine.TYPES.CONV_C2C
  );
};

const showConversationActionMenu = (
  event: Event,
  conversation: IConversationModel,
  index: number,
  isContextMenuEvent?: boolean,
) => {
  if (isContextMenuEvent && isUniFrameWork) {
    return;
  }
  currentConversation.value = conversation;
  lastestOpenActionsMenuTime = Date.now();
  getActionsMenuPosition(event, index);
};

const closeConversationActionMenu = () => {
  // 防止连续触发overlay的tap事件
  if (
    lastestOpenActionsMenuTime
    && Date.now() - lastestOpenActionsMenuTime > 300
  ) {
    currentConversation.value = undefined;
    isShowOverlay.value = false;
  }
};

const getActionsMenuPosition = (event: Event, index: number) => {
  if (isUniFrameWork) {
    if (typeof conversationListDomRef.value === 'undefined') {
      emits('getPassingRef', conversationListDomRef);
    }
    const query = TUIGlobal?.createSelectorQuery().in(conversationListDomRef.value);
    query.select(`#convlistitem-${index}`).boundingClientRect((data) => {
      if (data) {
        actionsMenuPosition.value = {
          // uni-h5的uni-page-head不被认为是视窗中的成员，因此手动上head的高度
          top: data.bottom + (isH5 ? 44 : 0),
          left: event.touches[0].pageX,
          conversationHeight: data.height,
        };
        isShowOverlay.value = true;
      }
    }).exec();
  } else {
    // 处理Vue原生
    const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect();
    if (rect) {
      actionsMenuPosition.value = {
        top: rect.bottom,
        left: isPC ? event.clientX : undefined,
        conversationHeight: rect.height,
      };
    }
    isShowOverlay.value = true;
  }
};

const enterConversationChat = (conversationID: string) => {
  emits('handleSwitchConversation', conversationID);
  TUIConversationService.switchConversation(conversationID);
};

// 暴露给父组件，当监听到滑动事件时关闭actionsMenu
defineExpose({ closeChildren: closeConversationActionMenu });
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
