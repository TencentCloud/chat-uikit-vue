<template>
  <div
    :class="[
      'tui-search-container',
      !isPC && 'tui-search-container-h5',
      isPC && `container-${props.popupPosition}`,
      `container-${props.searchType}`,
    ]"
  >
    <div
      :class="[
        isPC && `tui-search-container-${props.popupPosition}`,
        !isPC && 'tui-search-container-h5-main',
      ]"
    >
      <div class="tui-search-header" v-if="props.searchType === 'conversation'">
        <div class="tui-search-header-title">
          {{ TUITranslateService.t("TUISearch.搜索会话内容") }}
        </div>
        <div class="tui-search-header-close" @click="closeSearchContainer">
          <Icon :file="closeDarkIcon" width="14px" height="14px"></Icon>
        </div>
      </div>
      <div class="tui-search-tabs">
        <div
          v-for="(tabItem, tabKey) in searchTypeList"
          :key="tabKey"
          :class="[
            'tui-search-tabs-item',
            currentSearchMessageType.key === tabItem.key && 'tui-search-tabs-item-selected',
          ]"
          @click="selectSearchType(tabItem)"
        >
          {{ TUITranslateService.t(`TUISearch.${tabItem.label}`) }}
        </div>
      </div>
      <!-- TUISearch search input slot -->
      <slot name="input"></slot>
      <div class="tui-search-time" v-if="isTimeTabsShow">
        <div
          v-for="(tabItem, tabKey) in searchMessageTimeList"
          :key="tabKey"
          :class="[
            'tui-search-time-item',
            currentSearchMessageTime.key === tabItem.key && 'tui-search-time-item-selected',
          ]"
          @click="selectSearchTime(tabItem)"
        >
          <div v-if="tabItem.key === 'all'" class="tui-search-time-item-picker">
            <div
              class="tui-search-time-item-all"
              @click.stop="handleSelectAllTimeClicked"
              v-if="!isDatePickerShow"
            >
              {{
                TUITranslateService.t(`TUISearch.选择时间`) +
                ":  " +
                TUITranslateService.t(`TUISearch.全部`)
              }}
              <Icon :file="downArrowIcon" width="14px" height="14px"></Icon>
            </div>
            <div @click.stop>
              <DatePicker
                v-if="isDatePickerShow"
                type="range"
                :rangeTableType="datePickerRangeDisplayType"
                @pick="pickTimePeriod"
              ></DatePicker>
            </div>
            <div
              class="tui-search-time-item-close"
              v-if="isDatePickerShow"
              @click="clearTimePicker"
            >
              <Icon class="icon" :file="closeIcon" width="14px" height="14px"></Icon>
            </div>
          </div>
          <div v-else>
            {{ TUITranslateService.t(`TUISearch.${tabItem.label}`) }}
          </div>
        </div>
      </div>
      <!-- TUISearch search result slot -->
      <slot name="result"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  TUITranslateService,
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";
import {
  searchMessageTypeList,
  globalSearchTypeList,
  conversationSearchTypeList,
  searchMessageTypeDefault,
} from "../search-type-list";
import { searchMessageTimeList, searchMessageTimeDefault } from "../search-time-list";
import { ref, computed } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import DatePicker from "../../common/DatePicker/index.vue";
import downArrowIcon from "../../../assets/icon/down-icon.svg";
import closeIcon from "../../../assets/icon/input-close.svg";
import closeDarkIcon from "../../../assets/icon/close-dark.svg";
import { isPC, isUniFrameWork } from "../../../utils/env";
import { SEARCH_TYPE } from "../type";

const props = defineProps({
  popupPosition: {
    type: String, // 分为底部弹出和侧边弹出两种形式:"bottom"/"aside"
    default: "bottom",
  },
  searchType: {
    type: String,
    default: "global", // "global":全局搜索, "conversation":会话内搜索
    validator(value: string) {
      return ["global", "conversation"].includes(value);
    },
  },
});

const emits = defineEmits(["searchConfigChange", "closeInConversationSearch"]);

const searchTypeList = computed(() =>
  props?.searchType === "conversation" ? conversationSearchTypeList : globalSearchTypeList
);
const currentSearchMessageType = ref(searchMessageTypeDefault[props?.searchType as SEARCH_TYPE]);
const currentSearchMessageTime = ref(searchMessageTimeDefault);

const isTimeTabsShow = computed(() => {
  return (
    currentSearchMessageType.value.key !== "contact" &&
    currentSearchMessageType.value.key !== "group"
  );
});
const datePickerRangeDisplayType = computed((): string =>
  isPC && props.searchType === "global" && !isUniFrameWork ? "two" : "one"
);
const isDatePickerShow = ref<boolean>(false);

TUIStore.watch(StoreName.CUSTOM, {
  currentSearchMessageType: (typeObject: { value: any; searchType: string }) => {
    if (typeObject?.searchType === props?.searchType) {
      currentSearchMessageType.value =
        typeObject?.value || searchMessageTypeDefault[props?.searchType as SEARCH_TYPE];
    }
  },
  currentSearchMessageTime: (timeObject: { value: any; searchType: string }) => {
    if (timeObject?.searchType === props?.searchType) {
      currentSearchMessageTime.value = timeObject?.value || searchMessageTimeDefault;
    }
  },
});

const selectSearchType = (item: any) => {
  TUIStore.update(StoreName.CUSTOM, "currentSearchMessageType", {
    value: item,
    searchType: props.searchType,
  });
};

const selectSearchTime = (item: any) => {
  // 去除选日期情况触发 selectAllTime
  if (isDatePickerShow.value && item.key === "all") {
    isDatePickerShow.value = false;
  } else {
    isDatePickerShow.value = false;
    TUIStore.update(StoreName.CUSTOM, "currentSearchMessageTime", {
      value: item,
      searchType: props.searchType,
    });
  }
};

const handleSelectAllTimeClicked = () => {
  if (currentSearchMessageTime.value?.key !== "all") {
    TUIStore.update(StoreName.CUSTOM, "currentSearchMessageTime", {
      value: searchMessageTimeDefault,
      searchType: props.searchType,
    });
  } else {
    isDatePickerShow.value = true;
  }
};

const pickTimePeriod = (time: any) => {
  if (currentSearchMessageTime.value?.key === "all") {
    const { startDate, endDate } = time;
    const timePosition = Number((endDate?.toDate()?.getTime() / 1000).toFixed(0));
    const timePeriod = timePosition - Number((startDate?.toDate()?.getTime() / 1000).toFixed(0));
    const newSearchMessageTime = {
      key: currentSearchMessageTime.value.key,
      label: currentSearchMessageTime.value.label,
      value: {
        timePosition,
        timePeriod,
      },
    };
    TUIStore.update(StoreName.CUSTOM, "currentSearchMessageTime", {
      value: newSearchMessageTime,
      searchType: props.searchType,
    });
  }
};

const clearTimePicker = () => {
  isDatePickerShow.value = false;
  if (currentSearchMessageTime.value?.key === "all") {
    TUIStore.update(StoreName.CUSTOM, "currentSearchMessageTime", {
      value: searchMessageTimeDefault,
      searchType: props.searchType,
    });
  }
};

const closeSearchContainer = () => {
  emits("closeInConversationSearch");
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
