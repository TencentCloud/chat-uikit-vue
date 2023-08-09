<template>
  <div class="TUI-contact" :class="[isPC ? ' ' : 'TUI-contact-H5']">
    <aside class="TUI-contact-left">
      <header class="TUI-contact-left-header">
        <div class="search">
          <div class="search-box" @click="toggleSearch" v-if="!searchStatus">
            <i class="plus"></i>
            <h1>{{ TUITranslateService.t("TUIContact.添加群聊") }}</h1>
          </div>
          <div class="search-box" v-else>
            <div class="input-box">
              <input
                :class="[isUniFrameWork ? 'uni-input' : '']"
                type="text"
                v-model="searchID"
                :placeholder="TUITranslateService.t('TUIContact.输入群ID搜索')"
                @keyup.enter="handleSearchGroup"
                @blur="handleSearchGroup"
                @confirm="handleSearchGroup"
                enterkeyhint="search"
              />
            </div>
            <span class="search-cancel" @click="toggleSearch">{{
              TUITranslateService.t("取消")
            }}</span>
          </div>
        </div>
      </header>
      <ul class="TUI-contact-column" v-if="!searchStatus">
        <li class="TUI-contact-column-item">
          <header @click="openContactList('group')">
            <Icon
              :file="listName === 'group' ? downIcon : rightIcon"
              :width="'16px'"
              :height="'16px'"
            ></Icon>
            <main>
              <label>{{ TUITranslateService.t("TUIContact.我的群聊") }}</label>
            </main>
          </header>
          <ul class="TUI-contact-list" v-if="listName === 'group'">
            <li
              class="TUI-contact-list-item"
              v-for="(item, index) in myGroupList"
              :class="[currentGroup.groupID === item.groupID && 'selected']"
              :key="index"
              @click="clickListItem(item)"
            >
              <aside class="left">
                <Icon
                  :file="
                    item.avatar ||
                    'https://web.sdk.qcloud.com/component/TUIKit/assets/group_avatar.png'
                  "
                  :width="'36px'"
                  :height="'36px'"
                ></Icon>
              </aside>
              <main class="content">
                <ul>
                  <li class="name">{{ item.name }}</li>
                  <li class="ID">
                    <label>ID：</label>
                    <span>{{ item.groupID }}</span>
                  </li>
                </ul>
                <span class="type">{{ groupType[item.type] }}</span>
              </main>
            </li>
          </ul>
        </li>
        <li class="TUI-contact-column-item">
          <header @click="openContactList('friend')">
            <Icon
              :file="listName === 'friend' ? downIcon : rightIcon"
              :width="'16px'"
              :height="'16px'"
            ></Icon>
            <main>
              <label>{{ TUITranslateService.t("TUIContact.我的好友") }}</label>
            </main>
          </header>
          <ul class="TUI-contact-list" v-if="listName === 'friend'">
            <li
              class="TUI-contact-list-item"
              :class="[currentFriend.userID === item.userID && 'selected']"
              v-for="(item, index) in myFriendList"
              :key="index"
              @click="clickListItem(item)"
            >
              <aside class="left">
                <Icon
                  :file="
                    item.avatar ||
                    'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
                  "
                  :width="'36px'"
                  :height="'36px'"
                ></Icon>
              </aside>
              <main class="content">
                <ul>
                  <li class="name">{{ item.nick || item.userID }}</li>
                </ul>
              </main>
            </li>
          </ul>
        </li>
      </ul>
      <ul class="TUI-contact-list" v-else>
        <li
          v-if="searchGroup.groupID"
          class="TUI-contact-list-item"
          :class="[currentGroup.groupID === searchGroup.groupID && 'selected']"
          @click="clickListItem(searchGroup)"
        >
          <aside class="left">
            <Icon
              v-if="isUniFrameWork"
              :file="
                searchGroup.avatar ||
                'https://web.sdk.qcloud.com/component/TUIKit/assets/group_avatar.png'
              "
              :width="'36px'"
              :height="'36px'"
            ></Icon>
            <img
              v-else
              class="avatar"
              :src="
                searchGroup.avatar ||
                'https://web.sdk.qcloud.com/component/TUIKit/assets/group_avatar.png'
              "
              onerror="this.src='https://web.sdk.qcloud.com/component/TUIKit/assets/group_avatar.png'"
            />
          </aside>
          <main class="content">
            <ul>
              <li class="name">{{ searchGroup.name }}</li>
              <li class="ID">
                <label>ID：</label>
                <span>{{ searchGroup.groupID }}</span>
              </li>
            </ul>
            <span class="type">{{ groupType[searchGroup.type] }}</span>
          </main>
        </li>
      </ul>
    </aside>
    <main
      :class="[
        'TUI-contact-main',
        isUniFrameWork && !isWeChat && 'TUI-contact-main-uni',
      ]"
      v-if="currentGroup.groupID || currentFriend.userID"
    >
      <header class="TUI-contact-main-h5-title" v-if="!isPC" @click="clearData">
        <Icon :file="backSVG"></Icon>
        <h1>
          {{
            currentGroup.name || TUITranslateService.t("TUIContact.我的好友")
          }}
        </h1>
      </header>
      <div v-if="currentGroup.groupID" class="TUI-contact-main-info">
        <header class="TUI-contact-main-info-header">
          <ul class="list">
            <h1>{{ currentGroup.name }}</h1>
            <li>
              <label>{{ TUITranslateService.t("TUIContact.群ID") }}：</label>
              <span>{{ currentGroup.groupID }}</span>
            </li>
            <li>
              <label>{{ TUITranslateService.t("TUIContact.群类型") }}：</label>
              <span>{{ groupType[currentGroup.type] }}</span>
            </li>
          </ul>
          <Icon
            :file="
              currentGroup.avatar ||
              'https://web.sdk.qcloud.com/component/TUIKit/assets/group_avatar.png'
            "
            :width="'5rem'"
            :height="'5rem'"
          ></Icon>
        </header>
        <main class="TUI-contact-main-info-main" v-if="isNeedPermission">
          <label>{{
            TUITranslateService.t("TUIContact.请填写验证信息")
          }}</label>
          <textarea
            v-model="currentGroup.applyMessage"
            :disabled="currentGroup.apply"
          ></textarea>
        </main>
        <footer class="TUI-contact-main-info-footer">
          <p v-if="currentGroup.apply && currentGroup.type === 'AVChatRoom'">
            {{ TUITranslateService.t("TUIContact.已加入") }}
          </p>
          <p v-else-if="currentGroup.apply">
            {{ TUITranslateService.t("TUIContact.已申请") }}
          </p>
          <button
            class="btn btn-default"
            v-else-if="isNeedPermission"
            @click="joinGroup(currentGroup)"
          >
            {{ TUITranslateService.t("TUIContact.申请加入") }}
          </button>
          <button
            class="btn btn-default"
            v-else-if="!currentGroup.selfInfo.userID"
            @click="joinGroup(currentGroup)"
          >
            {{ TUITranslateService.t("TUIContact.加入群聊") }}
          </button>
          <button
            class="btn btn-cancel"
            v-else-if="
              currentGroup.selfInfo.userID &&
              currentGroup.selfInfo.role === 'Owner' &&
              currentGroup.type !== 'Private'
            "
            @click="dismissGroup(currentGroup)"
          >
            {{ TUITranslateService.t("TUIContact.解散群聊") }}
          </button>
          <button
            class="btn btn-cancel"
            v-else
            @click="quitGroup(currentGroup)"
          >
            {{ TUITranslateService.t("TUIContact.退出群聊") }}
          </button>
          <button
            v-if="currentGroup.selfInfo.userID"
            class="btn btn-default"
            @click="enterConversation(currentGroup.groupID, 'GROUP')"
          >
            {{ TUITranslateService.t("TUIContact.进入群聊") }}
          </button>
        </footer>
      </div>
      <div
        v-else-if="currentFriend.userID && listName === 'friend'"
        class="TUI-contact-main-info"
      >
        <header class="TUI-contact-main-info-header">
          <ul class="list">
            <h1>{{ currentFriend.nick || currentFriend.userID }}</h1>
            <li>
              <label>ID：</label>
              <span>{{ currentFriend.userID }}</span>
            </li>
            <li>
              <label
                >{{ TUITranslateService.t("TUIContact.个性签名") }}：</label
              >
              <span>{{ currentFriend.selfSignature }}</span>
            </li>
          </ul>
          <Icon
            :file="
              currentFriend.avatar ||
              'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
            "
            :width="'5rem'"
            :height="'5rem'"
          ></Icon>
        </header>

        <footer class="TUI-contact-main-info-footer">
          <button
            class="btn btn-default"
            @click="enterConversation(currentFriend.userID, 'C2C')"
          >
            {{ TUITranslateService.t("TUIContact.发送消息") }}
          </button>
        </footer>
      </div>
    </main>
  </div>
</template>
<script lang="ts" setup>
import TUIChatEngine, {
  TUIGlobal,
  TUITranslateService,
  TUIStore,
  StoreName,
  TUIFriendService,
  TUIGroupService,
  TUIConversationService,
} from "@tencentcloud/chat-uikit-engine";
import { ref, computed, defineEmits } from "../../adapter-vue";
import Icon from "../common/Icon.vue";
import rightIcon from "../../assets/icon/right-icon.svg";
import downIcon from "../../assets/icon/down-icon.svg";
import backSVG from "../../assets/icon/back.svg";
import { Toast, TOAST_TYPE } from "../common/Toast/index";

const emits = defineEmits(["handleCurrentConversation"]);

const isPC = ref(TUIGlobal.getPlatform() === "pc");
const isUniFrameWork = ref(typeof uni !== "undefined");
const isWeChat = ref(TUIGlobal.getPlatform() === "wechat");

const myGroupList = ref([]);
const searchGroup = ref({});
const searchID = ref("");
const listName = ref("");
const searchStatus = ref(false);
const myFriendList = ref([]);
const currentFriend = ref({});
const currentGroup = ref({}); // 获取当前群组的信息

const groupType = {
  [TUIChatEngine.TYPES.GRP_WORK]: "Work",
  [TUIChatEngine.TYPES.GRP_AVCHATROOM]: "AVChatRoom",
  [TUIChatEngine.TYPES.GRP_PUBLIC]: "Public",
  [TUIChatEngine.TYPES.GRP_MEETING]: "Meeting",
  [TUIChatEngine.TYPES.GRP_COMMUNITY]: "Community",
};

TUIStore.watch(StoreName.GRP, {
  groupList: (groupList: any) => {
    myGroupList.value = groupList;
  },
});

const isNeedPermission = computed(() => {
  return (
    (currentGroup.value as any).joinOption ===
    TUIChatEngine.TYPES.JOIN_OPTIONS_NEED_PERMISSION
  );
});

const openContactList = async (name: string) => {
  currentGroup.value = {};
  // 打开群组信息且当前是 pc
  if (listName.value !== "group" && name === "group" && isPC.value) {
    currentGroup.value = myGroupList.value[0];
  } else {
    currentGroup.value = {};
  }
  searchID.value = "";
  listName.value = listName.value === name ? "" : name;
  //获取到当前的好友列表
  if (name === "friend") {
    await getFriendList();
  }
};

const clickListItem = (item: any) => {
  switch (listName.value) {
    case "group":
      currentGroup.value = item;
      break;
    case "friend":
      currentFriend.value = item;
      break;
  }
  if (searchStatus.value) {
    currentGroup.value = item;
  }
};

// myFriendList 数据结构中有 profile
const friendProfileList = (list: any) => {
  return list.map((item: { profile: any }) => {
    return item.profile;
  });
};

const getFriendList = async () => {
  TUIFriendService.getFriendList()
    .then((res: any) => {
      myFriendList.value = friendProfileList(res.data);
    })
    .catch((err: any) => {
      console.warn("getFriendList error:", err);
    });
};

// 加入群聊
const joinGroup = async (group: any) => {
  const options = {
    groupID: group.groupID,
    applyMessage: TUITranslateService.t("申请加入"),
  };
  TUIGroupService.joinGroup(options)
    .then((imResponse: { data: { status?: string } }) => {
      const conversationID = `GROUP${group.groupID}`;
      switch (imResponse?.data?.status) {
        case TUIChatEngine.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
          Toast({
            message: TUITranslateService.t("TUIContact.等待管理员同意"),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        case TUIChatEngine.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
          // 切换到对应的 chat 页面
          TUIConversationService.switchConversation(conversationID);
          if (isUniFrameWork.value) {
            openChatPage();
          } else {
            emits("handleCurrentConversation");
          }
          Toast({
            message: TUITranslateService.t("TUIContact.加群成功"),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        case TUIChatEngine.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
          Toast({
            message: TUITranslateService.t("TUIContact.您已是群成员"),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        default:
          break;
      }
    })
    .catch((error: any) => {
      Toast({
        message: error?.message,
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 解散群组
const dismissGroup = async (group: any) => {
  try {
    await TUIGroupService.dismissGroup(group.groupID);
    Toast({
      message: "群组解散成功！",
      type: TOAST_TYPE.SUCCESS,
    });
    currentGroup.value = {};
  } catch (err) {
    Toast({
      message: "群组解散失败！",
      type: TOAST_TYPE.ERROR,
    });
  }
};

// 进入会话
const enterConversation = (ID: string, type: string) => {
  const conversationID = `${type}${ID}`;
  // 切换到对应的chat页面
  TUIConversationService.switchConversation(conversationID).catch(() => {
    Toast({
      message: "进入会话失败！",
      type: TOAST_TYPE.ERROR,
    });
  });
  if (isUniFrameWork.value) {
    openChatPage();
  } else {
    emits("handleCurrentConversation");
  }
  clearData();
};

// 退出群聊
const quitGroup = async (group: any) => {
  await TUIGroupService.quitGroup(group.groupID);
  Toast({
    message: "退出群组成功！",
    type: TOAST_TYPE.SUCCESS,
  });
  currentGroup.value = {};
};

const openChatPage = () => {
  uni.navigateTo({
    url: "/TUIKit/components/TUIChat/index",
  });
};

const clearData = () => {
  currentGroup.value = {};
  currentFriend.value = {};
  listName.value = {};
};

const toggleSearch = () => {
  searchStatus.value = !searchStatus.value;
  searchID.value = "";
  searchGroup.value = {};
  clearData();
};

const handleSearchGroup = async () => {
  // 字符串为空，不进行后续处理
  if (!searchID.value) {
    return;
  }
  currentGroup.value = {};
  try {
    const imResponse = await TUIGroupService.searchGroupByID(searchID.value);
    searchGroup.value = imResponse.data.group;
  } catch (err: any) {
    const message = TUITranslateService.t("TUISearch.该群组不存在");
    Toast({
      message,
      type: TOAST_TYPE.ERROR,
    });
  }
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
