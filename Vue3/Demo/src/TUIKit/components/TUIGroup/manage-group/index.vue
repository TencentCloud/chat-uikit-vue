<template>
  <div
    ref="manageRef"
    class="manage"
  >
    <header
      v-if="!isUniFrameWork || currentTab ==='admin'"
      class="manage-header"
    >
      <Icon
        :file="backSVG"
        @onClick="back"
      />
      <div class="manage-header-content">
        {{ TUITranslateService.t(`TUIGroup.${TabName}`) }}
      </div>
      <div />
    </header>
    <main
      v-if="!currentTab || (isUniFrameWork && currentTab != 'admin')"
      class="main"
    >
      <ManageName
        class="space-top"
        :isAuthor="isOwner || isAdmin || isWorkGroup"
        :data="currentGroup"
        @update="updateProfile"
      />
      <div class="user-info space-top">
        <header
          class="user-info-header"
          @click="setCurrentTab('member')"
        >
          <label class="user-info-header-left">
            {{ TUITranslateService.t(`TUIGroup.群成员`) }}
          </label>
          <div class="user-info-header-right">
            <span class="span">
              {{ currentGroup.memberCount || groupMemberList.length }}
              {{ TUITranslateService.t(`TUIGroup.人`) }}
            </span>
            <Icon :file="rightIcon" />
          </div>
        </header>
        <ol class="user-info-list">
          <dl
            v-for="(item, index) in groupMemberList.slice(0, showUserNum)"
            :key="index"
            class="user-info-list-item"
          >
            <dt
              class="user-info-list-item-main"
              @click="handleMemberProfileShow(item)"
            >
              <img
                class="avatar"
                :src="
                  item.avatar ||
                    'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                "
                onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'"
              >
            </dt>
            <dd class="user-info-list-item-info">
              {{ item.nick || item.userID }}
            </dd>
          </dl>
          <dl
            v-if="isShowAddMember"
            class="user-info-list-item"
          >
            <dt
              class="avatar"
              @click="toggleMask('add')"
            >
              +
            </dt>
          </dl>
          <dl
            v-if="currentSelfRole === 'Owner'"
            class="user-info-list-item"
          >
            <dt
              class="avatar"
              @click="toggleMask('remove')"
            >
              -
            </dt>
          </dl>
        </ol>
      </div>
      <ul
        class="content list space-top"
        @click="editLableName = ''"
      >
        <li
          class="list-item"
          @click="setCurrentTab('notification')"
        >
          <aside class="aside">
            <label class="label">{{
              TUITranslateService.t(`TUIGroup.群公告`)
            }}</label>
            <article class="article">
              {{ currentGroup.notification }}
            </article>
          </aside>
          <Icon
            :file="rightIcon"
            class="end"
          />
        </li>
        <li
          v-if="(isAdmin || isOwner) && isSetMuteTime"
          class="list-item"
          @click="setCurrentTab('admin')"
        >
          <label class="label">{{
            TUITranslateService.t(`TUIGroup.群管理`)
          }}</label>
          <Icon :file="rightIcon" />
        </li>
        <li class="list-item">
          <label class="label">{{
            TUITranslateService.t(`TUIGroup.群ID`)
          }}</label>
          <div class="groupID">
            <span class="span">{{ currentGroupID }}</span>
          </div>
        </li>
        <li class="list-item">
          <label class="label">{{
            TUITranslateService.t(`TUIGroup.群头像`)
          }}</label>
          <img
            class="avatar"
            :src="
              currentGroup.avatar ||
                'https://web.sdk.qcloud.com/im/demo/TUIkit/web/img/constomer.svg'
            "
            onerror="this.onerror=null;this.src='https://web.sdk.qcloud.com/im/demo/TUIkit/web/img/constomer.svg'"
          >
        </li>
        <li class="list-item">
          <label class="label">{{
            TUITranslateService.t(`TUIGroup.群类型`)
          }}</label>
          <span class="span">{{
            TUITranslateService.t(`TUIGroup.${typeName[currentGroup.type]}`)
          }}</span>
        </li>
        <li class="list-item">
          <label class="label">{{
            TUITranslateService.t(`TUIGroup.加群方式`)
          }}</label>
          <span class="span">{{
            TUITranslateService.t(
              `TUIGroup.${typeName[currentGroup.joinOption]}`
            )
          }}</span>
        </li>
      </ul>
      <ul class="footer list space-top">
        <li
          v-if="currentSelfRole === 'Owner' && groupMemberList.length > 1"
          class="list-item"
          @click.stop="toggleMask('changeOwner')"
        >
          {{ TUITranslateService.t(`TUIGroup.转让群组`) }}
        </li>
        <li
          v-if="canIDissmissGroup"
          class="list-item"
          @click.stop="dismissGroup(currentGroup)"
        >
          {{ TUITranslateService.t(`TUIGroup.解散群聊`) }}
        </li>
        <li
          v-else
          class="list-item"
          @click.stop="quitGroup(currentGroup)"
        >
          {{ TUITranslateService.t(`TUIGroup.退出群组`) }}
        </li>
      </ul>
    </main>
    <ManageMember
      v-if="currentTab === 'member'"
      :self="currentGroup.selfInfo"
      :list="groupMemberList"
      :total="~~currentGroup.memberCount"
      :isShowDel="currentSelfRole === 'Owner' && canDelMember"
      @more="getMember('more')"
      @del="submit"
      @handleMemberProfileShow="handleMemberProfileShow"
      @close="setCurrentTab('')"
    />
    <ManageProfile
      v-if="currentTab === 'profile'"
      :userInfo="currentMember"
      @close="setCurrentTab('')"
    />
    <ManageNotification
      v-if="currentTab === 'notification'"
      :isAuthor="isOwner || isAdmin || isWorkGroup"
      :data="currentGroup"
      @update="updateProfile"
      @close="setCurrentTab('')"
    />
    <ManageAdmin
      v-if="currentTab === 'admin'"
      v-show="isAdmin"
      :isSetMuteTime="isSetMuteTime"
      :member="member"
      :currentGroup="currentGroup"
      @addAdmin="toggleMask('addAdmin')"
      @removeAdmin="toggleMask('removeAdmin')"
      @setAllMuteTime="setAllMuteTime"
      @addMute="toggleMask('addMute')"
      @removeMute="toggleMask('removeMute')"
      @close="setCurrentTab('')"
    />
    <MaskLayer
      :show="mask"
      @update:show="(e) => (mask = e)"
    >
      <Transfer
        :title="TUITranslateService.t(`TUIGroup.${transferTitle}`)"
        :list="transferList"
        :isSearch="isSearch"
        :isRadio="isRadio"
        :selectedList="selectedList"
        :isH5="!isPC"
        @submit="submit"
        @cancel="cancel"
        @search="handleSearchMember"
      />
    </MaskLayer>
    <Dialog
      class="deleted-dialog"
      :title="TUITranslateService.t(`TUIGroup.删除成员`)"
      :show="delDialogShow"
      :isH5="!isPC"
      :center="true"
      :isHeaderShow="isPC"
      @submit="handleManage(deletedUserList, 'remove')"
      @update:show="(e) => (delDialogShow = e)"
    >
      <p
        v-if="deletedUserList.length === 1"
        class="del-dialog-title"
      >
        {{ TUITranslateService.t(`TUIGroup.确定从群聊中删除该成员？`) }}
      </p>
      <p
        v-if="deletedUserList.length > 1"
        class="del-dialog-title"
      >
        {{ TUITranslateService.t(`TUIGroup.确定从群聊中删除所选成员？`) }}
      </p>
    </Dialog>
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  computed,
  watchEffect,
  onMounted,
  nextTick,
} from '../../../adapter-vue';
import TUIChatEngine, {
  TUITranslateService,
  TUIGroupService,
  TUIFriendService,
  TUIStore,
  StoreName,
  IGroupModel,
  TUIConversationService,
  IConversationModel,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal, outsideClick } from '@tencentcloud/universal-api';
import MaskLayer from '../../common/MaskLayer/index.vue';
import Dialog from '../../common/Dialog/index.vue';
import Transfer from '../../common/Transfer/index.vue';
import ManageName from './manage-name.vue';
import ManageNotification from './manage-notification.vue';
import ManageMember from './manage-member.vue';
import ManageProfile from './manage-profile.vue';
import ManageAdmin from './manage-admin.vue';
import Icon from '../../common/Icon.vue';
import backSVG from '../../../assets/icon/back.svg';
import rightIcon from '../../../assets/icon/right-icon.svg';
import { Toast, TOAST_TYPE } from '../../common/Toast/index';
import { isPC, isUniFrameWork } from '../../../utils/env';
import Server from '../server';
import { enableSampleTaskStatus } from '../../../utils/enableSampleTaskStatus';
import { IFriendProfile, IGroupMember, IUserProfile } from '../../../interface';

const TUIGroupServer = Server.getInstance();
const TUIConstants = TUIGroupServer.constants;

const props = defineProps({
  groupID: {
    type: String,
    default: '',
  },
  groupCurrentTab: {
    type: String,
    default: '',
  },
});

const manageRef = ref<any>(undefined);
// type 'profile' | 'member' | 'notification' | 'admin' | ''
const currentTab = ref('');
const editLableName = ref('');
const transferType = ref('');
const mask = ref(false);
const currentGroupID = ref('');
const userInfo = ref({
  list: [] as IGroupMember[],
});
const currentMember = ref<IGroupMember>({});
const typeName = ref({
  [TUIChatEngine.TYPES.GRP_WORK]: '好友工作群',
  [TUIChatEngine.TYPES.GRP_PUBLIC]: '陌生人社交群',
  [TUIChatEngine.TYPES.GRP_MEETING]: '临时会议群',
  [TUIChatEngine.TYPES.GRP_AVCHATROOM]: '直播群',
  [TUIChatEngine.TYPES.GRP_COMMUNITY]: '社群',
  [TUIChatEngine.TYPES.JOIN_OPTIONS_FREE_ACCESS]: '自由加入',
  [TUIChatEngine.TYPES.JOIN_OPTIONS_NEED_PERMISSION]: '需要验证',
  [TUIChatEngine.TYPES.JOIN_OPTIONS_DISABLE_APPLY]: '禁止加群',
});
const member = ref({
  admin: [] as IGroupMember[],
  member: [] as IGroupMember[],
  muteMember: [] as IGroupMember[],
});
const transferList = ref<IGroupMember[]>([]);
const transferTitle = ref('');
const isSearch = ref(false);
const isRadio = ref(false);
const selectedList = ref([]);
const delDialogShow = ref(false);
const groupMemberList = ref<IGroupMember[]>([]);
const deletedUserList = ref([]);
const currentGroup = ref<IGroupModel>();
const currentSelfRole = ref('');
const groupIDValue = ref<string>('');

onMounted(() => {
  nextTick(() => {
    if (manageRef.value && !isUniFrameWork) {
      outsideClick.listen({
        domRefs: manageRef.value,
        handler: handleCompleteManage,
      });
    }
  });
});

TUIStore.watch(StoreName.GRP, {
  currentGroup: (group: IGroupModel) => {
    if (group) {
      currentGroup.value = group;
      currentSelfRole.value = currentGroup.value?.selfInfo?.role;
    }
  },
  currentGroupMemberList: (memberList: IGroupMember[]) => {
    groupMemberList.value = memberList;
    member.value = {
      admin: [],
      member: [],
      muteMember: [],
    };
    Array.from(memberList).map((item: any) => {
      switch (item?.role) {
        case TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN:
          member.value.admin.push(item);
          break;
        case TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER:
          member.value.member.push(item);
          break;
        default:
          break;
      }
      return item;
    });
    const time: number = new Date().getTime();
    member.value.muteMember = Array.from(memberList).filter(
      (item: any) => item?.muteUntil * 1000 - time > 0,
    );
  },
});

TUIStore.watch(StoreName.CONV, {
  currentConversation: (conversation: IConversationModel) => {
    groupIDValue.value = conversation?.groupProfile?.groupID;
  },
});

watchEffect(() => {
  const params = TUIGroupServer.getOnCallParams(TUIConstants.TUIGroup.SERVICE.METHOD.OPEN_GROUP_MANAGEMENT);
  currentGroupID.value = params?.groupID || groupIDValue.value;
  currentTab.value = props.groupCurrentTab;
});

const TabName = computed(() => {
  let name = '';
  switch (currentTab.value) {
    case 'notification':
      name = '群公告';
      break;
    case 'member':
      name = '群成员';
      break;
    case 'profile':
      name = '群成员';
      break;
    default:
      name = '群管理';
      break;
  }
  return name;
});

const isOwner = computed(() => {
  // Determine whether the person is the group owner/administrator
  const userRole = currentGroup.value?.selfInfo?.role;
  return userRole === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER;
});

const isAdmin = computed(() => {
  const userRole = currentGroup.value?.selfInfo?.role;
  return userRole === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER;
});

const isWorkGroup = computed(() => {
  return currentGroup.value?.type === TUIChatEngine.TYPES.GRP_WORK;
});

const isSetMuteTime = computed(() => {
  if (isWorkGroup.value || !(isOwner.value || isAdmin.value)) {
    return false;
  }
  return true;
});

const canDelMember = computed(() => {
  const groupType = currentGroup?.value?.type;
  const isAVChatRoom = groupType === TUIChatEngine.TYPES.GRP_AVCHATROOM;
  if (isAVChatRoom) {
    return false;
  }
  return true;
});

const updateProfile = async (newGroupProfile: any) => {
  const { key, value } = newGroupProfile;
  const options: any = {
    groupID: currentGroup.value.groupID,
    [key]: value,
  };
  TUIGroupService.updateGroupProfile(options)
    .then((res: any) => {
      currentGroup.value = res.data.group;
      editLableName.value = '';
    })
    .catch((error: any) => {
      Toast({
        message: error?.message,
        type: TOAST_TYPE.ERROR,
      });
    });
};

const setCurrentTab = (tabName: string) => {
  currentTab.value = tabName;
  editLableName.value = '';
  if (currentTab.value === 'member') {
    transferType.value = 'remove';
  }
  if (!currentTab.value) {
    transferType.value = '';
  }
};

const cancel = () => {
  toggleMask();
};

const toggleMask = async (type?: string) => {
  selectedList.value = [];
  let memberUserIDList: string[] = [];
  switch (type) {
    case 'add':
      isRadio.value = false;
      memberUserIDList = [...member.value.admin, ...member.value.member].map((item: IUserProfile) => item.userID);
      transferList.value = (await friendList()).filter((item: IFriendProfile) => {
        return item.userID && memberUserIDList.indexOf(item.userID) < 0;
      });
      transferTitle.value = '添加成员';
      break;
    case 'remove':
      isRadio.value = false;
      transferList.value = groupMemberList.value.filter(
        (item: any) => item.userID !== currentGroup?.value?.selfInfo?.userID,
      );
      transferTitle.value = '删除成员';
      break;
    case 'addAdmin':
      isRadio.value = true;
      transferList.value = member.value.member;
      transferTitle.value = '新增管理员';
      break;
    case 'removeAdmin':
      isRadio.value = true;
      transferList.value = member.value.admin;
      transferTitle.value = '移除管理员';
      break;
    case 'changeOwner':
      isRadio.value = true;
      transferList.value = [...member.value.admin, ...member.value.member];
      transferTitle.value = '转让群组';
      break;
    case 'addMute':
      isRadio.value = true;
      transferList.value = member.value.member;
      if (currentGroup.value.selfInfo.role === 'Owner') {
        transferList.value = [...member.value.admin, ...member.value.member];
      }
      transferList.value = transferList?.value?.filter((item: any) => {
        return member?.value?.muteMember?.indexOf(item) < 0;
      });
      transferTitle.value = '新增禁言用户';
      break;
    case 'removeMute':
      isRadio.value = true;
      transferList.value = member.value.muteMember;
      transferTitle.value = '移除禁言用户';
      break;
    default:
      break;
  }
  type && (transferType.value = type);
  mask.value = !mask.value;
};

const friendList = async () => {
  const imResponse = await TUIFriendService.getFriendList();
  const friendList = imResponse.data.map((item: any) => item?.profile);
  return friendList.filter(
    (item: any) =>
      !userInfo.value.list.some(
        (infoItem: any) => infoItem.userID === item.userID,
      ),
  );
};

const canIDissmissGroup = computed(() => {
  const userRole = currentGroup?.value?.selfInfo?.role;
  const groupType = currentGroup?.value?.type;

  return (
    userRole === TUIChatEngine.TYPES.GRP_MBR_ROLE_OWNER
    && groupType !== TUIChatEngine.TYPES.GRP_WORK
  );
});

const isShowAddMember = computed(() => {
  const groupType = currentGroup?.value?.type;
  return groupType === TUIChatEngine.TYPES.GRP_WORK;
});

const showUserNum = computed(() => {
  let num = 3;
  if (!isShowAddMember.value) {
    num += 1;
  }
  if (currentGroup?.value?.selfInfo?.role !== 'Owner') {
    num += 1;
  }
  return num;
});

const getMember = async (type?: string) => {
  const groupID = currentGroupID.value;
  const options = {
    groupID,
    count: 100,
    offset: type && type === 'more' ? userInfo.value.list.length : 0,
  };
  await TUIGroupService.getGroupMemberList(options).then((res: any) => {
    if (type && type === 'more') {
      userInfo.value.list = [...userInfo.value.list, ...res.data.memberList];
    } else {
      userInfo.value.list = res.data.memberList;
    }
  });
};

const handleMemberProfileShow = (user: any) => {
  currentMember.value = user;
  setCurrentTab('profile');
};

const submit = (userList: any) => {
  if (transferType.value === 'remove') {
    deletedUserList.value = userList;
    delDialogShow.value = !delDialogShow.value;
  } else {
    handleManage(userList, transferType.value);
  }
  mask.value = false;
};

const dismissGroup = async (group: any) => {
  await TUIGroupService.dismissGroup(group.groupID);
  enableSampleTaskStatus('dismissGroup');
  Toast({
    message: TUITranslateService.t('TUIGroup.群组解散成功'),
    type: TOAST_TYPE.SUCCESS,
  });
  clearGroupInfo();
};

const clearGroupInfo = () => {
  if (isUniFrameWork) {
    TUIGlobal?.switchTab({
      url: '/TUIKit/components/TUIConversation/index',
    });
  } else {
    handleCompleteManage();
    TUIConversationService.switchConversation();
  }
};

const setAllMuteTime = (value: boolean) => {
  // Set up a muting time for all members
  updateProfile({ key: 'muteAllMembers', value });
  if (value) {
    enableSampleTaskStatus('muteGroup');
    Toast({
      message: TUITranslateService.t('TUIGroup.禁言设置成功'),
      type: TOAST_TYPE.SUCCESS,
    });
  } else {
    Toast({
      message: TUITranslateService.t('TUIGroup.取消禁言成功'),
      type: TOAST_TYPE.SUCCESS,
    });
  }
};

const handleSearchMember = async (value: string) => {
  let imResponse: any = {};
  let imMemberResponse: any = {};
  const options: any = {
    groupID: currentGroupID.value,
    userIDList: [value],
  };
  switch (transferType.value) {
    case 'add':
      try {
        imMemberResponse = await TUIGroupService.getGroupMemberProfile(options);
        transferList.value = transferList.value.filter(
          (item: any) => item.userID !== imResponse.data[0]?.userID,
        );
        transferList.value = [...transferList.value, ...imResponse.data];
        if (imMemberResponse?.data?.memberList.length > 0) {
          transferList.value = transferList.value.map((item: any) => {
            if (item.userID === imMemberResponse?.data?.memberList[0].userID) {
              item.isDisabled = true;
            }
            return item;
          });
        }
      } catch (error: any) {
        const message = TUITranslateService.t('TUIGroup.该用户不存在');
        Toast({
          message,
          type: TOAST_TYPE.ERROR,
        });
      }
      break;
    case 'remove':
      try {
        imResponse = await TUIGroupService.getGroupMemberProfile(options);
        if (imResponse.data.memberList.length === 0) {
          const message = TUITranslateService.t('TUIGroup.该用户不在群组内');
          Toast({
            message,
            type: TOAST_TYPE.ERROR,
          });
        }
        transferList.value = transferList.value.filter(
          (item: any) => item.userID !== imResponse?.data?.memberList[0]?.userID,
        );
        if (imResponse?.data?.memberList.length) {
          transferList.value = [
            ...transferList.value,
            ...imResponse.data.memberList,
          ];
        }
      } catch (error: any) {
        const message = TUITranslateService.t('TUIGroup.该用户不存在');
        Toast({
          message,
          type: TOAST_TYPE.ERROR,
        });
      }
      break;
    default:
      break;
  }
};

const handleManage = (userList: any, type: any) => {
  const userIDList: any = [];
  userList.map((item: any) => {
    userIDList.push(item.userID);
    return item;
  });
  switch (type) {
    case 'add':
      addMember(userIDList);
      break;
    case 'remove':
      deleteGroupMember(userIDList);
      break;
    case 'addAdmin':
      handleAdmin(userList[0]);
      break;
    case 'removeAdmin':
      handleAdmin(userList[0]);
      break;
    case 'changeOwner':
      changeOwner(userIDList[0]);
      break;
    case 'addMute':
      setMemberMuteTime(userIDList[0], 'add');
      break;
    case 'removeMute':
      setMemberMuteTime(userIDList[0], 'remove');
      break;
    default:
      break;
  }
};

const addMember = async (userIDList: any) => {
  const options: any = {
    groupID: currentGroupID.value,
    userIDList,
  };
  await TUIGroupService.addGroupMember(options);
};

const changeOwner = async (userID: any) => {
  const options: any = {
    groupID: currentGroupID.value,
    newOwnerID: userID,
  };
  const imResponse = await TUIGroupService.changeGroupOwner(options);
  currentGroup.value = {};
  currentGroup.value = imResponse.data.group;
};

const setMemberMuteTime = async (userID: string, type?: string) => {
  const options: any = {
    groupID: currentGroupID.value,
    userID,
    muteTime: type === 'add' ? 60 * 60 * 24 * 30 : 0,
  };
  await TUIGroupService.setGroupMemberMuteTime(options);
};

const handleAdmin = async (user: any) => {
  let role = '';
  switch (user.role) {
    case TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN:
      role = TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER;
      break;
    case TUIChatEngine.TYPES.GRP_MBR_ROLE_MEMBER:
      role = TUIChatEngine.TYPES.GRP_MBR_ROLE_ADMIN;
      break;
  }
  const options: any = {
    groupID: currentGroupID.value,
    userID: user.userID,
    role,
  };
  await TUIGroupService.setGroupMemberRole(options);
};

const deleteGroupMember = async (userIDList: any) => {
  const options: any = {
    groupID: currentGroupID.value,
    userIDList,
    reason: '',
  };
  await TUIGroupService.deleteGroupMember(options);
};

const quitGroup = async (group: any) => {
  await TUIGroupService.quitGroup(group.groupID);
  clearGroupInfo();
};

const back = () => {
  if (currentTab.value) {
    setCurrentTab('');
  } else {
    handleCompleteManage();
  }
};

const handleCompleteManage = () => {
  TUIStore.update(StoreName.GRP, 'isShowManageComponent', false);
  const callback = TUIGroupServer.getOnCallCallback(TUIConstants.TUIGroup.SERVICE.METHOD.OPEN_GROUP_MANAGEMENT);
  callback && callback();
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
