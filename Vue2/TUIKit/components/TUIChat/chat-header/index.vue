<template>
  <div :class="['chat-header', !isPC && 'chat-header-h5']">
    <div v-show="!isPC" :class="['chat-header-back', !isPC && 'chat-header-h5-back']"
      @click="closeChat(currentConversation.conversationID)">
      <Icon :file="backSVG"></Icon>
    </div>
    <div :class="['chat-header-content', !isPC && 'chat-header-h5-content']">
      {{ currentConversationName }}
    </div>
    <div :class="['chat-header-setting', !isPC && 'chat-header-h5-setting']">
      <div @click="showGroupDetails" v-if="isGroup">
        <Icon :file="settingSVG"></Icon>
      </div>
      <ManageGroup v-if="showGroupDialog" :groupID="groupID" @showGroupDetails="showGroupDetails"></ManageGroup>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  TUIGlobal,
  TUIStore,
  StoreName,
  TUITranslateService,
  TUIGroupService,
  IConversationModel
} from "@tencentcloud/chat-uikit-engine";
import { ref, defineEmits } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import backSVG from "../../../assets/icon/back.svg";
import settingSVG from "../../../assets/icon/setting.svg";
import ManageGroup from "../../TUIGroup/manage-group/index.vue";

const emits = defineEmits(["closeChat"]);
const isPC = ref(TUIGlobal.getPlatform() === "pc");
const currentConversation = ref<IConversationModel>();
const currentConversationName = ref("");
const typingStatus = ref(false);
const isGroup = ref(false);
const groupID = ref('');
const conversationType = ref('GROUP');
const showGroupDialog = ref(false);
const groupCurrentTab = ref('');

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    currentConversation.value = conversation;
    isGroup.value = currentConversation.value?.type === conversationType.value;
    if(groupID.value !== currentConversation.value?.groupProfile?.groupID) {
      showGroupDialog.value = false;
      // 清空对应群组信息
      TUIGroupService.switchGroup();
    }
    groupID.value = currentConversation.value?.groupProfile?.groupID;
    currentConversationName.value = currentConversation?.value?.getShowName();
  },
});
TUIStore.watch(StoreName.CHAT, {
  typingStatus: (status: boolean) => {
    typingStatus.value = status;
    switch (typingStatus.value) {
      case true:
        currentConversationName.value =
          TUITranslateService.t("TUIChat.对方正在输入");
        break;
      case false:
        currentConversationName.value = currentConversation?.value?.getShowName();
        break;
    }
  },
});

const closeChat = (conversationID: string) => {
  emits("closeChat", conversationID);
};

const showGroupDetails = () => {
  showGroupDialog.value = !showGroupDialog.value;
  if (!showGroupDialog.value) {
    groupCurrentTab.value = '';
    TUIGroupService.switchGroup();
  }
  if (showGroupDialog.value) {
    TUIGroupService.switchGroup(groupID.value);
  }
};

</script>
<style lang="scss" scoped>
.chat-header {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  &-content {
    flex: 1;
    font-size: 16px;
    line-height: 30px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    color: #000;
    letter-spacing: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &-back,
  &-setting {
    width: 27px;
    height: 27px;

    .icon {
      width: 100%;
      height: 100%;
    }
  }
}

.chat-header-h5 {
  &-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
