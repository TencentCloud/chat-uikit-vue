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
const currentConversationID = ref<string>('');
const searchingStatus = ref<boolean>(false);
// Whether to display the search in the chat
const isShowInConversationSearch = ref<boolean>(isUniFrameWork);
// Whether to search in full screen - Search in full screen when the mobile terminal is searching
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
    // PC side single page switch session, close search
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
      value.isSearching ? TUIGlobal?.hideTabBar()?.catch(() => { /* ignore */ }) : TUIGlobal?.showTabBar()?.catch(() => { /* ignore */ });
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
