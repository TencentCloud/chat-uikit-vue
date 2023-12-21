<template>
  <div :class="['TUI-contact-search', !isPC && 'TUI-contact-search-h5']">
    <div
      v-if="!isSearching || !isPC"
      :class="[
        'TUI-contact-search-header',
        !isPC && 'TUI-contact-search-h5-header',
        isSearching && 'TUI-contact-searching-h5-header',
      ]"
      @click="handleSearchingHeaderClicked"
    >
      <div
        :class="[
          'TUI-contact-search-header-icon',
          !isPC && 'TUI-contact-search-h5-header-icon',
        ]"
        @click.stop="handleSearchingIconClicked"
      >
        <Icon
          :file="isSearching ? backSVG : addSVG"
          :width="isSearching ? '20px' : '14px'"
          :height="isSearching ? '20px' : '14px'"
        />
      </div>

      <div
        :class="[
          'TUI-contact-search-header-title',
          !isPC && 'TUI-contact-search-h5-header-title',
        ]"
      >
        {{ TUITranslateService.t("TUIContact.添加好友/群聊") }}
      </div>
    </div>
    <div
      v-if="isSearching"
      :class="[
        'TUI-contact-search-main',
        !isPC && 'TUI-contact-search-h5-main',
      ]"
    >
      <input
        class="TUI-contact-search-main-input"
        type="text"
        v-model="searchValue"
        :placeholder="searchingPlaceholder"
        @keyup.enter="search"
        @blur="search"
        @confirm="search"
        enterkeyhint="search"
      />
      <div class="TUI-contact-search-main-cancel" @click="isSearching = false">
        {{ TUITranslateService.t("取消") }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  TUITranslateService,
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";
import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import { isPC } from "../../../utils/env";
import { TUIGlobal } from "../../../utils/universal-api/index";
import Icon from "../../common/Icon.vue";
import addSVG from "../../../assets/icon/add.svg";
import backSVG from "../../../assets/icon/back.svg";
import { ref, watch } from "../../../adapter-vue";
import { IContactSearchResult } from "../../../interface";

const searchingPlaceholder = TUITranslateService.t('TUIContact.输入ID');
const isSearching = ref<boolean>(false);
const searchValue = ref<string>("");
const searchResult = ref<IContactSearchResult>({
  user: {
    label: "联系人",
    list: [],
  },
  group: {
    label: "群聊",
    list: [],
  },
});

const handleSearchingHeaderClicked = () => {
  if (!isSearching.value) {
    isSearching.value = true;
  }
};

const handleSearchingIconClicked = () => {
  isSearching.value = !isSearching.value;
};

const search = async () => {
  if (!searchValue.value) {
    return;
  }
  TUICore.callService({
    serviceName: TUIConstants.TUISearch.SERVICE.NAME,
    method: TUIConstants.TUISearch.SERVICE.METHOD.SEARCH_USER,
    params: {
      userID: searchValue.value,
    },
  })
    .then((res: any) => {
      searchResult.value.user.list = res.data;
    })
    .catch((error: any) => {
      searchResult.value.user.list = [];
      console.warn("search user error", error);
    });
  TUICore.callService({
    serviceName: TUIConstants.TUISearch.SERVICE.NAME,
    method: TUIConstants.TUISearch.SERVICE.METHOD.SEARCH_GROUP,
    params: {
      groupID: searchValue.value,
    },
  })
    .then((res: any) => {
      searchResult.value.group.list = [res.data.group];
    })
    .catch((error: any) => {
      searchResult.value.group.list = [];
      console.warn("search group error", error);
    });
};
watch(
  () => searchResult.value,
  () => {
    TUIStore.update(
      StoreName.CUSTOM,
      "currentContactSearchResult",
      searchResult.value
    );
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => isSearching.value,
  () => {
    TUIStore.update(
      StoreName.CUSTOM,
      "currentContactSearchingStatus",
      isSearching.value
    );
    if (isSearching.value) {
      searchValue.value = "";
      searchResult.value.user.list = [];
      searchResult.value.group.list = [];
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
// 全局公共方法
TUIGlobal.updateContactSearch = search;
TUIGlobal.closeSearching = () => {
  isSearching.value = false;
};
</script>
<style lang="scss" scoped>
.TUI-contact-search {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #f4f5f9;
  flex-direction: column;
  &-header,
  &-main {
    width: 100%;
    height: 30px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  &-header {
    user-select: none;
    cursor: pointer;
    &-icon {
      padding-right: 10px;
    }
    &-title {
      font-size: 14px;
    }
  }
  &-main {
    display: flex;
    flex-direction: row;
    flex: 1;
    justify-content: center;
    align-items: center;
    width: 100%;
    &-input {
      flex: 1;
      font-size: 14px;
      border-radius: 5px;
      padding: 7px;
      border: 1px solid #ddd;
    }
    &-input:focus {
      outline: none;
      border: 1px solid #006eff;
    }
    &-cancel {
      padding-left: 10px;
      user-select: none;
      cursor: pointer;
    }
  }
  &-h5 {
    &-header {
      width: 100%;
    }
  }
}
.TUI-contact-searching-h5-header {
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
  .TUI-contact-search-h5-header-title {
    flex: 1;
    text-align: center;
    font-weight: 500;
    font-size: 14px;
    margin-right: 30px;
  }
}
</style>
