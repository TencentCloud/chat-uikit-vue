<template>
  <div
    v-if="isShowSearch"
    :class="[
      'tui-search',
      !isPC && 'tui-search-h5',
      `tui-search-main-${currentSearchType}`,
      isFullScreen && 'tui-search-h5-full-screen',
    ]"
  >
    <div
      v-if="currentSearchType === 'global'"
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
          :searchType="currentSearchType"
        />
        <SearchMore
          v-if="isPC || !searchingStatus"
          class="search-more"
          :searchType="currentSearchType"
        />
      </div>
      <SearchContainer
        v-if="searchingStatus"
        class="search-container"
        popupPosition="bottom"
        :searchType="currentSearchType"
      >
        <template #result>
          <SearchResult
            class="search-result"
            :searchType="currentSearchType"
          />
        </template>
      </SearchContainer>
    </div>
    <div
      v-else-if="
        (currentSearchType === 'conversation' && isShowInConversationSearch) ||
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
        :searchType="currentSearchType"
        @closeInConversationSearch="closeInConversationSearch"
      >
        <template #input>
          <SearchInput
            :searchType="currentSearchType"
          />
        </template>
        <template #result>
          <SearchResult
            class="search-result"
            :searchType="currentSearchType"
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
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine-lite';
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
      return 'global';
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
    && ((currentSearchType.value === 'global' && searchingStatus.value)
    || (currentSearchType.value === 'conversation' && isShowInConversationSearch.value)),
);

const isShowSearch = computed(() => {
  return currentSearchType.value === 'global'
    || ((currentSearchType.value === 'conversation' || (!currentSearchType.value && isUniFrameWork))
    && isShowInConversationSearch.value);
});

const currentSearchType = computed(() => {
  if (isUniFrameWork && currentConversationID.value) {
    return 'conversation';
  }
  return props.searchType;
});

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
  TUIStore.update(StoreName.SEARCH, 'currentSearchingStatus', {
    isSearching: false,
    searchType: currentSearchType.value,
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
  if (value?.searchType === currentSearchType.value) {
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
  isShowInConversationSearch.value && initSearchValue(currentSearchType.value);
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
    searchType: currentSearchType.value,
  });
}

function closeInConversationSearch() {
  TUIStore.update(StoreName.SEARCH, 'isShowInConversationSearch', false);
}
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
