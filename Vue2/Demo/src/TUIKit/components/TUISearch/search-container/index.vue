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
      <div
        v-if="props.searchType === 'conversation' && !isUniFrameWork"
        class="tui-search-header"
      >
        <div class="tui-search-header-title">
          {{ TUITranslateService.t("TUISearch.搜索会话内容") }}
        </div>
        <div
          class="tui-search-header-close"
          @click="closeSearchContainer"
        >
          <Icon
            :file="closeDarkIcon"
            width="14px"
            height="14px"
          />
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
      <slot name="input" />
      <div
        v-if="isTimeTabsShow"
        class="tui-search-time"
      >
        <div
          v-for="(tabItem, tabKey) in searchMessageTimeList"
          :key="tabKey"
          :class="[
            'tui-search-time-item',
            currentSearchMessageTime.key === tabItem.key && 'tui-search-time-item-selected',
          ]"
          @click="selectSearchTime(tabItem)"
        >
          <div
            v-if="tabItem.key === 'all'"
            class="tui-search-time-item-picker"
          >
            <div
              v-if="!isDatePickerShow"
              class="tui-search-time-item-all"
              @click.stop="handleSelectAllTimeClicked"
            >
              {{
                TUITranslateService.t(`TUISearch.选择时间`) +
                  ":  " +
                  TUITranslateService.t(`TUISearch.全部`)
              }}
              <Icon
                :file="downArrowIcon"
                width="14px"
                height="14px"
              />
            </div>
            <div @click.stop>
              <DatePicker
                v-if="isDatePickerShow"
                type="range"
                :rangeTableType="datePickerRangeDisplayType"
                @pick="pickTimePeriod"
              />
            </div>
            <div
              v-if="isDatePickerShow"
              class="tui-search-time-item-close"
              @click="clearTimePicker"
            >
              <Icon
                class="icon"
                :file="closeIcon"
                width="14px"
                height="14px"
              />
            </div>
          </div>
          <div v-else>
            {{ TUITranslateService.t(`TUISearch.${tabItem.label}`) }}
          </div>
        </div>
      </div>
      <!-- TUISearch search result slot -->
      <slot name="result" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from '../../../adapter-vue';
import {
  TUITranslateService,
  TUIStore,
  StoreName,
} from '@tencentcloud/chat-uikit-engine';
import { Dayjs } from 'dayjs';
import {
  globalSearchTypeList,
  conversationSearchTypeList,
  searchMessageTypeDefault,
} from '../search-type-list';
import { searchMessageTimeList, searchMessageTimeDefault } from '../search-time-list';
import Icon from '../../common/Icon.vue';
import DatePicker from '../../common/DatePicker/index.vue';
import downArrowIcon from '../../../assets/icon/down-icon.svg';
import closeIcon from '../../../assets/icon/input-close.svg';
import closeDarkIcon from '../../../assets/icon/close-dark.svg';
import { isPC, isUniFrameWork } from '../../../utils/env';
import { SEARCH_TYPE, ISearchMessageTime, ISearchMessageType, ISearchTimeTab, ISearchTypeTab } from '../type';

const props = defineProps({
  popupPosition: {
    type: String, // "bottom" / "aside"
    default: 'bottom',
  },
  searchType: {
    type: String,
    default: 'global', // "global" / "conversation"
    validator(value: string) {
      return ['global', 'conversation'].includes(value);
    },
  },
});

const emits = defineEmits(['searchConfigChange', 'closeInConversationSearch']);

const searchTypeList = computed(() =>
  props?.searchType === 'conversation' ? conversationSearchTypeList : globalSearchTypeList,
);
const currentSearchMessageType = ref(searchMessageTypeDefault[props?.searchType as SEARCH_TYPE]);
const currentSearchMessageTime = ref(searchMessageTimeDefault);

const isTimeTabsShow = computed(() => {
  return (
    currentSearchMessageType.value.key !== 'contact'
    && currentSearchMessageType.value.key !== 'group'
  );
});
const datePickerRangeDisplayType = computed((): string =>
  isPC && props.searchType === 'global' && !isUniFrameWork ? 'two' : 'one',
);
const isDatePickerShow = ref<boolean>(false);

function onCurrentSearchMessageTypeChange(typeObject: ISearchMessageType) {
  if (typeObject?.searchType === props?.searchType) {
    currentSearchMessageType.value
        = typeObject?.value || searchMessageTypeDefault[props?.searchType as SEARCH_TYPE];
  }
}

function onCurrentSearchMessageTimeChange(timeObject: ISearchMessageTime) {
  if (timeObject?.searchType === props?.searchType) {
    currentSearchMessageTime.value = timeObject?.value || searchMessageTimeDefault;
  }
}

onMounted(() => {
  TUIStore.watch(StoreName.SEARCH, {
    currentSearchMessageType: onCurrentSearchMessageTypeChange,
    currentSearchMessageTime: onCurrentSearchMessageTimeChange,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.SEARCH, {
    currentSearchMessageType: onCurrentSearchMessageTypeChange,
    currentSearchMessageTime: onCurrentSearchMessageTimeChange,
  });
});

const selectSearchType = (item: ISearchTypeTab) => {
  TUIStore.update(StoreName.SEARCH, 'currentSearchMessageType', {
    value: item,
    searchType: props.searchType,
  });
};

const selectSearchTime = (item: ISearchTimeTab) => {
  if (isDatePickerShow.value && item.key === 'all') {
    isDatePickerShow.value = false;
  } else {
    isDatePickerShow.value = false;
    TUIStore.update(StoreName.SEARCH, 'currentSearchMessageTime', {
      value: item,
      searchType: props.searchType,
    });
  }
};

const handleSelectAllTimeClicked = () => {
  if (currentSearchMessageTime.value?.key !== 'all') {
    TUIStore.update(StoreName.SEARCH, 'currentSearchMessageTime', {
      value: searchMessageTimeDefault,
      searchType: props.searchType,
    });
  } else {
    isDatePickerShow.value = true;
  }
};

const pickTimePeriod = (time: typeof Dayjs) => {
  if (currentSearchMessageTime.value?.key === 'all') {
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
    TUIStore.update(StoreName.SEARCH, 'currentSearchMessageTime', {
      value: newSearchMessageTime,
      searchType: props.searchType,
    });
  }
};

const clearTimePicker = () => {
  isDatePickerShow.value = false;
  if (currentSearchMessageTime.value?.key === 'all') {
    TUIStore.update(StoreName.SEARCH, 'currentSearchMessageTime', {
      value: searchMessageTimeDefault,
      searchType: props.searchType,
    });
  }
};

const closeSearchContainer = () => {
  emits('closeInConversationSearch');
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
