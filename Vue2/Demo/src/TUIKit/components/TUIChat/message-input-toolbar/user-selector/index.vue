<template>
  <Dialog
    :show="show"
    :isH5="!isPC"
    :isHeaderShow="false"
    :isFooterShow="false"
    :background="false"
    @update:show="toggleShow"
  >
    <Transfer
      :isSearch="true"
      :title="title"
      :list="searchMemberList"
      :isH5="!isPC"
      :isRadio="false"
      :total="searchMemberCount"
      @search="search"
      @submit="submit"
      @cancel="cancel"
      @getMore="loadMoreMembers"
    />
  </Dialog>
</template>
<script setup lang="ts">
import {
  TUIGroupService,
  TUIUserService,
  TUIStore,
  StoreName,
  IGroupModel,
} from '@tencentcloud/chat-uikit-engine-lite';
import { ref, computed } from '../../../../adapter-vue';
import Dialog from '../../../common/Dialog/index.vue';
import Transfer from '../../../common/Transfer/index.vue';
import { isPC } from '../../../../utils/env';

const props = defineProps({
  // type: voiceCall/groupCall/...
  type: {
    type: String,
    default: '',
  },
  currentConversation: {
    type: Object,
    default: () => ({}),
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['submit', 'cancel']);
const show = ref<boolean>(false);
const groupID = ref<string>('');
const memberList = ref<any[]>([]);
const memberCount = ref<number>(0);
const searchMemberList = ref<any[]>([]);
const searchMemberCount = ref<number>(0);
const selfUserID = ref<string>('');
const titleMap: any = {
  voiceCall: '发起群语音',
  videoCall: '发起群视频',
};
const title = computed(() => {
  return titleMap[props.type] ? titleMap[props.type] : '';
});

TUIUserService.getUserProfile().then((res: any) => {
  if (res?.data?.userID) {
    selfUserID.value = res.data.userID;
  }
});

TUIStore.watch(StoreName.GRP, {
  currentGroup: (group: IGroupModel) => {
    memberCount.value = group?.memberCount > 0 ? group?.memberCount - 1 : 0;
    searchMemberCount.value = memberCount.value;
    groupID.value = group?.groupID;
  },
  currentGroupMemberList: (list: any[]) => {
    memberList.value = list?.filter(
      (user: any) => user?.userID !== selfUserID.value,
    );
    searchMemberList.value = memberList.value;
  },
});

const loadMoreMembers = async () => {
  try {
    await TUIGroupService.getGroupMemberList({
      groupID: groupID.value,
      count: 50,
    });
  } catch (error) {
    console.log(error);
  }
};

const search = async (searchInfo: string) => {
  try {
    const res = await TUIGroupService.getGroupMemberProfile({
      groupID: groupID.value,
      userIDList: [searchInfo],
    });
    const results = res?.data?.memberList?.filter(
      (member: any) => member?.userID !== selfUserID.value,
    );
    if (searchInfo.trim()) {
      searchMemberList.value = results;
      searchMemberCount.value = results?.length;
    } else {
      searchMemberList.value = memberList.value;
      searchMemberCount.value = memberCount.value;
    }
  } catch {
    searchMemberList.value = memberList.value;
    searchMemberCount.value = memberCount.value;
  }
};

const submit = (selectedMemberList: string[]) => {
  const userIDList: string[] = [];
  selectedMemberList?.forEach((user: any) => {
    user?.userID && userIDList.push(user.userID);
  });
  if (props.type === 'voiceCall') {
    emits('submit', { userIDList, groupID: groupID.value, type: 1 });
  } else if (props.type === 'videoCall') {
    emits('submit', { userIDList, groupID: groupID.value, type: 2 });
  }
  searchMemberList.value = memberList.value;
  toggleShow(false);
};

const cancel = () => {
  searchMemberList.value = memberList.value;
  emits('cancel');
  toggleShow(false);
};

const toggleShow = (showStatus: boolean) => {
  show.value = showStatus;
};

defineExpose({
  toggleShow,
});
</script>
