<template>
  <SelectFriend v-if="isShowSelectFriend" />
  <div
    v-else-if="isShowContactList"
    :class="['tui-contact', !isPC && 'tui-contact-h5']"
  >
    <div
      v-if="isShowContactListInH5"
      :class="['tui-contact-left', !isPC && 'tui-contact-h5-left']"
    >
      <ContactSearch />
      <ContactList :class="['tui-contact-left-list', !isPC && 'tui-contact-h5-left-list']" />
    </div>
    <div
      v-if="isShowContactInfoInH5"
      :class="['tui-contact-right', !isPC && 'tui-contact-h5-right']"
    >
      <ContactInfo @switchConversation="switchConversation" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { ref, watchEffect } from '../../adapter-vue';
import { isPC, isUniFrameWork } from '../../utils/env';

import SelectFriend from './select-friend/index.vue';
import ContactSearch from './contact-search/index.vue';
import ContactList from './contact-list/index.vue';
import ContactInfo from './contact-info/index.vue';

const emits = defineEmits(['switchConversation']);

const props = defineProps({
  // web/h5 单页面应用展示形式，uniapp 请忽略
  displayType: {
    type: String,
    default: 'contactList', // "contactList" 关系链列表(默认) / "selectFriend" 好友选择列表
    require: false,
  },
});

const displayTypeRef = ref<string>(props.displayType || 'contactList');
const isShowSelectFriend = ref(false);
const isShowContactList = ref(true);
const isShowContactListInH5 = ref(true);
const isShowContactInfoInH5 = ref(true);

watchEffect(() => {
  isShowContactList.value = props?.displayType !== 'selectFriend';
});

TUIStore.watch(StoreName.CUSTOM, {
  isShowSelectFriendComponent: (data: any) => {
    if (!isUniFrameWork && props?.displayType === 'selectFriend') {
      // 原生 web & h5 单页面应用，displayType 为 selectFriend 时，才唤起 selectFriend
      isShowSelectFriend.value = data;
      isShowContactList.value = false;
      return;
    }
    if (data) {
      isShowSelectFriend.value = true;
      if (isUniFrameWork) {
        displayTypeRef.value = 'selectFriend';
        TUIGlobal?.hideTabBar();
      }
    } else {
      isShowSelectFriend.value = false;
      if (isUniFrameWork) {
        displayTypeRef.value = props.displayType;
        TUIGlobal?.showTabBar();
      }
    }
  },
  currentContactInfo: (data: any) => {
    if (isPC) {
      isShowContactListInH5.value = true;
      isShowContactInfoInH5.value = true;
    } else if (!data || typeof data !== 'object' || Object.keys(data)?.length <= 0) {
      // 判断 移动端 展示 contactList 还是 contactInfo
      // contactInfo 不存在，展示contactList
      isShowContactListInH5.value = true;
      isShowContactInfoInH5.value = false;
    } else {
      // 判断 移动端 展示 contactList 还是 contactInfo
      // contactInfo 存在，展示contactInfo
      isShowContactListInH5.value = false;
      isShowContactInfoInH5.value = true;
    }
  },
});

const switchConversation = (data: any) => {
  isUniFrameWork
  && TUIGlobal?.navigateTo({
    url: '/TUIKit/components/TUIChat/index',
  });
  emits('switchConversation', data);
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/common";

.tui-contact {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  overflow: hidden;

  &-left {
    min-width: 285px;
    flex: 0 0 24%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &-right {
    border-left: 1px solid #f4f5f9;
    flex: 1;
    overflow: hidden;
  }
}

.tui-contact-h5 {
  &-left,
  &-right {
    width: 100%;
    height: 100%;
    flex: 1;
  }

  &-left {
    &-list {
      overflow-y: auto;
    }
  }
}
</style>
