<template>
  <div
    v-if="searchType === 'global' || (searchType === 'conversation' && isShowInConversationSearch)"
    :class="[
      'tui-search',
      !isPC && 'tui-search-h5',
      `tui-search-main-${searchType}`,
      isFullScreen && 'tui-search-h5-full-screen',
    ]"
  >
    <div
      :class="['tui-search-global', !isPC && 'tui-search-h5-global']"
      v-if="searchType === 'global'"
      ref="globalSearchRef"
    >
      <div :class="['tui-search-global-header', !isPC && 'tui-search-h5-global-header']">
        <SearchInput :searchType="searchType"></SearchInput>
        <SearchMore :searchType="searchType" v-if="isPC || !searchingStatus"></SearchMore>
      </div>
      <SearchContainer v-if="searchingStatus" popupPosition="bottom" :searchType="searchType">
        <template #result>
          <SearchResult :searchType="searchType"></SearchResult>
        </template>
      </SearchContainer>
    </div>
    <div
      :class="['tui-search-conversation', !isPC && 'tui-search-h5-conversation']"
      v-else-if="searchType === 'conversation' && isShowInConversationSearch"
    >
      <SearchContainer
        popupPosition="aside"
        :searchType="searchType"
        @closeInConversationSearch="closeInConversationSearch"
      >
        <template #input>
          <SearchInput :searchType="searchType"></SearchInput>
        </template>
        <template #result>
          <SearchResult :searchType="searchType"></SearchResult>
        </template>
      </SearchContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed, withDefaults, onBeforeUnmount } from "../../adapter-vue";
import { TUIStore, StoreName } from "@tencentcloud/chat-uikit-engine";
import SearchInput from "./search-input/index.vue";
import SearchContainer from "./search-container/index.vue";
import SearchResult from "./search-result/index.vue";
import SearchMore from "./search-more/index.vue";
import { searchMessageTypeDefault } from "./search-type-list";
import { searchMessageTimeDefault } from "./search-time-list";
import { isPC, isUniFrameWork } from "../../utils/env";
import { SEARCH_TYPE } from "./type";

const props = withDefaults(
  defineProps<{
    searchType?: SEARCH_TYPE;
  }>(),
  {
    searchType: () => (isUniFrameWork ? "conversation" : "global"),
  }
);
const globalSearchRef = ref<HTMLElement | null>();
// 当前会话
const currentConversationID = ref<string>("");
// 控制搜索状态
const searchingStatus = ref<boolean>(false);
// 是否展示指定会话内搜索: 与 TUIChat 交互，由 TUIChat MessageInputToolBar 中 "查看历史消息ICON" 控制
const isShowInConversationSearch = ref<boolean>(isUniFrameWork ? true : false);
// 是否全屏搜索 - 移动端正在搜索时全屏搜索
const isFullScreen = computed(
  () =>
    !isPC &&
    ((props.searchType === "global" && searchingStatus.value) ||
      (props.searchType === "conversation" && isShowInConversationSearch.value))
);

const initSearchValue = (searchType: SEARCH_TYPE) => {
  TUIStore.update(StoreName.CUSTOM, "currentSearchInputValue", {
    value: "",
    searchType: searchType,
  });
  TUIStore.update(StoreName.CUSTOM, "currentSearchMessageType", {
    value: searchMessageTypeDefault[searchType],
    searchType: searchType,
  });
  TUIStore.update(StoreName.CUSTOM, "currentSearchMessageTime", {
    value: searchMessageTimeDefault,
    searchType: searchType,
  });
};

onMounted(() => {
  // init with default value
  ["global", "conversation"].forEach((type: string) => {
    initSearchValue(type as SEARCH_TYPE);
  });
  // watch store change
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: (conversationID: string) => {
      if (!isUniFrameWork && currentConversationID.value !== conversationID) {
        // pc端 单页面 切换会话，关闭搜索
        closeInConversationSearch();
      }
      currentConversationID.value = conversationID;
    },
  });
  TUIStore.watch(StoreName.CUSTOM, {
    currentSearchingStatus: (value: { isSearching: boolean; searchType: string }) => {
      if (value?.searchType === props.searchType) {
        searchingStatus.value = value?.isSearching;
        // global search ui bind on click outside close
        if (value?.searchType === "global" && globalSearchRef.value) {
          value?.isSearching
            ? onClickOutside(globalSearchRef.value)
            : removeClickListener(globalSearchRef.value);
        }
      }
    },
    isShowInConversationSearch: (value: boolean) => {
      isShowInConversationSearch.value = value ? true : false;
      isShowInConversationSearch.value && initSearchValue(props.searchType);
    },
  });
});

onBeforeUnmount(() => {
  removeClickListener(globalSearchRef?.value);
});

function closeInConversationSearch() {
  TUIStore.update(StoreName.CUSTOM, "isShowInConversationSearch", false);
}

// 全局搜索dialog-点击外侧关闭
// click outside
let clickOutside = false;
let clickInner = false;
const onClickOutside = (component: any) => {
  if (isUniFrameWork || !isPC) {
    return;
  }
  document.addEventListener("click", onClickDocument);
  component?.addEventListener && component?.addEventListener("click", onClickTarget);
};

const removeClickListener = (component: any) => {
  if (isUniFrameWork || !isPC) {
    return;
  }
  document.removeEventListener("click", onClickDocument);
  component?.removeEventListener && component?.removeEventListener("click", onClickTarget);
};

const onClickDocument = () => {
  clickOutside = true;
  if (!clickInner && clickOutside) {
    TUIStore.update(StoreName.CUSTOM, "currentSearchingStatus", {
      isSearching: false,
      searchType: props.searchType,
    });
    removeClickListener(globalSearchRef?.value);
  }
  clickOutside = false;
  clickInner = false;
};

const onClickTarget = () => {
  clickInner = true;
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
