<template>
  <SearchResultLoading
    v-if="isLoading"
    :class="['search-result-loading', !isPC && 'search-result-loading-h5']"
  />
  <SearchResultDefault
    v-else-if="isSearchDefaultShow"
    :class="['search-result-default', !isPC && 'search-result-default-h5']"
  />
  <div
    v-else
    :class="[
      'tui-search-result',
      !isPC && 'tui-search-result-h5',
      isPC && isResultDetailShow && 'tui-search-result-with-border',
    ]"
  >
    <div
      v-if="props.searchType !== 'conversation' && (isPC || !isResultDetailShow)"
      class="tui-search-result-main"
    >
      <div class="tui-search-result-list">
        <div
          v-for="result in searchResult"
          :key="result.key"
          class="tui-search-result-list-item"
        >
          <div
            v-if="props.searchType === 'global'"
            class="header"
          >
            {{ TUITranslateService.t(`TUISearch.${result.label}`) }}
          </div>
          <div class="list">
            <div
              v-for="item in result.list"
              :key="item.conversation.conversationID"
              :class="[generateListItemClass(item)]"
            >
              <SearchResultItem
                v-if="result.key === 'contact' || result.key === 'group' || item.conversation"
                :listItem="item"
                :type="result.key"
                displayType="info"
                :keywordList="keywordList"
                @showResultDetail="showResultDetail"
                @navigateToChatPosition="navigateToChatPosition"
              />
            </div>
          </div>
          <div
            v-if="currentSearchTabKey === 'all' || result.cursor"
            class="more"
            @click="getMoreResult(result)"
          >
            <Icon
              class="more-icon"
              :file="searchIcon"
              width="12px"
              height="12px"
            />
            <div class="more-text">
              <span>{{ TUITranslateService.t("TUISearch.查看更多") }}</span>
              <span>{{ TUITranslateService.t(`TUISearch.${result.label}`) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="isResultDetailShow || props.searchType === 'conversation'"
      :class="[
        'tui-search-result-detail',
        props.searchType === 'conversation' && 'tui-search-result-in-conversation',
      ]"
    >
      <SearchResultLoading
        v-if="isSearchDetailLoading"
        :class="['search-result-loading', !isPC && 'search-result-loading-h5']"
      />
      <div
        v-if="!isSearchDetailLoading && isResultDetailShow && props.searchType !== 'conversation'"
        class="tui-search-message-header"
      >
        <div class="header-content">
          <div class="header-content-count normal">
            <span>{{ searchConversationMessageTotalCount }}</span>
            <span>{{ TUITranslateService.t("TUISearch.条与") }}</span>
          </div>
          <div class="header-content-keyword">
            <span
              v-for="(keyword, index) in keywordList"
              :key="index"
            >
              <span class="normal">"</span>
              <span class="highlight">{{ keyword }}</span>
              <span class="normal">"</span>
            </span>
          </div>
          <div class="header-content-type normal">
            <span>{{
              TUITranslateService.t("TUISearch.相关的")
            }}</span>
            <span>{{
              TUITranslateService.t(
                `TUISearch.${currentSearchTabKey === "allMessage"
                  ? "结果"
                  : searchMessageTypeList[currentSearchTabKey].label
                }`
              )
            }}</span>
          </div>
        </div>
        <div
          class="header-enter"
          @click="enterConversation({ conversationID: currentSearchConversationID })"
        >
          <span>{{ TUITranslateService.t("TUISearch.进入聊天") }}</span>
          <Icon
            class="enter-icon"
            :file="enterIcon"
            width="14px"
            height="14px"
          />
        </div>
      </div>
      <div
        v-if="!isSearchDetailLoading &&
          searchConversationMessageList &&
          searchConversationMessageList[0]
        "
        class="tui-search-message-list"
      >
        <template
          v-if="props.searchType === 'global' ||
            (currentSearchTabKey !== 'imageMessage' && currentSearchTabKey !== 'fileMessage')
          "
        >
          <div
            v-for="item in searchConversationMessageList"
            :key="generateVueRenderKey(item.ID)"
            :class="['list-item']"
          >
            <SearchResultItem
              :listItem="item"
              :listItemContent="item.getMessageContent()"
              :type="currentSearchTabKey"
              :displayType="generateResultItemDisplayType()"
              :keywordList="keywordList"
              @showResultDetail="showResultDetail"
              @navigateToChatPosition="navigateToChatPosition"
            />
          </div>
        </template>
        <!-- Search within a conversation - messages such as files, pictures, and videos need to be displayed in groups according to time -->
        <template v-else>
          <div
            v-for="group in searchConversationResultGroupByDate"
            :key="generateVueRenderKey(group.date)"
            :class="['list-group', currentSearchTabKey === 'fileMessage'? 'list-group-file' : 'list-group-image']"
          >
            <div :class="['list-group-date']">
              {{ group.date }}
            </div>
            <div
              v-for="item in group.list"
              :key="generateVueRenderKey(item.ID)"
              :class="['list-group-item']"
            >
              <SearchResultItem
                :listItem="item"
                :listItemContent="item.getMessageContent()"
                :type="currentSearchTabKey"
                :displayType="generateResultItemDisplayType()"
                :keywordList="keywordList"
                @showResultDetail="showResultDetail"
                @navigateToChatPosition="navigateToChatPosition"
              />
            </div>
          </div>
        </template>
        <div
          v-if="searchConversationResult && searchConversationResult.cursor"
          class="more"
          @click="getMoreResultInConversation"
        >
          <Icon
            class="more-icon"
            :file="searchIcon"
            width="12px"
            height="12px"
          />
          <div class="more-text">
            {{ TUITranslateService.t("TUISearch.查看更多历史记录") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from '../../../adapter-vue';
import {
  TUITranslateService,
  TUIConversationService,
  TUIStore,
  StoreName,
  IMessageModel,
  SearchCloudMessagesParams,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import SearchResultItem from './search-result-item/index.vue';
import SearchResultDefault from './search-result-default/index.vue';
import SearchResultLoading from './search-result-loading/index.vue';
import { searchMessageTypeList, searchMessageTypeDefault } from '../search-type-list';
import Icon from '../../common/Icon.vue';
import searchIcon from '../../../assets/icon/search.svg';
import enterIcon from '../../../assets/icon/right-icon.svg';
import {
  searchCloudMessages,
  enterConversation,
  generateSearchResultYMD,
  debounce,
} from '../utils';
import { enableSampleTaskStatus } from '../../../utils/enableSampleTaskStatus';
import { isPC, isUniFrameWork } from '../../../utils/env';
import { SEARCH_TYPE, ISearchInputValue, ISearchMessageType, ISearchMessageTime } from '../type';
import { ISearchCloudMessageResult, ISearchResultListItem } from '../../../interface';

const props = defineProps({
  searchType: {
    type: String,
    default: 'global', // "global" / "conversation"
    validator(value: string) {
      return ['global', 'conversation'].includes(value);
    },
  },
});

// search params
const keywordList = ref<string[]>([]);
const messageTypeList = ref<string | string[]>(
  searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.value as string[],
);
const timePosition = ref<number>(0);
const timePeriod = ref<number>(0);
// Search by "and" after splitting the whole string by space
// For example: enter "111 222", search for messages with both 111 and 222, and also include messages that strictly search for "111 222"
const keywordListMatchType = ref<string>('and');

// current search tab key
const currentSearchTabKey = ref<string>(
  searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.key,
);

// search results all
const searchResult = ref<{
  [propsName: string]: { key: string; label: string; list: ISearchResultListItem[]; cursor: string | null };
}>({});
const searchAllMessageList = ref<ISearchResultListItem[]>([]);
const searchAllMessageTotalCount = ref<number>(0);

// search results detail
const currentSearchConversationID = ref<string>('');
const searchConversationResult = ref<ISearchCloudMessageResult>();
const searchConversationMessageList = ref<IMessageModel[]>([]);
const searchConversationMessageTotalCount = ref<number>();

// search results for file messages/image and video messages, grouped by timeline
const searchConversationResultGroupByDate = ref<
  Array<{ date: string; list: IMessageModel[] }>
>([]);

// ui display control
const isResultDetailShow = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isSearchDetailLoading = ref<boolean>(false);
const isSearchDefaultShow = computed((): boolean => {
  if (isLoading.value) {
    return false;
  }
  if (props.searchType === 'global') {
    if (!keywordList?.value?.length || Object?.keys(searchResult.value)?.length) {
      return false;
    } else {
      return true;
    }
  } else {
    if (searchConversationMessageList?.value?.length) {
      return false;
    } else {
      return true;
    }
  }
});

function onCurrentConversationIDUpdate(id: string) {
  props.searchType === 'conversation' && (currentSearchConversationID.value = id);
}

function onCurrentSearchInputValueUpdate(obj: ISearchInputValue) {
  if (obj?.searchType === props?.searchType) {
    keywordList.value = obj?.value ? obj.value.trim().split(/\s+/) : [];
  }
}

function onCurrentSearchMessageTypeUpdate(typeObject: ISearchMessageType) {
  if (typeObject?.searchType === props?.searchType) {
    currentSearchTabKey.value
        = typeObject?.value?.key || searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.key;
    messageTypeList.value
        = typeObject?.value?.value
        || searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.value;
  }
}

function onCurrentSearchMessageTimeUpdate(timeObject: ISearchMessageTime) {
  if (timeObject?.searchType === props?.searchType) {
    timePosition.value = timeObject?.value?.value?.timePosition;
    timePeriod.value = timeObject?.value?.value?.timePeriod;
  }
}

onMounted(() => {
  TUIStore.watch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdate,
  });
  TUIStore.watch(StoreName.SEARCH, {
    currentSearchInputValue: onCurrentSearchInputValueUpdate,
    currentSearchMessageType: onCurrentSearchMessageTypeUpdate,
    currentSearchMessageTime: onCurrentSearchMessageTimeUpdate,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.CONV, {
    currentConversationID: onCurrentConversationIDUpdate,
  });
  TUIStore.unwatch(StoreName.SEARCH, {
    currentSearchInputValue: onCurrentSearchInputValueUpdate,
    currentSearchMessageType: onCurrentSearchMessageTypeUpdate,
    currentSearchMessageTime: onCurrentSearchMessageTimeUpdate,
  });
});

const setMessageSearchResultList = (option?: { conversationID?: string | undefined; cursor?: string | undefined }) => {
  searchCloudMessages(
    {
      keywordList: keywordList?.value?.length ? keywordList.value : undefined,
      messageTypeList: typeof messageTypeList.value === 'string' ? [messageTypeList.value] : messageTypeList.value,
      timePosition: timePosition.value,
      timePeriod: timePeriod.value,
      conversationID: option?.conversationID || undefined,
      cursor: option?.cursor || undefined,
      keywordListMatchType: keywordListMatchType.value,
    } as SearchCloudMessagesParams,
  )
    .then((res: { data: ISearchCloudMessageResult }) => {
      enableSampleTaskStatus('searchCloudMessage');
      if (!option?.conversationID) {
        option?.cursor
          ? (searchAllMessageList.value = [
              ...searchAllMessageList.value,
              ...res.data.searchResultList,
            ])
          : (searchAllMessageList.value = res?.data?.searchResultList);
        searchAllMessageTotalCount.value = res?.data?.totalCount;
        const key = currentSearchTabKey.value === 'all' ? 'allMessage' : currentSearchTabKey.value;
        if (
          searchAllMessageList?.value?.length
          && currentSearchTabKey.value !== 'contact'
          && currentSearchTabKey.value !== 'group'
        ) {
          searchResult.value = Object.assign({}, searchResult.value, {
            [key]: {
              key,
              label: searchMessageTypeList[key].label,
              list: currentSearchTabKey.value === 'all'
                ? searchAllMessageList?.value?.slice(0, 3)
                : searchAllMessageList?.value,
              cursor: res?.data?.cursor || null,
            },
          });
        } else {
          delete searchResult?.value[key];
        }
      } else {
        searchConversationResult.value = res?.data;
        option?.cursor
          ? (searchConversationMessageList.value = [
              ...searchConversationMessageList.value,
              ...(res?.data?.searchResultList[0]?.messageList as IMessageModel[]),
            ])
          : (searchConversationMessageList.value = res?.data?.searchResultList[0]?.messageList);
        searchConversationMessageTotalCount.value = res?.data?.totalCount;
        if (
          props?.searchType === 'conversation'
          && (currentSearchTabKey.value === 'fileMessage'
          || currentSearchTabKey.value === 'imageMessage')
        ) {
          searchConversationResultGroupByDate.value = groupResultListByDate(
            searchConversationMessageList.value,
          );
        } else {
          searchConversationResultGroupByDate.value = [];
        }
      }
      isLoading.value = false;
      isSearchDetailLoading.value = false;
    });
};

const setMessageSearchResultListDebounce = debounce(setMessageSearchResultList, 500);

const resetSearchResult = () => {
  searchResult.value = {};
  searchConversationResult.value = {} as ISearchCloudMessageResult;
  searchConversationMessageList.value = [];
  searchConversationResultGroupByDate.value = [];
};

watch(
  () => [keywordList.value, currentSearchTabKey.value, timePosition.value, timePeriod.value],
  (newValue, oldValue) => {
    if (newValue === oldValue) {
      return;
    }
    // Global search must have keywords, but search in conversation can be without keywords
    if (!keywordList?.value?.length && props?.searchType === 'global') {
      resetSearchResult();
      return;
    }
    isLoading.value = true;
    if (props.searchType === 'conversation') {
      resetSearchResult();
      setMessageSearchResultList({
        conversationID: currentSearchConversationID.value,
      });
    } else {
      if (oldValue && oldValue[1] === 'all' && newValue && newValue[1] === 'allMessage') {
        searchResult?.value['allMessage']?.list
        && (searchResult.value['allMessage'].list = searchAllMessageList?.value);
        Object?.keys(searchResult?.value)?.forEach((key: string) => {
          if (key !== 'allMessage') {
            delete searchResult?.value[key];
          }
        });
        isLoading.value = false;
        return;
      } else {
        isResultDetailShow.value = false;
        resetSearchResult();
      }
      setMessageSearchResultListDebounce();
    }
  },
  { immediate: true },
);

const getMoreResult = (result: { key: string; label: string; list: ISearchResultListItem[]; cursor: string | null }) => {
  if (currentSearchTabKey.value === 'all') {
    // View more at this time: Switch to the result corresponding to the corresponding result to display the full search results of its type
    TUIStore.update(StoreName.SEARCH, 'currentSearchMessageType', {
      value: searchMessageTypeList[result.key],
      searchType: props.searchType,
    });
  } else {
    // View more results for a single category: Use the cursor as the search start position to pull the next part of the results
    setMessageSearchResultList({ cursor: result?.cursor || undefined });
  }
};

const getMoreResultInConversation = () => {
  setMessageSearchResultList({
    cursor: searchConversationResult?.value?.cursor,
    conversationID: currentSearchConversationID?.value,
  });
};

const showResultDetail = (isShow: boolean, targetType?: string, targetResult?: IMessageModel | ISearchResultListItem) => {
  isResultDetailShow.value = isShow;
  if (targetType) {
    TUIStore.update(StoreName.SEARCH, 'currentSearchMessageType', {
      value: searchMessageTypeList[targetType],
      searchType: props.searchType,
    });
  }
  currentSearchConversationID.value = (targetResult as ISearchResultListItem)?.conversation?.conversationID || '';
  searchConversationMessageTotalCount.value = (targetResult as ISearchResultListItem)?.messageCount;
  if (targetResult) {
    isSearchDetailLoading.value = true;
    setMessageSearchResultListDebounce({
      conversationID: currentSearchConversationID.value,
    });
  }
};

const generateListItemClass = (item: ISearchResultListItem): string[] => {
  return currentSearchConversationID.value === item?.conversation?.conversationID
    ? ['list-item', 'list-item-selected']
    : ['list-item'];
};

const generateResultItemDisplayType = (): string => {
  if (props.searchType === 'conversation' && currentSearchTabKey.value === 'fileMessage') {
    return 'file';
  } else if (props.searchType === 'conversation' && currentSearchTabKey.value === 'imageMessage') {
    return 'image';
  } else if (isPC) {
    return 'bubble';
  } else {
    return 'info';
  }
};

const groupResultListByDate = (
  messageList: IMessageModel[],
): Array<{ date: string; list: IMessageModel[] }> => {
  const result: Array<{ date: string; list: IMessageModel[] }> = [];
  if (!messageList?.length) {
    return result;
  } else if (messageList?.length === 1) {
    result.push({ date: generateSearchResultYMD(messageList[0]?.time), list: messageList });
    return result;
  }
  let prevYMD = '';
  let currYMD = '';
  for (let i = 0; i < messageList?.length; i++) {
    currYMD = generateSearchResultYMD(messageList[i]?.time);
    if (prevYMD !== currYMD) {
      result.push({ date: currYMD, list: [messageList[i]] });
    } else {
      result[result?.length - 1]?.list?.push(messageList[i]);
    }
    prevYMD = currYMD;
  }
  return result;
};

const navigateToChatPosition = (message: IMessageModel) => {
  if (props.searchType === 'global') {
    // Global search, close the search container
    TUIStore.update(StoreName.SEARCH, 'currentSearchingStatus', {
      isSearching: false,
      searchType: props.searchType,
    });
    // switch conversation
    TUIConversationService.switchConversation(message?.conversationID).then(() => {
      TUIStore.update(StoreName.CHAT, 'messageSource', message);
      isUniFrameWork && TUIGlobal?.navigateTo({
        url: '/TUIKit/components/TUIChat/index',
      });
    });
  } else if (props.searchType === 'conversation') {
    // Search in conversation, close the search container
    TUIStore.update(StoreName.SEARCH, 'isShowInConversationSearch', false);
    TUIStore.update(StoreName.CHAT, 'messageSource', message);
    isUniFrameWork && TUIGlobal?.navigateBack();
  }
};

const generateVueRenderKey = (value: string): string => {
  return `${currentSearchTabKey}-${value}`;
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
