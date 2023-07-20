<template>
  <div :class="['TUI-search', !isPC && 'TUI-search-H5']" ref="dialog">
    <header @click.stop="toggleOptionalShow" v-if="!isRelation">
      <i class="plus" @click="isPC && showDialog('isC2C')" ></i>
      <h1 v-if="!isPC">
        {{ TUITranslateService.t("TUISearch.发起会话") }}
      </h1>
      <ul v-if="optionalShow">
        <li  @click="showDialog('isC2C')">
          <Icon :file="C2C" v-if="!isPC"></Icon>
          <h1>
            {{ TUITranslateService.t("TUISearch.发起单聊") }}
          </h1>
        </li>
        <li @click="showDialog('isGroup')">
          <Icon :file="createGroup" class="create-group"></Icon>
          <h1>
            {{ TUITranslateService.t("TUISearch.发起群聊") }}
          </h1>
        </li>
      </ul>
    </header>
    <header @click="showDialog('joinGroup')" v-if="isRelation">
      <i class="plus"></i>
      <h1>
        {{ TUITranslateService.t("TUISearch.添加群聊") }}
      </h1>
    </header>
    <Dialog
      :show="open"
      :isH5="!isPC"
      :isHeaderShow="false"
      :isFooterShow="false"
      :background="false"
      @update:show="(e) => (open = e)"
    >
      <Transfer
        :isSearch="needSearch"
        :title="showTitle"
        :list="createConversationType === CONV_CREATE_TYPE.JOINGROUP ? searchGroupList: searchUserList"
        :isH5="!isPC"
        :isRadio="createConversationType === CONV_CREATE_TYPE.TYPEC2C"
        :joinGroup="createConversationType === CONV_CREATE_TYPE.JOINGROUP"
        @search="handleSearch"
        @submit="submit"
        @cancel="toggleOpen"
        v-if="currentDialog === 'userList'"
      />
      <CreateGroup
        v-else
        @submit="createGroupConversation"
        @cancel="toggleOpen"
        :isH5="!isPC"
      />
    </Dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, reactive, defineEmits, nextTick, watchEffect } from "../../adapter-vue";
import 
TUIChatEngine,
{
  TUIGlobal,
  TUIUserService,
  TUIGroupService,
  TUITranslateService,
  TUIFriendService,
  TUIConversationService,
} from "@tencentcloud/chat-uikit-engine";
import { CONV_CREATE_TYPE, DIALOG_CONTENT } from "../../constant";
import Icon from "../common/Icon.vue";
import createGroup from "../../assets/icon/start-group.svg";
import C2C from "../../assets/icon/icon-c2c.svg";
import Dialog from "../common/Dialog/index.vue";
import Transfer from "../common/Transfer/index.vue";
import CreateGroup from "../TUIGroup/create-group/index.vue";
import { Toast, TOAST_TYPE } from "../common/Toast/index";

const props = defineProps({
  isRelation: {
    type: Boolean,
    default: false,
  },
  isShowSearchDialog: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(["handleSwitchConversation"]);

const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== 'undefined');

const optionalShow = ref(isPC.value);
const dialog = ref(null);
const open = ref(false);
const showTitle = ref("");
const searchUserList = ref([]);
const searchGroupList = ref([]);
const createConversationType = ref("");
const currentDialog = ref(DIALOG_CONTENT.USERLIST);
const needSearch = ref(true);
const friendList = ref([]);
const searchUserID = ref("");
const groupInfo = reactive({
  groupID: "",
  name: "",
  type: "",
  avatar: "",
  introduction: "",
  notification: "",
  joinOption: "",
  memberList: [
    {
      userID: "",
    },
  ],
});

watchEffect(() => {
  if(isUniFrameWork.value) {
    optionalShow.value = props.isShowSearchDialog;
  }
})

const toggleOpen = () => {
  open.value = !open.value;
  if (!open.value) {
    searchUserID.value = "";
    currentDialog.value = DIALOG_CONTENT.USERLIST;
    initGroupOptions();
    searchUserList.value = [];
    searchGroupList.value = [];
  }
};

const initGroupOptions = () => {
  groupInfo.value = {
    groupID: "",
    name: "",
    type: "",
    avatar: "",
    introduction: "",
    notification: "",
    joinOption: "",
    memberList: [
      {
        userID: "",
      },
    ],
  };
};

const toggleOptionalShow = () => {
  if (!isPC.value) {
    optionalShow.value = !optionalShow.value;
    nextTick(() => {
      onClickOutside(dialog.value);
    });
  }
};

const showDialog = async (type: string) => {
  open.value = true;
  await getFriendList();
  searchUserList.value = [...friendList.value];
  switch (type) {
    case CONV_CREATE_TYPE.TYPEC2C:
      createConversationType.value = CONV_CREATE_TYPE.TYPEC2C;
      showTitle.value = TUITranslateService.t("TUISearch.发起单聊");
      return showTitle.value;
    case CONV_CREATE_TYPE.TYPEGROUP:
      createConversationType.value = CONV_CREATE_TYPE.TYPEGROUP;
      showTitle.value = TUITranslateService.t("TUISearch.发起群聊");
      return showTitle.value;
    case CONV_CREATE_TYPE.JOINGROUP:
      createConversationType.value = CONV_CREATE_TYPE.JOINGROUP;
      showTitle.value = TUITranslateService.t("TUISearch.添加群聊");
      return showTitle.value;
  }
};

const handleSearch = (val: string) => {
  if (createConversationType.value === CONV_CREATE_TYPE.JOINGROUP) {
    searchGroup(val);
  } else {
    searchUser(val);
  }
};

const searchGroup = async (val: string) => {
  try {
    const imResponse = await TUIGroupService.searchGroupByID(val.toString());
    if (!imResponse.data.group) {
      const message = TUITranslateService.t("TUISearch.该群组不存在");
      Toast({
        message,
        type: TOAST_TYPE.ERROR
      });
    }
    searchGroupList.value = [imResponse.data.group];
  } catch (err: any) {
    const message = TUITranslateService.t("TUISearch.该群组不存在");
    Toast({
      message,
      type: TOAST_TYPE.ERROR
    });
  }
};

const searchUser = async (val: string) => {
  try {
    const imResponse: any = await TUIUserService.getUserProfile({
      userIDList: [val.toString()],
    });
    if (!imResponse.data[0]) {
      const message = TUITranslateService.t("TUISearch.该用户不存在");
      Toast({
        message,
        type: TOAST_TYPE.ERROR
      });
      searchUserList.value = [...friendList.value];
      return;
    }
    searchUserList.value = imResponse.data;
    const searchAllResult = friendList.value.filter((item: any) => item.userID === imResponse.data[0].userID);
    friendList.value = searchAllResult.length ? friendList.value : [...friendList.value, ...searchUserList.value ];
  } catch (error) {
    const message = TUITranslateService.t("TUISearch.该用户不存在");
    Toast({
      message,
      type: TOAST_TYPE.ERROR
    });
    searchUserList.value = [...friendList.value];
    return;
  }
};
// friendList 数据结构中有 profile
const filterListItem = (list: any) => {
  return list.map((item: { profile: any; }) => { return item.profile });
};
const submit = (dataList: any) => {
  if (createConversationType.value === CONV_CREATE_TYPE.TYPEC2C) {
    const { userID } = dataList[0];
    createC2CConversation(userID);
    toggleOpen();
  } else if (createConversationType.value === CONV_CREATE_TYPE.JOINGROUP) {
    const { groupID } = dataList[0];
    joinGroupConversation(groupID);
    toggleOpen();
  } else {
    initGroupOptions();
    groupInfo.value.memberList = dataList.map((item: any) => ({
      userID: item.userID,
    }));
    currentDialog.value = DIALOG_CONTENT.GROUPINFORMATION;
  }
  searchUserList.value = [...friendList.value];
};

const getFriendList = async () => {
  TUIFriendService.getFriendList()
    .then((res: any) => {
      friendList.value = res.data;
      friendList.value = filterListItem(res.data);
    })
    .catch((err: any) => {
      console.warn("getFriendList error:", err);
    });
};

// 创建 c2c 会话
const createC2CConversation = (userID: string) => {
  const conversationID = `C2C${userID}`;
  TUIConversationService.getConversationProfile(conversationID)
    .then((res: any) => {
      TUIConversationService.switchConversation(
        res.data.conversation.conversationID
      );
      emits("handleSwitchConversation", res.data.conversation.conversationID);
    })
    .catch((err: any) => {
      console.warn("打开会话失败", err.code, err.msg);
    });
};

// 加入群聊
const joinGroupConversation = async (groupID: string) => {
  const options = {
    groupID,
    applyMessage: TUITranslateService.t("申请加入"),
  };
  const imResponse = await TUIGroupService.joinGroup(options);
  const conversationID = `GROUP${groupID}`;
  // 切换到对应的 chat 页面
  TUIConversationService.switchConversation(conversationID);
  emits("handleSwitchConversation", conversationID);
  Toast({
    message: imResponse.data.status,
    type: TOAST_TYPE.NORMAL
  });
};

// 创建群组
const createGroupConversation = async (params: any) => {
  const options = {
    memberList: groupInfo.value.memberList,
    ...params,
  };
  TUIGroupService.createGroup(options)
    .then((res: any) => {
      const conversationID = `GROUP${res.data.group.groupID}`;
      if (params.type === TUIChatEngine.TYPES.GRP_AVCHATROOM) {
        TUIGroupService.joinGroup({
            groupID: res.data.group.groupID,
            applyMessage: '',
          });
      }
      TUIConversationService.switchConversation(conversationID);
      emits("handleSwitchConversation", conversationID);
      Toast({
        message: "群组创建成功",
        type: TOAST_TYPE.SUCCESS
      });
    })
    .catch((err: any) => {
      Toast({
        message: err.msg,
        type: TOAST_TYPE.ERROR
      });
    });
  toggleOpen();
};

// 点击外侧关闭

let clickOutside = false;
let clickInner = false;
const onClickOutside = (component: any) => {
  if (isUniFrameWork.value) {
    return;
  }
  document.addEventListener("mousedown", onClickDocument);
  component?.addEventListener &&
    component?.addEventListener("mousedown", onClickTarget);
};

const onClickDocument = () => {
  clickOutside = true;
  if (!clickInner && clickOutside) {
    // 关闭弹窗
    optionalShow.value = false;
    removeClickListener(dialog.value);
  }
  clickOutside = false;
  clickInner = false;
};

const onClickTarget = () => {
  clickInner = true;
};

const removeClickListener = (component: any) => {
  if (isUniFrameWork.value) {
    return;
  }
  document.removeEventListener("mousedown", onClickDocument);
  component?.removeEventListener &&
    component?.removeEventListener("mousedown", onClickTarget);
};
</script>

<style lang="scss" scoped src="./style/index.scss"></style>