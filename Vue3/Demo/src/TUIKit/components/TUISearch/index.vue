<template>
  <div
    v-if="
      searchType === 'global' ||
        ((searchType === 'conversation' || (!searchType && isUniFrameWork)) &&
          isShowInConversationSearch)
    "
    :class="[
      'tui-search',
      !isPC && 'tui-search-h5',
      `tui-search-main-${searchType ? searchType : 'conversation'}`,
      isFullScreen && 'tui-search-h5-full-screen',
    ]"
  >
    <div
      v-if="searchType === 'global'"
      ref="globalSearchRef"
      :class="['tui-search-global', !isPC && 'tui-search-h5-global']"
    >
      <div
        :class="[
          'tui-search-global-header',
          !isPC && 'tui-search-h5-global-header',
        ]"
      >
        <SearchInput
          class="search-input"
          :searchType="searchType"
        />
        <SearchMore
          v-if="isPC || !searchingStatus"
          class="search-more"
          :searchType="searchType"
        />
      </div>
      <SearchContainer
        v-if="searchingStatus"
        class="search-container"
        popupPosition="bottom"
        :searchType="searchType"
      >
        <template #result>
          <SearchResult
            class="search-result"
            :searchType="searchType"
          />
        </template>
      </SearchContainer>
    </div>
    <div
      v-else-if="
        (searchType === 'conversation' && isShowInConversationSearch) ||
          isUniFrameWork
      "
      :class="[
        'tui-search-conversation',
        !isPC && 'tui-search-h5-conversation',
      ]"
    >
      <SearchContainer
        class="search-container"
        popupPosition="aside"
        :searchType="searchType ? searchType : 'conversation'"
        @closeInConversationSearch="closeInConversationSearch"
      >
        <template #input>
          <SearchInput
            :searchType="searchType ? searchType : 'conversation'"
          />
        </template>
        <template #result>
          <SearchResult
            class="search-result"
            :searchType="searchType ? searchType : 'conversation'"
          />
        </template>
      </SearchContainer>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  onMounted,
  computed,
  withDefaults,
  onUnmounted,
} from '../../adapter-vue';
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal, outsideClick } from '@tencentcloud/universal-api';
import SearchInput from './search-input/index.vue';
import SearchContainer from './search-container/index.vue';
import SearchResult from './search-result/index.vue';
import SearchMore from './search-more/index.vue';
import { searchMessageTypeDefault } from './search-type-list';
import { searchMessageTimeDefault } from './search-time-list';
import { isPC, isUniFrameWork } from '../../utils/env';
import { ISearchingStatus, SEARCH_TYPE } from './type';

const props = withDefaults(
  defineProps<{
    searchType?: SEARCH_TYPE;
  }>(),
  {
    searchType: () => {
      return isUniFrameWork ? 'conversation' : 'global';
    },
  },
);
const globalSearchRef = ref<HTMLElement | null>();
// 当前会话
const currentConversationID = ref<string>('');
// 控制搜索状态
const searchingStatus = ref<boolean>(false);
// 是否展示指定会话内搜索: 与 TUIChat 交互，由 TUIChat MessageInputToolBar 中 "查看历史消息ICON" 控制
const isShowInConversationSearch = ref<boolean>(isUniFrameWork);
// 是否全屏搜索 - 移动端正在搜索时全屏搜索
const isFullScreen = computed(
  () =>
    !isPC
    && ((props.searchType === 'global' && searchingStatus.value)
    || (props.searchType === 'conversation' && isShowInConversationSearch.value)),
);

const initSearchValue = (searchType: SEARCH_TYPE) => {
  TUIStore.update(StoreName.SEARCH, 'currentSearchInputValue', {
    value: '',
    searchType: searchType,
  });
  TUIStore.update(StoreName.SEARCH, 'currentSearchMessageType', {
    value: searchMessageTypeDefault[searchType],
    searchType: searchType,
  });
  TUIStore.update(StoreName.SEARCH, 'currentSearchMessageTime', {
    value: searchMessageTimeDefault,
    searchType: searchType,
  });
};

function onCurrentConversationIDUpdate(conversationID: string) {
  if (!isUniFrameWork && currentConversationID.value !== conversationID) {
    // pc端 单页面 切换会话，关闭搜索
    closeInConversationSearch();
  }
  currentConversationID.value = conversationID;
}

function onCurrentSearchingStatusChange(value: ISearchingStatus) {
  if (value?.searchType === props.searchType) {
    searchingStatus.value = value?.isSearching;
    // global search ui bind on click outside close
    if (value?.searchType === 'global' && globalSearchRef.value) {
      if (isPC && value.isSearching) {
        outsideClick.listen({
          domRefs: globalSearchRef.value,
          handler: closeGlobalSearch,
        });
      }
    }
    if (value?.searchType === 'global' && isUniFrameWork) {
      // hide tab bar in uni-app when global searching
      try {
        value.isSearching ? TUIGlobal?.hideTabBar() : TUIGlobal?.showTabBar();
      } catch { /* empty */ }
    }
  }
}

function onIsShowInConversationSearchChange(value: boolean) {
  isShowInConversationSearch.value = value ? true : false;
  isShowInConversationSearch.value && initSearchValue(props.searchType);
}

onMounted(() => {
  // init with default value
  ['global', 'conversation'].forEach((type: string) => {
    initSearchValue(type as SEARCH_TYPE);
  });
  // watch store change
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdate,
  });
  TUIStore.watch(StoreName.SEARCH, {
    currentSearchingStatus: onCurrentSearchingStatusChange,
    isShowInConversationSearch: onIsShowInConversationSearchChange,
  });
});

onUnmounted(() => {
  // unwatch store change
  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdate,
  });
  TUIStore.unwatch(StoreName.SEARCH, {
    currentSearchingStatus: onCurrentSearchingStatusChange,
    isShowInConversationSearch: onIsShowInConversationSearchChange,
  });
});

function closeGlobalSearch() {
  TUIStore.update(StoreName.SEARCH, 'currentSearchingStatus', {
    isSearching: false,
    searchType: props.searchType,
  });
}

function closeInConversationSearch() {
  TUIStore.update(StoreName.SEARCH, 'isShowInConversationSearch', false);
}
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
