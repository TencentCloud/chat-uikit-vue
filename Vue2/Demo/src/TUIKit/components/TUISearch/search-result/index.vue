<template>
  <SearchResultLoading v-if="isLoading" />
  <SearchResultDefault v-else-if="isSearchDefaultShow" />
  <div v-else :class="[
    'tui-search-result',
    !isPC && 'tui-search-result-h5',
    isPC && isResultDetailShow && 'tui-search-result-with-border',
  ]">
    <div class="tui-search-result-main" v-if="props.searchType !== 'conversation' && (isPC || !isResultDetailShow)">
      <div class="tui-search-result-list">
        <div class="tui-search-result-list-item" v-for="result in searchResult">
          <div class="header" v-if="props.searchType === 'global'">
            {{ TUITranslateService.t(`TUISearch.${result.label}`)  }}
          </div>
          <div class="list">
            <div v-for="item in result.list" :class="[generateListItemClass(item)]">
              <SearchResultItem v-if="result.key === 'contact' || result.key === 'group' || item.conversation"
                :listItem="item" :type="result.key" displayType="info" :keywordList="keywordList"
                @showResultDetail="showResultDetail" @navigateToChatPosition="navigateToChatPosition"></SearchResultItem>
            </div>
          </div>
          <div class="more" v-if="currentSearchTabKey === 'all' || result.cursor" @click="getMoreResult(result)">
            <Icon class="more-icon" :file="searchIcon" width="12px" height="12px"></Icon>
            <div class="more-text">
              <span>{{ TUITranslateService.t("TUISearch.查看更多") }}</span>
              <span>{{ TUITranslateService.t(`TUISearch.${result.label}`) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div :class="[
      'tui-search-result-detail',
      props.searchType === 'conversation' && 'tui-search-result-in-conversation',
    ]" v-if="isResultDetailShow || props.searchType === 'conversation'">
      <SearchResultLoading v-if="isSearchDetailLoading" />
      <div class="tui-search-message-header"
        v-if="!isSearchDetailLoading && isResultDetailShow && props.searchType !== 'conversation'">
        <div class="header-content">
          <div class="header-content-count normal">
            <span>{{ searchConversationMessageTotalCount }}</span>
            <span>{{ TUITranslateService.t("TUISearch.条与") }}</span>
          </div>
          <div class="header-content-keyword">
            <span v-for="(keyword, index) in keywordList" :key="index">
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
        <div class="header-enter" @click="enterConversation({ conversationID: currentSearchConversationID })">
          <span>{{ TUITranslateService.t("TUISearch.进入聊天") }}</span>
          <Icon class="enter-icon" :file="enterIcon" width="14px" height="14px"></Icon>
        </div>
      </div>
      <div class="tui-search-message-list" v-if="!isSearchDetailLoading &&
        searchConversationMessageList &&
        searchConversationMessageList[0]
        ">
        <template v-if="props.searchType === 'global' ||
          (currentSearchTabKey !== 'imageMessage' && currentSearchTabKey !== 'fileMessage')
          ">
          <div :class="['list-item']" v-for="(item, index) in searchConversationMessageList"
            :key="generateVueRenderKey(item.ID)">
            <SearchResultItem :listItem="item" :listItemContent="item.getMessageContent()" :type="currentSearchTabKey"
              :displayType="generateResultItemDisplayType()" :keywordList="keywordList"
              @showResultDetail="showResultDetail" @navigateToChatPosition="navigateToChatPosition"></SearchResultItem>
          </div>
        </template>
        <!-- 会话内搜索-文件/图片视频类消息，需要按照时间合集展示 -->
        <template v-else>
          <div :class="['list-group', 'list-group-' + currentSearchTabKey]"
            v-for="group in searchConversationResultGroupByDate" :key="generateVueRenderKey(group.date)">
            <div :class="['list-group-date']">
              {{ group.date }}
            </div>
            <div :class="['list-group-item']" v-for="item in group.list" :key="generateVueRenderKey(item.ID)">
              <SearchResultItem :listItem="item" :listItemContent="item.getMessageContent()" :type="currentSearchTabKey"
                :displayType="generateResultItemDisplayType()" :keywordList="keywordList"
                @showResultDetail="showResultDetail" @navigateToChatPosition="navigateToChatPosition"></SearchResultItem>
            </div>
          </div>
        </template>
        <div class="more" v-if="searchConversationResult && searchConversationResult.cursor"
          @click="getMoreResultInConversation">
          <Icon class="more-icon" :file="searchIcon" width="12px" height="12px"></Icon>
          <div class="more-text">
            {{ TUITranslateService.t("TUISearch.查看更多历史记录") }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  TUITranslateService,
  TUIConversationService,
  TUIStore,
  StoreName,
  IGroupModel,
  IMessageModel,
} from "@tencentcloud/chat-uikit-engine";
import SearchResultItem from "./search-result-item/index.vue";
import SearchResultDefault from "./search-result-default/index.vue";
import SearchResultLoading from "./search-result-loading/index.vue";
import { searchMessageTypeList, searchMessageTypeDefault } from "../search-type-list";
import Icon from "../../common/Icon.vue";
import searchIcon from "../../../assets/icon/search.svg";
import enterIcon from "../../../assets/icon/right-icon.svg";
import { ref, watch, computed } from "../../../adapter-vue";
import { ISearchResultListItem, IFriendType } from "../../../interface";
import {
  searchCloudMessages,
  searchFriends,
  searchGroups,
  enterConversation,
  generateSearchResultYMD,
  debounce,
} from "../utils";
import { isPC, isUniFrameWork } from "../../../utils/env";
import { SEARCH_TYPE } from "../type";
import { enableSampleTaskStatus } from "../../../utils/enableSampleTaskStatus"

interface ISearchConversationResult {
  totalCount: number;
  cursor: number;
  searchResultList: Array<{
    conversationID: string;
    messageCount: number;
    messageList: Array<IMessageModel>;
  }>
}

const props = defineProps({
  searchType: {
    type: String,
    default: "global", // "global":全局搜索, "conversation":会话内搜索
    validator(value: string) {
      return ["global", "conversation"].includes(value);
    },
  },
});

// search params
const keywordList = ref<Array<string>>([]);
const messageTypeList = ref<Array<string>>(
  searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.value as Array<string>
);
const timePosition = ref<number>(0);
const timePeriod = ref<number>(0);
// 通过空格分割整串输入后，按照“与”关系搜索
// 比如: 输入"111 222", 搜索既有 111 又有 222 的消息, 同时也包含到严格搜索“111 222”的消息情况
const keywordListMatchType = ref<string>("and");

// current search tab key
const currentSearchTabKey = ref<string>(
  searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.key
);

// search results all（所有会话搜索结果)
const searchResult = ref<{
  [propsName: string]: { key: string; label: string; list: Array<any>; cursor: string | null };
}>({});
const searchAllMessageList = ref<Array<ISearchResultListItem>>([]);
const searchAllMessageTotalCount = ref<number>(0);
const searchFriendList = ref<Array<IFriendType>>([]);
const searchGroupList = ref<Array<IGroupModel>>([]);

// search results detail（具体某个会话的搜索结果）
const currentSearchConversationID = ref<string>("");
const searchConversationResult = ref<ISearchConversationResult>();
const searchConversationMessageList = ref<Array<IMessageModel>>([]);
const searchConversationMessageTotalCount = ref<number>();

// 文件消息/图片视频消息的搜索结果，按时间线分组
const searchConversationResultGroupByDate = ref<
  Array<{ date: string; list: Array<IMessageModel> }>
>([]);

// ui display control
const isResultDetailShow = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isSearchDetailLoading = ref<boolean>(false);
const isSearchDefaultShow = computed((): boolean => {
  if (isLoading.value) {
    return false;
  }
  if (props.searchType === "global") {
    // 未搜索 / 有结果
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

TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    props.searchType === "conversation" && (currentSearchConversationID.value = id);
  },
});

TUIStore.watch(StoreName.CUSTOM, {
  currentSearchInputValue: (obj: { value: string; searchType: string }) => {
    if (obj?.searchType === props?.searchType) {
      // 根据空格模糊搜索结果
      keywordList.value = obj?.value ? obj.value.trim().split(/\s+/) : [];
    }
  },
  currentSearchMessageType: (typeObject: { value: any; searchType: string }) => {
    if (typeObject?.searchType === props?.searchType) {
      currentSearchTabKey.value =
        typeObject?.value?.key || searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.key;
      messageTypeList.value =
        typeObject?.value?.value ||
        searchMessageTypeDefault[props.searchType as SEARCH_TYPE]?.value;
    }
  },
  currentSearchMessageTime: (timeObject: { value: any; searchType: string }) => {
    if (timeObject?.searchType === props?.searchType) {
      timePosition.value = timeObject?.value?.value?.timePosition;
      timePeriod.value = timeObject?.value?.value?.timePeriod;
    }
  },
});

const setMessageSearchResultList = (option?: { conversationID?: string; cursor?: number }) => {
  searchCloudMessages({
    keywordList: keywordList?.value?.length ? keywordList.value : undefined,
    messageTypeList: messageTypeList.value,
    timePosition: timePosition.value,
    timePeriod: timePeriod.value,
    conversationID: option?.conversationID || undefined,
    cursor: option?.cursor || undefined,
    keywordListMatchType: keywordListMatchType.value,
  }).then((res: any) => {
    enableSampleTaskStatus("searchCloudMessage");
    if (!option?.conversationID) {
      // 全部会话搜索结果
      option?.cursor
        ? (searchAllMessageList.value = [
          ...searchAllMessageList.value,
          ...res?.data?.searchResultList,
        ])
        : (searchAllMessageList.value = res?.data?.searchResultList);
      searchAllMessageTotalCount.value = res?.data?.totalCount;
      const key = currentSearchTabKey.value === "all" ? "allMessage" : currentSearchTabKey.value;
      if (
        searchAllMessageList?.value?.length &&
        currentSearchTabKey.value !== "contact" &&
        currentSearchTabKey.value !== "group"
      ) {
        searchResult.value = Object.assign({}, searchResult.value, {
          [key]: {
            key,
            label: searchMessageTypeList[key].label,
            list:
              currentSearchTabKey.value === "all"
                ? searchAllMessageList?.value?.slice(0, 3)
                : searchAllMessageList?.value,
            cursor: res?.data?.cursor || null,
          },
        });
      } else {
        delete searchResult?.value[key];
      }
    } else {
      // 指定会话搜索结果
      searchConversationResult.value = res?.data;
      option?.cursor
        ? (searchConversationMessageList.value = [
          ...searchConversationMessageList.value,
          ...res?.data?.searchResultList[0]?.messageList,
        ])
        : (searchConversationMessageList.value = res?.data?.searchResultList[0]?.messageList);
      searchConversationMessageTotalCount.value = res?.data?.totalCount;
      // 计算时间戳展示位置（仅会话内搜索 文件/图片 类型需要）
      if (
        props?.searchType === "conversation" &&
        (currentSearchTabKey.value === "fileMessage" ||
          currentSearchTabKey.value === "imageMessage")
      ) {
        searchConversationResultGroupByDate.value = groupResultListByDate(
          searchConversationMessageList.value
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
  searchConversationResult.value = {} as ISearchConversationResult;
  searchConversationMessageList.value = [];
  searchConversationResultGroupByDate.value = [];
};

watch(
  () => [keywordList.value, currentSearchTabKey.value, timePosition.value, timePeriod.value],
  (newValue: any, oldValue: any) => {
    if (newValue === oldValue) {
      return;
    }
    // 全局搜索必须有关键词，会话内搜索可以没有关键词
    if (!keywordList?.value?.length && props?.searchType === "global") {
      resetSearchResult();
      return;
    }
    isLoading.value = true;
    if (props.searchType === "conversation") {
      // 会话内搜索
      resetSearchResult();
      setMessageSearchResultList({
        conversationID: currentSearchConversationID.value,
      });
    } else {
      // 全局搜索
      if (oldValue && oldValue[1] === "all" && newValue && newValue[1] === "allMessage") {
        // 从【全部结果-聊天记录】分类中 点击某条结果，直接跳转到【聊天记录】tab，并且打开相关会话内搜索结果 情况, isResultDetailShow 保持为true
        // 不重新搜索
        searchResult?.value["allMessage"]?.list &&
          (searchResult.value["allMessage"].list = searchAllMessageList?.value);
        // 清除非聊天记录类型的其他搜索结果
        Object?.keys(searchResult?.value)?.forEach((key: string) => {
          if (key !== "allMessage") {
            delete searchResult?.value[key];
          }
        });
        isLoading.value = false;
        return;
      } else {
        // 其余情况，恢复 isResultDetailShow.value 为 false，并且重新搜索
        isResultDetailShow.value = false;
        resetSearchResult();
      }
      setMessageSearchResultListDebounce();
    }
  },
  { immediate: true }
);

const getMoreResult = (result: any) => {
  if (currentSearchTabKey.value === "all") {
    // 此时查看更多：切换到相应结果对应的result，展示其类型全量搜索结果
    TUIStore.update(StoreName.CUSTOM, "currentSearchMessageType", {
      value: searchMessageTypeList[result.key],
      searchType: props.searchType,
    });
  } else {
    // 在某一单类结果下查看更多：根据 cursor 作为搜索起始位置，拉取下一部分结果
    setMessageSearchResultList({ cursor: result?.cursor });
  }
};

const getMoreResultInConversation = () => {
  setMessageSearchResultList({
    cursor: searchConversationResult?.value?.cursor,
    conversationID: currentSearchConversationID?.value,
  });
};

const showResultDetail = (isShow: boolean, targetType?: string, targetResult?: any) => {
  isResultDetailShow.value = isShow;
  if (targetType) {
    TUIStore.update(StoreName.CUSTOM, "currentSearchMessageType", {
      value: searchMessageTypeList[targetType],
      searchType: props.searchType,
    });
  }
  currentSearchConversationID.value = targetResult?.conversation?.conversationID;
  searchConversationMessageTotalCount.value = targetResult?.messageCount;
  if (targetResult) {
    isSearchDetailLoading.value = true;
    setMessageSearchResultListDebounce({
      conversationID: currentSearchConversationID.value,
    });
  }
};

const generateListItemClass = (item: any): Array<string> => {
  return currentSearchConversationID.value === item?.conversation?.conversationID
    ? ["list-item", "list-item-selected"]
    : ["list-item"];
};

const generateResultItemDisplayType = (): string => {
  if (props.searchType === "conversation" && currentSearchTabKey.value === "fileMessage") {
    return "file";
  } else if (props.searchType === "conversation" && currentSearchTabKey.value === "imageMessage") {
    return "image";
  } else if (isPC) {
    return "bubble";
  } else {
    return "info";
  }
};

const groupResultListByDate = (
  messageList: Array<any>
): Array<{ date: string; list: Array<IMessageModel> }> => {
  const result: Array<{ date: string; list: Array<IMessageModel> }> = [];
  if (!messageList?.length) {
    return result;
  } else if (messageList?.length === 1) {
    result.push({ date: generateSearchResultYMD(messageList[0]?.time), list: messageList });
    return result;
  }
  let prevYMD = "";
  let currYMD = "";
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
  if (props.searchType === "global") {
    // 全局搜索，关闭 search container
    TUIStore.update(StoreName.CUSTOM, "currentSearchingStatus", {
      isSearching: false,
      searchType: props.searchType,
    });
    // 切换会话
    TUIConversationService.switchConversation(message?.conversationID).then(() => {
      TUIStore.update(StoreName.CHAT, "messageSource", message);
    });
  } else if (props.searchType === "conversation") {
    // 会话内搜索，关闭 search container
    TUIStore.update(StoreName.CUSTOM, "isShowInConversationSearch", false);
    TUIStore.update(StoreName.CHAT, "messageSource", message);
  }
};

const generateVueRenderKey = (value: string): string => {
  return `${currentSearchTabKey}-${value}`;
}
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
