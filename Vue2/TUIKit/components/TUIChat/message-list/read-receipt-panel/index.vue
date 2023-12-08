<template>
  <Overlay
    :bg-color="'transparent'"
    @clickHandler="closeReadReciptPanel"
  >
    <div
      :class="{
        'read-receipt-panel': true,
        'read-receipt-panel-mobile': isMobile,
        'read-receipt-panel-close-mobile': isMobile && isPanelClose,
      }"
    >
      <div class="header">
        <div class="header-text">{{ TUITranslateService.t("TUIChat.消息详情") }}</div>
        <div class="header-close-icon">
          <Icon
            size="12px"
            hotAreaSize="8"
            :file="closeIcon"
            @onClick="closeReadReciptPanel"
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
          v-if="tabInfo[currentTabName].memberList.length === 0 && isFirstLoadFinished"
          class="empty-list-tip"
        >
          - 空 -
        </div>
        <template v-else>
          <div
            v-for="item in tabInfo[currentTabName].memberList"
            :key="item.userID"
            class="read-status-member-container"
          >
            <Avatar
              useSkeletonAnimation
              :url="item.avatar"
            />
            <div class="username">
              {{ item.nick || item.userID }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </Overlay>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "../../../../adapter-vue";

import { IMessageModel, TUIStore, TUIChatService, TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import closeIcon from "../../../../assets/icon/icon-close.svg";
import Icon from "../../../common/Icon.vue";
import Overlay from "../../../common/Overlay/index.vue";
import Avatar from "../../../common/Avatar/index.vue";
import { IGroupMessageReadMemberData, ITabInfo, TabName } from "./interface.d";
import { isMobile } from "../../../../utils/env";

interface IProps {
  message: IMessageModel;
}

interface IEmits {
  (ket: "setReadReciptPanelVisible", visible: boolean, message?: IMessageModel): void;
}

const emits = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  message: () => ({}) as IMessageModel,
});

const tabNameList: TabName[] = ['unread', 'read'];

const isPanelClose = ref<boolean>(false);
let isFirstLoadFinished = ref<boolean>(false);
const currentTabName = ref<TabName>('unread');
const tabInfo = ref<ITabInfo>({
  read: {
    tabName: TUITranslateService.t("TUIChat.已读"),
    count: undefined,
    memberList: [],
  },
  unread: {
    tabName: TUITranslateService.t("TUIChat.未读"),
    count: undefined,
    memberList: [],
  },
  close: {
    tabName: TUITranslateService.t("TUIChat.关闭"),
    count: undefined,
    memberList: [],
  },
});

onMounted(() => {
  fetchGroupMessageReadMemberList();
});

watch(
  // uniapp下监听不到数据变化
  () => props.message.readReceiptInfo.readCount,
  () => {
    fetchGroupMessageReadMemberList();
  },
);

async function fetchGroupMessageReadMemberList() {
  const message = TUIStore.getMessageModel(props.message.ID);
  const unreadResult: IGroupMessageReadMemberData = await TUIChatService.getGroupMessageReadMemberList({
    message,
    filter: 1,
    cursor: "",
    count: 100,
  });
  if (unreadResult) {
    tabInfo.value.unread.count = unreadResult.data.unreadUserInfoList.length;
    tabInfo.value.unread.memberList = unreadResult.data.unreadUserInfoList;
  }
  const readResult: IGroupMessageReadMemberData = await TUIChatService.getGroupMessageReadMemberList({
    message,
    filter: 0,
    cursor: "",
    count: 100,
  });
  if (readResult) {
    tabInfo.value.read.memberList = readResult.data.readUserInfoList;
    tabInfo.value.read.count = readResult.data.readUserInfoList.length;
  }
  isFirstLoadFinished.value = true;
}

function toggleTabName(tabName: TabName) {
  currentTabName.value = tabName;
}

function closeReadReciptPanel() {
  isPanelClose.value = true;
  setTimeout(() => {
    emits("setReadReciptPanelVisible", false);
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

      .username {
        margin-left: 8px;
        line-height: 20px;
      }

      & + .read-status-member-container {
        margin-top: 20px;
      }
    }
  }
}

.read-receipt-panel-mobile {
  @extend .read-receipt-panel;
  box-shadow: none;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  animation: slide-in-from-right 0.3s ease-out;
  transition: transform 0.2s ease-out;

  @keyframes slide-in-from-right {
    from {
      transform: translateX(100%);
    }
  }
}

.read-receipt-panel-close-mobile {
  transform: translateX(100%);
}
</style>
./interface