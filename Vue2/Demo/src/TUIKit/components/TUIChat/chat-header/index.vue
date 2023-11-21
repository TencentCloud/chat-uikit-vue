<template>
  <div :class="['chat-header', !isPC && 'chat-header-h5']">
    <div
      v-show="!isPC"
      :class="['chat-header-back', !isPC && 'chat-header-h5-back']"
      @click="closeChat(currentConversation.conversationID)"
    >
      <Icon :file="backSVG"></Icon>
    </div>
    <div :class="['chat-header-content', !isPC && 'chat-header-h5-content']">
      {{ currentConversationName }}
    </div>
    <div :class="['chat-header-setting', !isPC && 'chat-header-h5-setting']">
      <div
        v-for="(item, index) in extensions"
        :key="index"
        @click.stop="handleExtensions(item)">
        <Icon :file="item.icon"></Icon>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IConversationModel,
} from "@tencentcloud/chat-uikit-engine";
import TUICore, { TUIConstants, ExtensionInfo } from "@tencentcloud/tui-core";
import { ref } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import backSVG from "../../../assets/icon/back.svg";
import { isPC } from "../../../utils/env";

const emits = defineEmits(["closeChat"]);
const currentConversation = ref<IConversationModel>();
const currentConversationName = ref("");
const typingStatus = ref(false);
const groupID = ref("");
const extensions = ref<ExtensionInfo>([])

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    const isGroup = conversation?.type === TUIChatEngine.TYPES.CONV_GROUP;
    if (isGroup && currentConversation.value?.conversationID !== conversation?.conversationID) {
      extensions.value = TUICore.getExtensionList(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, { filterManageGroup: isGroup });
    }
    if (!isGroup) {
      extensions.value = [];
    }
    currentConversation.value = conversation;
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
        currentConversationName.value =
          currentConversation?.value?.getShowName();
        break;
    }
  },
});

const closeChat = (conversationID: string) => {
  emits("closeChat", conversationID);
};

const handleExtensions = (item: ExtensionInfo) => {
  item.listener.onClicked({groupID: groupID.value});
}

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
