<template>
  <div class="conversation" @click="closeSearchDialog">
    <TUISearch
      v-if="isUniFrameWork"
      :isRelation="false"
      :isShowSearchDialog="isShowSearchDialog"
      @handleSwitchConversation="handleSwitchConversation"
    ></TUISearch>
    <div :class="['TUI-conversation', isH5 && 'TUI-conversation-h5']">
      <div class="network" v-if="isNetwork">
        <i class="icon icon-error">!</i>
        <p class="network-content">
          {{
            TUITranslateService.t("TUIConversation.网络异常，请您检查网络设置")
          }}
        </p>
      </div>
      <div class="list">
        <ConversationList
          class="list"
          ref="list"
          :displayOnlineStatus="displayOnlineStatus"
          @handleSwitchConversation="handleSwitchConversation"
          @touchstart="getListRectInfo"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIStore,
  TUIGlobal,
  StoreName,
  IConversationModel,
  TUITranslateService,
  TUIConversationService,
} from "@tencentcloud/chat-uikit-engine";
import {
  computed,
  ref,
  defineProps,
  onMounted,
  nextTick,
  getCurrentInstance,
} from "../../adapter-vue";
import ConversationList from "./conversation-list/index.vue";
import TUISearch from "../TUISearch/index.vue";

const props = defineProps({
  displayOnlineStatus: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(["handleSwitchConversation"]);

const listRef = ref();
const totalUnreadCount = ref(0);
const netWork = ref("");
const isShowSearchDialog = ref(false);
// const listRectInfo = ref({});
const isH5 = ref(TUIGlobal.getPlatform() === "h5");
const isApp = ref(TUIGlobal.getPlatform() === "app");
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");
const isUniFrameWork = ref(typeof uni !== "undefined");

TUIStore.watch(StoreName.CONV, {
  totalUnreadCount: (count: number) => {
    totalUnreadCount.value = count;
  },
});

const isNetwork = computed(() => {
  const disconnected =
    netWork.value === TUIChatEngine.TYPES.NET_STATE_DISCONNECTED;
  const connecting = netWork.value === TUIChatEngine.TYPES.NET_STATE_CONNECTING;
  return disconnected || connecting;
});

const handleSwitchConversation = (conversationID: string) => {
  if (isUniFrameWork.value)
    uni.navigateTo({
      url: "/TUIKit/components/TUIChat/index",
    });
  emits("handleSwitchConversation", conversationID);
};

const getListRectInfo = (e: any) => {
  if (isApp.value || isWeChat.value) {
    const query = (uni as any)?.createSelectorQuery();
    query
      .select(".list")
      .boundingClientRect((data: any) => {
        listRef?.value?.setListRectInfo(data);
      })
      .exec();
  }
};

const closeSearchDialog = () => {
  isShowSearchDialog.value = false;
};
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
