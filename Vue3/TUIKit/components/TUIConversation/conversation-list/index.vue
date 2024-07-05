<template>
  <div
    ref="conversationListInnerDomRef"
    class="tui-conversation-list"
  >
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
        isMobile && 'tui-conversation-content-h5 disable-select',
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
        @contextmenu="showConversationActionMenu($event, conversation, index, true)"
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
                v-if="conversation.draftText && conversation.conversationID !== currentConversationID"
                class="middle-box-draft"
              >{{ TUITranslateService.t('TUIChat.[草稿]') }}</span>
              <span
                v-else-if="
                  conversation.type === 'GROUP' &&
                    conversation.groupAtInfoList &&
                    conversation.groupAtInfoList.length > 0
                "
                class="middle-box-at"
              >{{ conversation.getGroupAtInfo() }}</span>
              <div class="middle-box-content">
                {{ conversation.getLastMessage("text") }}
              </div>
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

import { ref, onMounted, onUnmounted } from '../../../adapter-vue';
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUIConversationService,
  TUITranslateService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal, isIOS, addLongPressListener } from '@tencentcloud/universal-api';
import Icon from '../../common/Icon.vue';
import Avatar from '../../common/Avatar/index.vue';
import ActionsMenu from '../actions-menu/index.vue';
import muteIcon from '../../../assets/icon/mute.svg';
import { isPC, isH5, isUniFrameWork, isMobile } from '../../../utils/env';

const emits = defineEmits(['handleSwitchConversation', 'getPassingRef']);
const currentConversation = ref<IConversationModel>();
const currentConversationID = ref<string>();
const currentConversationDomRect = ref<DOMRect>();
const isShowOverlay = ref<boolean>(false);
const conversationList = ref<IConversationModel[]>([]);
const conversationListDomRef = ref<HTMLElement | undefined>();
const conversationListInnerDomRef = ref<HTMLElement | undefined>();
const actionsMenuPosition = ref<{
  top: number;
  left: number | undefined;
  conversationHeight: number | undefined;
}>({
  top: 0,
  left: undefined,
  conversationHeight: undefined,
});
const displayOnlineStatus = ref(false);
const userOnlineStatusMap = ref<IUserStatusMap>();

let lastestOpenActionsMenuTime: number | null = null;

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
    conversationList: onConversationListUpdated,
    currentConversation: onCurrentConversationUpdated,
  });

  TUIStore.watch(StoreName.USER, {
    displayOnlineStatus: onDisplayOnlineStatusUpdated,
    userStatusList: onUserStatusListUpdated,
  });

  if (!isUniFrameWork && isIOS && !isPC) {
    addLongPressHandler();
  }
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdated,
    conversationList: onConversationListUpdated,
    currentConversation: onCurrentConversationUpdated,
  });

  TUIStore.unwatch(StoreName.USER, {
    displayOnlineStatus: onDisplayOnlineStatusUpdated,
    userStatusList: onUserStatusListUpdated,
  });
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
  if (isContextMenuEvent) {
    event.preventDefault();
    if (isUniFrameWork) {
      return;
    }
  }
  currentConversation.value = conversation;
  lastestOpenActionsMenuTime = Date.now();
  getActionsMenuPosition(event, index);
};

const closeConversationActionMenu = () => {
  // Prevent continuous triggering of overlay tap events
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
          // The uni-page-head of uni-h5 is not considered a member of the viewport, so the height of the head is manually increased.
          top: data.bottom + (isH5 ? 44 : 0),
          // @ts-expect-error in uniapp event has touches property
          left: event.touches[0].pageX,
          conversationHeight: data.height,
        };
        isShowOverlay.value = true;
      }
    }).exec();
  } else {
    const rect = ((event.currentTarget || event.target) as HTMLElement)?.getBoundingClientRect() || {};
    if (rect) {
      actionsMenuPosition.value = {
        top: rect.bottom,
        left: isPC ? (event as MouseEvent).clientX : undefined,
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

function addLongPressHandler() {
  if (!conversationListInnerDomRef.value) {
    return;
  }
  addLongPressListener({
    element: conversationListInnerDomRef.value,
    onLongPress: (event, target) => {
      const index = (Array.from(conversationListInnerDomRef.value!.children) as HTMLElement[]).indexOf(target!);
      showConversationActionMenu(event, conversationList.value[index], index);
    },
    options: {
      eventDelegation: {
        subSelector: '.tui-conversation-content',
      },
    },
  });
}

function onCurrentConversationUpdated(conversation: IConversationModel) {
  currentConversation.value = conversation;
}

function onConversationListUpdated(list: IConversationModel[]) {
  conversationList.value = list;
}

function onCurrentConversationIDUpdated(id: string) {
  currentConversationID.value = id;
}

function onDisplayOnlineStatusUpdated(status: boolean) {
  displayOnlineStatus.value = status;
}

function onUserStatusListUpdated(list: Map<string, IUserStatus>) {
  if (list.size !== 0) {
    userOnlineStatusMap.value = [...list.entries()].reduce(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj;
      },
      {} as IUserStatusMap,
    );
  }
}
// Expose to the parent component and close actionsMenu when a sliding event is detected
defineExpose({ closeChildren: closeConversationActionMenu });
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
<style lang="scss" scoped>
.disable-select {
  -webkit-touch-callout:none;
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
</style>
