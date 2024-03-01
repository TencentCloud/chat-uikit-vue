<template>
  <div
    :class="[
      'tui-search-input-container',
      !isPC && 'tui-search-input-container-h5',
      props.searchType === 'global'
        ? 'tui-search-input-container-global'
        : 'tui-search-input-container-conversation'
    ]"
  >
    <div :class="['tui-search-input', !isPC && 'tui-search-input-h5']">
      <div class="tui-search-input-left">
        <Icon class="icon" :file="searchIcon" width="14px" height="14px" />
      </div>
      <input
        class="tui-search-input-main"
        type="text"
        v-model="searchValueModel"
        :placeholder="props.placeholder"
        :focus="false"
        @blur="onBlur"
        @keyup.enter="search"
        @confirm="search"
        @click.stop.prevent="onSearchInputClick"
        enterkeyhint="search"
      />
      <div
        v-if="searchingStatus"
        class="tui-search-input-right"
        @click="endSearching"
      >
        <Icon class="icon" :file="closeIcon" width="14px" height="14px"></Icon>
      </div>
    </div>
    <div
      v-if="!isPC && searchingStatus && props.searchType === 'global'"
      :class="[
        'tui-search-input-cancel',
        !isPC && 'tui-search-input-h5-cancel',
      ]"
      @click="endSearching"
    >
      {{ TUITranslateService.t("TUISearch.取消") }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  TUIStore,
  StoreName,
  TUITranslateService,
} from "@tencentcloud/chat-uikit-engine";
import { TUIGlobal } from "@tencentcloud/universal-api";
import { ref } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import searchIcon from "../../../assets/icon/search.svg";
import closeIcon from "../../../assets/icon/input-close.svg";
import { isPC } from "../../../utils/env";
const props = defineProps({
  placeholder: {
    type: String,
    default: () => TUITranslateService.t("TUISearch.搜索"),
  },
  searchType: {
    type: String,
    default: "global", // "global":全局搜索, "conversation":会话内搜索
    validator(value: string) {
      return ["global", "conversation"].includes(value);
    },
  },
});

const searchValueModel = ref<string>("");
const currentSearchInputValue = ref<string>("");
const searchingStatus = ref<boolean>(false);

TUIStore.watch(StoreName.SEARCH, {
  currentSearchInputValue: (obj: { value: string; searchType: string }) => {
    if (obj?.searchType === props?.searchType) {
      currentSearchInputValue.value = obj?.value;
      searchValueModel.value = obj?.value;
    }
  },
  currentSearchingStatus: (obj: {
    isSearching: boolean;
    searchType: string;
  }) => {
    if (obj?.searchType === props?.searchType) {
      searchingStatus.value = obj?.isSearching;
    }
  },
});

const search = () => {
  // 避免重复搜索
  if (searchValueModel.value === currentSearchInputValue.value) {
    return;
  }
  TUIStore.update(StoreName.SEARCH, "currentSearchInputValue", {
    value: searchValueModel.value,
    searchType: props.searchType,
  });
};

const endSearching = () => {
  searchingStatus.value = false;
  TUIStore.update(StoreName.SEARCH, "currentSearchingStatus", {
    isSearching: false,
    searchType: props.searchType,
  });
  TUIStore.update(StoreName.SEARCH, "currentSearchInputValue", {
    value: "",
    searchType: props.searchType,
  });
};

const onSearchInputClick = () => {
  TUIStore.update(StoreName.SEARCH, "currentSearchingStatus", {
    isSearching: true,
    searchType: props.searchType,
  });
};

const onBlur = () => {
  TUIGlobal?.hideKeyboard?.();
};
</script>
<style lang="scss" scoped>
.tui-search-input-container {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  &-global {
    flex: 1;
  }
  .tui-search-input {
    flex: 1;
    display: flex;
    flex-direction: row;
    width: calc(100% - 20px);
    margin: 10px;
    background: #ededed;
    justify-content: center;
    align-items: center;
    height: 28px;
    border-radius: 4px;
    &-main {
      flex: 1;
      background: transparent;
      border: none;
      caret-color: #007aff;
      font-size: 14px;
      &:focus {
        border: none;
        outline: none;
      }
      &::placeholder {
        color: #666666;
        font-size: 12px;
      }
    }
    &-left,
    &-right {
      display: flex;
      width: 14px;
      height: 14px;
      padding: 0 7px;
    }
  }
}
.tui-search-input-container-h5 {
  .tui-search-input-h5 {
    height: 34px;
  }
  .tui-search-input-cancel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #007aff;
    font-size: 16px;
    padding: 7px 10px 7px 3px;
    font-family: PingFang SC;
  }
}
</style>
