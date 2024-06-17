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
      @search="search"
      @submit="submit"
      @cancel="cancel"
    />
  </Dialog>
</template>
<script setup lang="ts">
import {
  TUIGroupService,
  TUIUserService,
} from '@tencentcloud/chat-uikit-engine';
import { ref, computed, watch } from '../../../../adapter-vue';
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
const searchMemberList = ref<any[]>([]);
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

watch(
  () => [props?.currentConversation?.conversationID, show.value],
  (newVal: any, oldVal: any) => {
    if (newVal && newVal !== oldVal) {
      if (props.isGroup && show.value) {
        groupID.value = props.currentConversation.groupProfile.groupID;
        TUIGroupService.getGroupMemberList({
          groupID: groupID.value,
        }).then((res: any) => {
          memberList.value = res?.data?.memberList?.filter(
            (user: any) => user?.userID !== selfUserID.value,
          );
          searchMemberList.value = memberList.value;
        });
      } else {
        groupID.value = '';
        memberList.value = [];
        searchMemberList.value = memberList.value;
      }
    }
  },
  {
    immediate: true,
  },
);

const search = (searchInfo: string) => {
  const results = memberList.value?.filter(
    (member: any) => member?.userID === searchInfo,
  );
  searchMemberList.value = results?.length ? results : memberList.value;
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
