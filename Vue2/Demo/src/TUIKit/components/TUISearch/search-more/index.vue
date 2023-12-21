<template>
  <div class="tui-search-more" ref="searchMoreRef">
    <div class="more" @click="toggleMore()">
      <Icon class="more-icon" :file="searchMoreSVG" width="28px" height="28px"></Icon>
    </div>
    <ul class="tui-search-more-list" v-if="isListShow">
      <li
        class="list-item"
        v-for="(extension, index) in extensionList"
        :key="index"
        @click="handleMenu(extension)"
      >
        <Icon class="list-item-icon" v-if="extension.icon" :file="extension.icon"></Icon>
        <div class="list-item-title">{{ extension.text }}</div>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onMounted } from "../../../adapter-vue";
import { TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import TUICore, { ExtensionInfo, TUIConstants } from "@tencentcloud/tui-core";
import Icon from "../../common/Icon.vue";
import searchMoreSVG from "../../../assets/icon/search-more.svg";
import { isUniFrameWork } from "../../../utils/env";

const props = defineProps({
  searchType: {
    type: String,
    default: "global", // "global":全局搜索, "conversation":会话内搜索
    validator(value: string) {
      return ["global", "conversation"].includes(value);
    },
  },
});

const searchMoreRef = ref<HTMLElement | null>();
const isListShow = ref<boolean>(false);
const toggleMore = () => {
  isListShow.value = !isListShow.value;
};
const extensionList = ref<Array<ExtensionInfo>>([]);

const handleMenu = (item: any) => {
  const { listener = { onClicked: () => { } } } = item;
  listener.onClicked(item);
  toggleMore();
};

onMounted(() => {
  // extensions
  extensionList.value = [
    ...TUICore.getExtensionList(TUIConstants.TUISearch.EXTENSION.SEARCH_MORE.EXT_ID),
  ];
  // hide conversation header
  TUICore.callService({
    serviceName: TUIConstants.TUIConversation.SERVICE.NAME,
    method: TUIConstants.TUIConversation.SERVICE.METHOD.HIDE_CONVERSATION_HEADER,
    params: {},
  })
})

watch(
  () => isListShow.value,
  () => {
    if (isListShow.value) {
      onClickOutside(searchMoreRef.value);
      TUIStore.update(StoreName.CUSTOM, "currentSearchingStatus", {
        isSearching: false,
        searchType: props.searchType,
      });
    }
  }
);

// 全局搜索dialog-点击外侧关闭
// click outside
let clickOutside = false;
let clickInner = false;
const onClickOutside = (component: any) => {
  if (isUniFrameWork) {
    return;
  }
  document.addEventListener("click", onClickDocument);
  component?.addEventListener && component?.addEventListener("click", onClickTarget);
};

const removeClickListener = (component: any) => {
  if (isUniFrameWork) {
    return;
  }
  document.removeEventListener("click", onClickDocument);
  component?.removeEventListener && component?.removeEventListener("click", onClickTarget);
};

const onClickDocument = () => {
  clickOutside = true;
  if (!clickInner && clickOutside) {
    isListShow.value = false;
  }
  clickOutside = false;
  clickInner = false;
};

const onClickTarget = () => {
  clickInner = true;
};
</script>

<style lang="scss" scoped>
.tui-search-more {
  display: flex;
  flex-direction: column;
  position: relative;
  .more {
    width: 28px;
    height: 28px;
    margin-right: 6px;
  }
  &-list {
    margin: 10px 0px;
    position: absolute;
    position: absolute;
    list-style: none;
    cursor: pointer;
    right: 6px;
    top: 20px;
    z-index: 1000;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 0px;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
    .list-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      height: 40px;
      padding: 0 10px;
      &-icon {
        margin-right: 2px;
      }
      &-title {
        font-size: 14px;
        text-wrap: nowrap;
      }
    }
  }
}
</style>
