<template>
  <ul
    :class="[
      'TUI-conversation-list',
      isPC ? 'TUI-conversation-list-web' : 'TUI-conversation-list-h5',
    ]"
    ref="listRef"
    @mousewheel="scrollChange"
    @scroll="scrollChange"
    @click="closeToggleListItem"
  >
    <li
      v-for="(conversation, index) in conversationList"
      :key="conversation.conversationID"
      class="TUI-conversation-content"
      :class="[!isPC && 'TUI-conversation-content-h5']"
    >
      <div
        @click="handleSwitchConversation(conversation.conversationID)"
        @longpress="handleToggleListItem($event, conversation, index, true)"
        @click.prevent.right="handleToggleListItem($event, conversation, index)"
        @touchstart="
          handleH5LongPress($event, conversation, index, 'touchstart')
        "
        @touchend="handleH5LongPress($event, conversation, index, 'touchend')"
        @mouseover="handleH5LongPress($event, conversation, index, 'touchend')"
        :class="[
          'TUI-conversation-item',
          currentConversationID === conversation.conversationID &&
            'TUI-conversation-item-selected',
          toggleID === conversation.conversationID &&
            'TUI-conversation-item-toggled',
          conversation.isPinned && 'TUI-conversation-item-pinned',
        ]"
      >
        <aside class="left">
          <img class="avatar" :src="conversation.getAvatar()" />
          <div
            :class="[
              'online-status',
              Object.keys(statusList).length > 0 && Object.keys(statusList).includes(conversation.userProfile.userID) &&
              statusList[conversation.userProfile.userID].statusType === 1
                ? 'online-status-online'
                : 'online-status-offline',
            ]"
            v-if="showUserOnlineStatus(conversation)"
          ></div>
          <span
            class="num"
            v-if="conversation.unreadCount > 0 && !conversation.isMuted"
          >
            {{
              conversation.unreadCount > 99 ? "99+" : conversation.unreadCount
            }}
          </span>
          <span
            class="num-notify"
            v-if="conversation.unreadCount > 0 && conversation.isMuted"
          ></span>
        </aside>
        <div class="content">
          <div class="content-header">
            <label class="content-header-label">
              <p class="name">{{ conversation.getShowName() }}</p>
            </label>
            <div class="middle-box">
              <span
                class="middle-box-at"
                v-if="
                  conversation.type === 'GROUP' &&
                  conversation.groupAtInfoList &&
                  conversation.groupAtInfoList.length > 0
                "
                >{{ conversation.getGroupAtInfo() }}</span
              >
              <p class="middle-box-content">
                {{ conversation.getLastMessage("text") }}
              </p>
            </div>
          </div>
          <div class="content-footer">
            <span class="time">{{ conversation.getLastMessage("time") }}</span>
            <Icon v-if="conversation.isMuted" :file="muteIcon"></Icon>
          </div>
        </div>
      </div>
      <div
        :class="['dialog', 'dialog-item']"
        :style="{ top: `${dialogTop}px` }"
        ref="dialog"
        v-if="conversation.conversationID === toggleID"
      >
        <p
          class="conversation-options"
          @click.stop="
            handleItem({ name: CONV_OPERATION.DELETE, conversation })
          "
        >
          {{ TUITranslateService.t("TUIConversation.删除会话") }}
        </p>
        <p
          class="conversation-options"
          v-if="!conversation.isPinned"
          @click.stop="
            handleItem({ name: CONV_OPERATION.ISPINNED, conversation })
          "
        >
          {{ TUITranslateService.t("TUIConversation.置顶会话") }}
        </p>
        <p
          class="conversation-options"
          v-if="conversation.isPinned"
          @click.stop="
            handleItem({ name: CONV_OPERATION.DISPINNED, conversation })
          "
        >
          {{ TUITranslateService.t("TUIConversation.取消置顶") }}
        </p>
        <p
          class="conversation-options"
          v-if="
            conversation.messageRemindType === '' ||
            conversation.messageRemindType === 'AcceptAndNotify'
          "
          @click.stop="handleItem({ name: CONV_OPERATION.MUTE, conversation })"
        >
          {{ TUITranslateService.t("TUIConversation.消息免打扰") }}
        </p>
        <p
          class="conversation-options"
          v-if="conversation.isMuted"
          @click.stop="
            handleItem({ name: CONV_OPERATION.NOTMUTE, conversation })
          "
        >
          {{ TUITranslateService.t("TUIConversation.取消免打扰") }}
        </p>
      </div>
    </li>
  </ul>
</template>
<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  getCurrentInstance,
  defineExpose,
  nextTick,
  watchEffect,
} from "../../../adapter-vue";
import TUIChatEngine, {
  TUIGlobal,
  IConversationModel,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIConversationService,
} from "@tencentcloud/chat-uikit-engine";
import { CONV_OPERATION } from "../../../constant";
import Icon from "../../common/Icon.vue";
import muteIcon from "../../../assets/icon/mute.svg";
const emits = defineEmits(["handleSwitchConversation"]);

const listRef = ref();
const dialog = ref();
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isApp = ref(TUIGlobal.getPlatform() === "app");
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");
const isUniFrameWork = ref(typeof uni !== "undefined");
const toggleID = ref("");
const currentConversation = ref<IConversationModel>();
const currentConversationID = ref("");
const conversationList = ref();
const listRectInfo = ref();
const toggleNowRectInfo = ref();
const dialogTop = ref(30);
const isLongpressing = ref(false);
// 在线状态
const displayOnlineStatus = ref(false); // 默认关闭
const userStatusList = ref(new Map());
const statusList = ref({});

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
  userStatusList: (
    list: Map<
      string,
      {
        statusType: number;
        customStatus: string;
      }
    >
  ) => {
    if (list.size === 0) {
      return;
    }
    statusList.value = Object.fromEntries(list.entries());
  },
});

const showUserOnlineStatus = (conversation: IConversationModel) => {
  return (
    displayOnlineStatus.value &&
    conversation.type === TUIChatEngine.TYPES.CONV_C2C
  );
};

const handleItem = (params: {
  name: any;
  conversation: IConversationModel;
}) => {
  const { name, conversation } = params;
  if (!name || !conversation || !conversation.conversationID) {
    return;
  }
  const conversationModel = conversationList.value?.find(
    (item: IConversationModel) => {
      return item.conversationID === conversation.conversationID;
    }
  );
  toggleID.value = "";
  switch (name) {
    case CONV_OPERATION.DELETE:
      conversationModel?.deleteConversation();
      break;
    case CONV_OPERATION.ISPINNED:
      conversationModel?.pinConversation();
      break;
    case CONV_OPERATION.DISPINNED:
      conversationModel?.pinConversation();
      break;
    case CONV_OPERATION.MUTE:
      conversationModel?.muteConversation();
      break;
    case CONV_OPERATION.NOTMUTE:
      conversationModel?.muteConversation();
      break;
  }
};

const handleToggleListItem = (
  e: any,
  conversation: IConversationModel,
  index: number,
  isLongpress = false
) => {
  if (isLongpress) {
    isLongpressing.value = true;
  }
  // uniapp to wechat, click event doesn't working, use click.right instead click to switchConversation
  if (isWeChat.value) {
    handleSwitchConversation(conversation.conversationID);
  }
  setToggleNowRectInfo(e.target);
  handleDialogPosition(conversation, index);
  nextTick(() => {
    onClickOutside(dialog.value);
  });
  
};

const closeToggleListItem = () => {
  toggleID.value && (toggleID.value = "");
};

const scrollChange = () => {
  toggleID.value && (toggleID.value = "");
};

// h5 long press
let timer: number;
const handleH5LongPress = (
  e: any,
  conversation: IConversationModel,
  index: number,
  type: string
) => {
  if (isPC.value) return;
  function longPressHandler() {
    clearTimeout(timer);
    handleToggleListItem(e, conversation, index, true);
  }
  function touchStartHandler() {
    timer = setTimeout(longPressHandler, 500);
  }
  function touchEndHandler() {
    clearTimeout(timer);
  }
  switch (type) {
    case "touchstart":
      touchStartHandler();
      break;
    case "touchend":
      touchEndHandler();
      setTimeout(() => {
        isLongpressing.value = false;
      }, 200);
      break;
  }
};

// handle toggle dialog position in view end
const handleDialogPosition = (
  conversation: IConversationModel,
  index: number
) => {
  dialogTop.value = 30;
  // 以下是神奇的 uniapp 的大大大大大坑！！！！
  if (isWeChat.value) {
    // wechat：无法使用ref获取dom信息，无法使用uni.createSelectorQuery获取非自定义component外的dom信息，无法使用getElement获取dom信息
    // 所以，wechat部分获取当前整个conversationList 宽高距离 以及获取当前toggle的元素的宽高距离采用的方案为：
    // 通过点击事件，获取e.target拿到toggle位置信息。在外层自定义组件中，对整个自定义组件通过uni.createSelectorQuery拿到整个conversationList信息
    if (listRectInfo?.value?.bottom - toggleNowRectInfo?.value?.y <= 100) {
      dialogTop.value = -70;
    }
    toggleID.value = conversation.conversationID;
  } else if (isApp.value) {
    // uniapp打包为native：无法使用ref获取dom信息，可以使用uni.createSelectorQuery获取dom信息
    // 所以，native部分获取当前整个conversationList 宽高距离 以及获取当前 toggle 的元素的宽高距离采用的方案为：
    // 通过uni.createSelectorQuery，拿到当前toggle的元素的宽高距离以及整个 conversationList 宽高距离
    // uni这个api还是异步的，奇慢无比，还要等他拿到再去显示dialog
    let listRect: any, toggleRect: any;
    const query = (uni as any)?.createSelectorQuery();
    query
      .select(".TUI-conversation-list")
      .boundingClientRect((data: any) => {
        listRect = data;
      })
      .exec();
    query
      .selectAll(".TUI-conversation-content")
      .boundingClientRect((data: any) => {
        toggleRect = data[index];
        if (listRect?.bottom - toggleRect?.top - 30 <= 100) {
          dialogTop.value = -70;
        }
        toggleID.value = conversation.conversationID;
      })
      .exec();
  } else {
    // web/h5/uniapp打包h5: 正常使用ref即可
    if (
      !listRef?.value?.children ||
      index >= listRef?.value?.children?.length
    ) {
      return;
    }
    const dom = listRef?.value?.children[index];
    const domRect = dom.getBoundingClientRect();
    const listRect = listRef?.value?.getBoundingClientRect();
    if (listRect?.bottom - domRect?.top - 30 <= 100) {
      dialogTop.value = isH5.value ? -70 : -50;
    }
    toggleID.value = conversation.conversationID;
  }
};

const setToggleNowRectInfo = (info: object) => {
  toggleNowRectInfo.value = info;
};

const setListRectInfo = (info: object) => {
  listRectInfo.value = info;
};

const handleSwitchConversation = (conversationID: string) => {
  if (isLongpressing.value || toggleID.value) {
    return;
  }
  emits("handleSwitchConversation", conversationID);
  TUIConversationService.switchConversation(conversationID);
};

// web: on click outside
// web 支持整个页面维度 on click outside
// uniapp 支持整个 TUIConversation 组件维度 on click outside
const onClickOutside = (component: any) => {
  if (isUniFrameWork.value) {
    return;
  }
  document.addEventListener("mousedown", onClickDocument);
};

const onClickDocument = (e: any) => {
  if (e?.target?.className?.includes("conversation-options")) {
    return;
  } else {
    closeToggleListItem();
    removeClickListener();
  }
};

const removeClickListener = () => {
  if (isUniFrameWork.value) {
    return;
  }
  document.removeEventListener("mousedown", onClickDocument);
};

defineExpose({ setListRectInfo });
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
