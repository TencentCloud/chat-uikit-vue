<template>
  <BottomPopup :show="showAtList" @onClose="closeAt">
    <div
      :class="[isPC ? 'message-input-at' : 'message-input-at-h5']"
      ref="MessageInputAt"
    >
      <div class="memberList" ref="dialog">
        <header class="memberList-title" v-if="!isPC">
          <span class="title">{{
            TUITranslateService.t("TUIChat.选择提醒的人")
          }}</span>
        </header>
        <ul class="memberList-box">
          <li
            class="memberList-box-body"
            :class="[index === selectedIndex && 'selected']"
            v-for="(item, index) in showMemberList"
            :key="index"
            @click="selectItem(index)"
            ref="memberListItems"
          >
            <img
              class="memberList-box-body-avatar"
              :src="handleMemberAvatar(item)"
            />
            <span class="memberList-box-body-name">{{
              handleMemberName(item)
            }}</span>
          </li>
        </ul>
      </div>
    </div>
  </BottomPopup>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIGlobal,
  TUIStore,
  StoreName,
  TUIGroupService,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import { ref, watch } from "../../../../adapter-vue";
import BottomPopup from "../../../common/BottomPopup/index.vue";

const emits = defineEmits(["onAtListOpen", "insertAt"]);

const MessageInputAt = ref();
const memberListItems = ref();

const showAtList = ref(false);
const memberList = ref<Array<any>>();
const allMemberList = ref<Array<any>>();
const showMemberList = ref<Array<any>>();
const isGroup = ref(false);
const position = ref({
  left: 0,
  top: 0,
});
const selectedIndex = ref(0);
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const currentConversationID = ref("");


const all = {
  userID: TUIChatEngine.TYPES.MSG_AT_ALL,
  nick: "所有人",
  isAll: true,
  avatar: "https://web.sdk.qcloud.com/im/assets/images/at.svg",
};

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    if (id !== currentConversationID.value) {
      currentConversationID.value = id;
      memberList.value = [];
      allMemberList.value = [];
      showMemberList.value = [];
      isGroup.value = false;
      TUIStore.update(StoreName.CUSTOM, "memberList", memberList.value);
      if (currentConversationID?.value?.startsWith("GROUP")) {
        isGroup.value = true;
        const groupID = currentConversationID?.value?.substring(5);
        TUIGroupService.switchGroup(groupID);
      }
    }
  },
});

TUIStore.watch(StoreName.GRP, {
  currentGroupMemberList: (list: Array<any>) => {
    memberList.value = list;
    allMemberList.value = [all, ...memberList.value];
    showMemberList.value = allMemberList.value;
    TUIStore.update(StoreName.CUSTOM, "memberList", memberList.value);
  },
});

const toggleAtList = (show: boolean) => {
  if (!isGroup.value) {
    return;
  }
  showAtList.value = show;
  if (showAtList.value) {
    emits("onAtListOpen");
  }
};
const handleAtListPosition = (positionData: { top: number; left: number }) => {
  position.value = positionData;
};
const setCurrentSelectIndex = (index: any) => {
  selectedIndex.value = index;
  memberListItems?.value[selectedIndex.value]?.scrollIntoView(false);
};
const setShowMemberList = (list: any) => {
  showMemberList.value = list;
};

TUIGlobal.toggleAtList = toggleAtList;
TUIGlobal.handleAtListPosition = handleAtListPosition;
TUIGlobal.setCurrentSelectIndex = setCurrentSelectIndex;
TUIGlobal.setShowMemberList = setShowMemberList;

defineExpose({
  toggleAtList,
});

watch(
  () => [position.value, MessageInputAt?.value],
  () => {
    if (isH5.value || !MessageInputAt?.value || !MessageInputAt?.value?.style) {
      return;
    }
    MessageInputAt.value.style.left = position.value.left + "px";
    MessageInputAt.value.style.top =
      position.value.top - MessageInputAt.value.clientHeight + "px";
  }
);

const closeAt = () => {
  showAtList.value = false;
  showMemberList.value = allMemberList.value;
  position.value = {
    left: 0,
    top: 0,
  };
};

const selectItem = (index: number) => {
  if (TUIGlobal.selectItem) {
    TUIGlobal.selectItem(index);
  } else {
    if (showMemberList?.value?.length) {
      const item = showMemberList?.value[index];
      emits("insertAt", {
        id: (item as any)?.userID,
        label: (item as any)?.nick || (item as any)?.userID,
      });
    }
  }
  closeAt();
};

const handleMemberAvatar = (item: any) => {
  return (
    (item as any)?.avatar ||
    "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png"
  );
};

const handleMemberName = (item: any) => {
  return (item as any)?.nick ? (item as any)?.nick : (item as any)?.userID;
};
</script>
<style scoped lang="scss">
@import url("../../../../assets/styles/common.scss");
.message-input-at {
  position: fixed;
  max-width: 15rem;
  max-height: 10rem;
  overflow-x: hidden;
  overflow-y: auto;
  background: #ffffff;
  box-shadow: 0 0.06rem 0.63rem 0 rgba(2, 16, 43, 0.15);
  border-radius: 0.13rem;
}
.memberList-box {
  &-header {
    height: 2.5rem;
    padding-top: 5px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 110, 255, 0.1);
    }
  }
  span {
    font-family: PingFangSC-Regular;
    font-weight: 400;
    font-size: 12px;
    color: #000000;
    letter-spacing: 0;
    padding: 5px;
  }
  &-body {
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    .selected,
    &:hover {
      background: rgba(0, 110, 255, 0.1);
    }
    &-name {
      overflow: hidden;
      white-space: nowrap;
      word-wrap: break-word;
      word-break: break-all;
      text-overflow: ellipsis;
    }
    &-avatar {
      width: 20px;
      height: 20px;
      padding-left: 10px;
    }
  }
  .selected {
    background: rgba(0, 110, 255, 0.1);
  }
}

.message-input-at-h5 {
  .memberList {
    height: auto;
    max-height: 500px;
    width: 100%;
    max-width: 100%;
    background: white;
    border-radius: 12px 12px 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    &-title {
      height: fit-content;
      width: calc(100% - 30px);
      text-align: center;
      vertical-align: middle;
      padding: 15px;
      .title {
        vertical-align: middle;
        display: inline-block;
        font-size: 16px;
      }
      .close {
        vertical-align: middle;
        position: absolute;
        right: 10px;
        display: inline-block;
      }
    }
    &-box {
      flex: 1;
      overflow-y: scroll;
      &-body {
        padding: 10px;
        img {
          width: 26px;
          height: 26px;
        }
        span {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
