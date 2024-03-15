<template>
  <SelectUser
    :isRadio="selectOptions.isRadio"
    :isNeedSearch="selectOptions.isNeedSearch"
    :title="selectOptions.title"
    :userList="userList"
    :total="group.memberCount"
    @getMore="getMember"
    @search="handleSearch"
    @complete="handleSelectedResult"
  />
</template>
<script lang="ts" setup>
import {
  TUIGroupService,
  TUIStore,
  StoreName,
  TUITranslateService,
  IGroupMember,
  IGroupModel,
} from '@tencentcloud/chat-uikit-engine';
import { ref, watchEffect } from '../../../adapter-vue';
import { Toast, TOAST_TYPE } from '../../common/Toast/index';
import TUICore from '@tencentcloud/tui-core';
import SelectUser from '../../common/SelectUser/index.vue';
import Server from '../server';
const TUIContactServer = Server.getInstance();
const TUIConstants = TUIContactServer.constants;

const needSearch = ref(false);
const memberList = ref<Array<typeof IGroupMember>>([]);
const userList = ref<Array<typeof IGroupMember>>([]);
const group = ref<IGroupModel>({});
const selectOptions: any = ref({
  groupID: '',
  isRadio: false,
  isNeedSearch: false,
  title: '',
  filterUserIDList: [] as Array<string>,
});
const TUISearchServer = ref<any>(null);

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
  selectOptions.value.groupID = params.groupID;
  selectOptions.value.title = params.title;
  selectOptions.value.isRadio = params.isRadio;
  selectOptions.value.isNeedSearch = params.isNeedSearch;
  selectOptions.value.filterUserIDList = params.filterUserIDList;
  if (params.isNeedSearch) {
    generateSearchServer(params.isNeedSearch);
  }
});

TUIStore.watch(StoreName.GRP, {
  currentGroup: (data: IGroupModel) => {
    group.value = data;
  },
  currentGroupMemberList: (List: Array<typeof IGroupMember>) => {
    memberList.value = List.map((item: typeof IGroupMember) => {
      if (selectOptions.value.filterUserIDList.indexOf(item.userID) > -1) {
        item.isDisabled = true;
      }
    });
    userList.value = memberList.value;
  },
});

const getMember = async () => {
  const groupID = group.value.groupID;
  const options = {
    groupID,
    count: 100,
    offset: memberList.value.length,
  };
  await TUIGroupService.getGroupMemberList(options);
};

const handleSelectedResult = (memberList: Array<any>) => {
  TUIStore.update(StoreName.GRP, 'isShowSelectComponent', false);
  const callback = TUIContactServer.getOnCallCallback(TUIConstants.TUIGroup.SERVICE.METHOD.SELECT_GROUP_MEMBER);
  callback && callback(memberList);
};

const searchFail = () => {
  Toast({
    message: TUITranslateService.t('TUIGroup.该用户不存在'),
    type: TOAST_TYPE.ERROR,
  });
  userList.value = [...memberList.value];
};

const handleSearch = async (val: string) => {
  if (!val) {
    return userList.value = memberList.value;
  }

  try {
    const imResponse: any = await TUISearchServer.value.searchGroupMember(val);
    if (!imResponse.data[0]) {
      return searchFail();
    }
    userList.value = imResponse.data;
    const searchAllResult = memberList.value.filter((item: any) => item.userID === imResponse.data[0].userID);
    memberList.value = searchAllResult.length ? memberList.value : [...memberList.value, ...userList.value];
  } catch (error) {
    return searchFail();
  }
};

</script>
