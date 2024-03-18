<template>
  <SelectUser
    :isRadio="selectOptions.isRadio"
    :isNeedSearch="selectOptions.isNeedSearch"
    :title="selectOptions.title"
    :userList="userList"
    @search="handleSearch"
    @complete="handleSelectedResult"
  />
</template>
<script lang="ts" setup>
import {
  TUIFriendService,
  TUIStore,
  StoreName,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { ref, watchEffect } from '../../../adapter-vue';
import { Toast, TOAST_TYPE } from '../../common/Toast/index';
import TUICore from '@tencentcloud/tui-core';
import SelectUser from '../../common/SelectUser/index.vue';
import Server from '../server';
const TUIContactServer = Server.getInstance();
const TUIConstants = TUIContactServer.constants;

const needSearch = ref(false);
const friendList = ref([]);
const userList = ref([]);
const TUISearchServer = ref<any>(null);
const selectOptions = ref({
  isRadio: false,
  isNeedSearch: false,
  title: '',
});

const generateSearchServer = (isNeedSearch: any) => {
  TUISearchServer.value = TUICore.getService(TUIConstants.TUISearch.SERVICE.NAME);
  if (TUISearchServer.value) {
    needSearch.value = isNeedSearch;
  } else {
    console.warn('请添加 TUISearch 组件');
  }
};

watchEffect(() => {
  const params = TUIContactServer.getOnCallParams(TUIConstants.TUIContact.SERVICE.METHOD.SELECT_FRIEND);
  selectOptions.value.title = params.title;
  selectOptions.value.isRadio = params.isRadio;
  selectOptions.value.isNeedSearch = params.isNeedSearch;
  if (params.isNeedSearch) {
    generateSearchServer(params.isNeedSearch);
  }
  TUIFriendService.getFriendList().then((res: any) => {
    friendList.value = res.data.map((item: any) => item.profile);
    userList.value = friendList.value;
  }).catch((err: any) => {
    console.warn('getFriendList error:', err);
  });
});

const handleSelectedResult = (memberList: Array<any>) => {
  TUIStore.update(StoreName.CUSTOM, 'isShowSelectFriendComponent', false);
  const callback = TUIContactServer.getOnCallCallback(TUIConstants.TUIContact.SERVICE.METHOD.SELECT_FRIEND);
  callback && callback(memberList);
};

const searchFail = () => {
  Toast({
    message: TUITranslateService.t('TUIGroup.该用户不存在'),
    type: TOAST_TYPE.ERROR,
  });
  userList.value = [...friendList.value];
};

const handleSearch = async (val: string) => {
  if (!val) {
    return userList.value = friendList.value;
  }

  try {
    const imResponse: any = await TUISearchServer.value.searchUser(val);
    if (!imResponse.data[0]) {
      return searchFail();
    }
    userList.value = imResponse.data;
    const searchAllResult = friendList.value.filter((item: any) => item.userID === imResponse.data[0].userID);
    friendList.value = searchAllResult.length ? friendList.value : [...friendList.value, ...userList.value];
  } catch (error) {
    return searchFail();
  }
};
</script>
