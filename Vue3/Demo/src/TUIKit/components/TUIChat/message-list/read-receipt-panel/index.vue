<template>
  <Overlay
    :maskColor="'transparent'"
    @onOverlayClick="closeReadReceiptPanel"
  >
    <div
      :class="{
        'read-receipt-panel': true,
        'read-receipt-panel-mobile': isMobile,
        'read-receipt-panel-uni': isUniFrameWork,
        'read-receipt-panel-close-mobile': isMobile && isPanelClose,
      }"
    >
      <div class="header">
        <div class="header-text">
          {{ TUITranslateService.t("TUIChat.消息详情") }}
        </div>
        <div class="header-close-icon">
          <Icon
            size="12px"
            hotAreaSize="8"
            :file="closeIcon"
            @onClick="closeReadReceiptPanel"
          />
        </div>
      </div>
      <div class="read-status-counter-container">
        <div
          v-for="tabName in tabNameList"
          :key="tabName"
          :class="{
            'read-status-counter': true,
            'active': tabName === currentTabName,
          }"
          @click="toggleTabName(tabName)"
        >
          <div class="status-text">
            {{ tabInfo[tabName].tabName }}
          </div>
          <div class="status-count">
            {{ tabInfo[tabName].count === undefined ? "" : tabInfo[tabName].count }}
          </div>
        </div>
      </div>
      <div class="read-status-member-list">
        <div
          v-if="tabInfo[currentTabName].count === 0 && isFirstLoadFinished"
          class="empty-list-tip"
        >
          - {{ TUITranslateService.t('TUIChat.空') }} -
        </div>
        <template v-else-if="isFirstLoadFinished">
          <template v-if="currentTabName === 'unread'">
            <div
              v-for="item in tabInfo[currentTabName].memberList"
              :key="item.userID"
              class="read-status-member-container"
            >
              <Avatar
                class="read-status-avatar"
                useSkeletonAnimation
                :url="item.avatar || ''"
              />
              <div class="username">
                {{ item.nick || item.userID }}
              </div>
            </div>
          </template>
          <template v-if="currentTabName === 'read'">
            <div
              v-for="item in tabInfo[currentTabName].memberList"
              :key="item.userID"
              class="read-status-member-container"
            >
              <Avatar
                class="read-status-avatar"
                useSkeletonAnimation
                :url="item.avatar"
              />
              <div class="username">
                {{ item.nick || item.userID }}
              </div>
            </div>
          </template>
        </template>
        <div
          v-if="isFirstLoadFinished"
          class="fetch-more-container"
        >
          <FetchMore
            :isFetching="isPullDownFetching"
            :isTerminateObserve="isStopFetchMore"
            @onExposed="pullDownFetchMoreData"
          />
        </div>
      </div>
    </div>
  </Overlay>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from '../../../../adapter-vue';

import { IMessageModel, TUIStore, TUIChatService, TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import closeIcon from '../../../../assets/icon/icon-close.svg';
import Icon from '../../../common/Icon.vue';
import Overlay from '../../../common/Overlay/index.vue';
import Avatar from '../../../common/Avatar/index.vue';
import FetchMore from '../../../common/FetchMore/index.vue';
import type { IGroupMessageReadMemberData, IMemberData, ITabInfo, TabName } from './interface';
import { isMobile, isUniFrameWork } from '../../../../utils/env';

type ReadType = 'unread' | 'read' | 'all';

interface IProps {
  message: IMessageModel;
}

interface IEmits {
  (key: 'setReadReceiptPanelVisible', visible: boolean, message?: IMessageModel): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({}) as IMessageModel,
});

let lastUnreadCursor: string = '';
let lastReadCursor: string = '';
const tabNameList: TabName[] = ['unread', 'read'];
const isListFetchCompleted: Record<TabName, boolean> = {
  unread: false,
  read: false,
  close: false,
};

const isPullDownFetching = ref<boolean>(false);
const isPanelClose = ref<boolean>(false);
const isFirstLoadFinished = ref<boolean>(false);
const isStopFetchMore = ref<boolean>(false);
const currentTabName = ref<TabName>('unread');
const tabInfo = ref<ITabInfo>(generateInitalTabInfo());

onMounted(async () => {
  await initAndRefetchReceiptInfomation();
  nextTick(() => {
    isFirstLoadFinished.value = true;
  });
});

watch(
  () => props.message.readReceiptInfo.readCount,
  () => {
    initAndRefetchReceiptInfomation();
  },
);

async function fetchGroupMessageRecriptMemberListByType(readType: ReadType = 'all') {
  const message = TUIStore.getMessageModel(props.message.ID);

  let unreadResult = {} as IGroupMessageReadMemberData;
  let readResult = {} as IGroupMessageReadMemberData;

  if (readType === 'all' || readType === 'unread') {
    unreadResult = await TUIChatService.getGroupMessageReadMemberList({
      message,
      filter: 1,
      cursor: lastUnreadCursor,
      count: 100,
    });
    if (unreadResult) {
      lastUnreadCursor = unreadResult.data.cursor;
      if (unreadResult.data.isCompleted) {
        isListFetchCompleted.unread = true;
      }
    }
  }

  if (readType === 'all' || readType === 'read') {
    readResult = await TUIChatService.getGroupMessageReadMemberList({
      message,
      filter: 0,
      cursor: lastReadCursor,
      count: 100,
    });
    if (readResult) {
      lastReadCursor = readResult.data.cursor;
      if (readResult.data.isCompleted) {
        isListFetchCompleted.read = true;
      }
    }
  }

  // Fetch the total number of read and unread users
  const { unreadCount: totalUnreadCount, readCount: totalReadCount } = message.readReceiptInfo;

  return {
    unreadResult: {
      count: totalUnreadCount,
      ...unreadResult.data,
    },
    readResult: {
      count: totalReadCount,
      ...readResult.data,
    },
  };
}

async function pullDownFetchMoreData() {
  /**
   * Use isPullDownFetching to control the state of the FetchMore component
   * Also, implement locking for intersectionObserver under uniapp
   * Because there is no isIntersecting in uniapp, it is impossible to determine whether the observed element has entered or exited the observation area
  */
  if (isListFetchCompleted[currentTabName.value] || isPullDownFetching.value) {
    return;
  }
  isPullDownFetching.value = true;
  if (currentTabName.value === 'unread' || currentTabName.value === 'read') {
    const { unreadResult, readResult } = await fetchGroupMessageRecriptMemberListByType(currentTabName.value);
    checkStopFetchMore();
    try {
      tabInfo.value.unread.memberList = tabInfo.value.unread.memberList.concat(unreadResult.unreadUserInfoList || []);
      tabInfo.value.read.memberList = tabInfo.value.read.memberList.concat(readResult.readUserInfoList || []);
    } finally {
      isPullDownFetching.value = false;
    }
  }
}

/**
 * Initializes and refetches receipt information.
 *
 * @return {Promise<void>} A promise that resolves when the function has completed.
 */
async function initAndRefetchReceiptInfomation(): Promise<void> {
  lastUnreadCursor = '';
  lastReadCursor = '';
  isStopFetchMore.value = false;
  isListFetchCompleted.unread = false;
  isListFetchCompleted.read = false;
  const { unreadResult, readResult } = await fetchGroupMessageRecriptMemberListByType('all');
  checkStopFetchMore();
  resetTabInfo('read', readResult.count, readResult.readUserInfoList);
  resetTabInfo('unread', unreadResult.count, unreadResult.unreadUserInfoList);
  resetTabInfo('close');
}

/**
 * Checks if the fetch more operation should be stopped
 * by IntersetctionObserver.disconnect().
 *
 * @return {void}
 */
function checkStopFetchMore(): void {
  if (isListFetchCompleted.read && isListFetchCompleted.unread) {
    isStopFetchMore.value = true;
  }
}

/**
 * Resets the information of a specific tab.
 *
 * @param {TabName} tabName - The name of the tab to reset.
 * @param {number} [count] - The count to assign to the tab. Optional.
 * @param {IMemberData[]} [memberList] - The list of members to assign to the tab. Optional.
 * @return {void} - This function does not return anything.
 */
function resetTabInfo(tabName: TabName, count?: number, memberList?: IMemberData[]): void {
  tabInfo.value[tabName].count = count;
  tabInfo.value[tabName].memberList = memberList || [];
}

/**
 * Generates the initial tab information.
 *
 * @return {ITabInfo} The initial tab information.
 */
function generateInitalTabInfo(): ITabInfo {
  return {
    read: {
      tabName: TUITranslateService.t('TUIChat.已读'),
      count: undefined,
      memberList: [],
    },
    unread: {
      tabName: TUITranslateService.t('TUIChat.未读'),
      count: undefined,
      memberList: [],
    },
    close: {
      tabName: TUITranslateService.t('TUIChat.关闭'),
      count: undefined,
      memberList: [],
    },
  };
}

/**
 * Toggles the tab name.
 *
 * @param {TabName} tabName - The name of the tab to toggle.
 * @return {void} This function does not return anything.
 */
function toggleTabName(tabName: TabName): void {
  currentTabName.value = tabName;
}

function closeReadReceiptPanel(): void {
  isPanelClose.value = true;
  setTimeout(() => {
    emits('setReadReceiptPanelVisible', false);
  }, 200);
}
</script>

<style scoped lang="scss">
:not(not) {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.read-receipt-panel {
  background-color: #fff;
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.1);
  width: 368px;
  height: 510px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;

  .header {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: relative;

    .header-text {
      font-weight: bold;
      font-size: 16px;
      line-height: 30px;
      color: #333;
    }

    .header-close-icon {
      position: absolute;
      right: 0;
      margin-right: 10px;
    }
  }

  .read-status-counter-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    min-height: 59px;
    margin: 20px 40px 17.5px;

    .read-status-counter {
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;

      .status-text {
        font-size: 14px;
        line-height: 20px;
      }

      .status-count {
        margin-top: 2px;
        font-size: 30px;
        font-weight: bolder;
        line-height: 37px;
      }

      &.active {
        color: #679ce1;
      }
    }
  }

  .read-status-member-list {
    flex: 1 1 auto;
    overflow: hidden auto;
    padding: 20px 0 0;
    border-top: 0.5px solid #e8e8e9;
    font-size: 14px;

    .empty-list-tip {
      align-self: center;
      color: #b3b3b3;
    }

    .read-status-member-container {
      flex-direction: row;
      align-items: center;

      .read-status-avatar {
        flex: 0 0 auto;
      }

      .username {
        margin-left: 8px;
        line-height: 20px;
        flex: 0 1 auto;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        white-space: nowrap;
      }

      & + .read-status-member-container {
        margin-top: 20px;
      }
    }

    .fetch-more-container {
      justify-content: center;
      align-items: center;
      margin-top: auto;
    }
  }
}

.read-receipt-panel-mobile {
  @extend .read-receipt-panel;

  box-shadow: none;
  width: 100%;
  height: 100%;
  border-radius: 0;
  animation: slide-in-from-right 0.3s ease-out;
  transition: transform 0.2s ease-out;

  @keyframes slide-in-from-right {
    from {
      transform: translateX(100%);
    }
  }
}

.read-receipt-panel-uni {
  width: 100vw;
  height: 100vh;
}

.read-receipt-panel-close-mobile {
  transform: translateX(100%);
}
</style>
