<template>
  <ul class="TUI-contact-list" v-if="!contactSearchingStatus">
    <li
      class="TUI-contact-list-item"
      v-for="(item, key) in contactListMap"
      :key="key"
    >
      <header
        class="TUI-contact-list-item-header"
        @click="toggleCurrentContactList(key)"
      >
        <div class="TUI-contact-list-item-header-left">
          <Icon
            :file="currentContactListKey === key ? downSVG : rightSVG"
            width="16px"
            height="16px"
          ></Icon>
          <div>{{ TUITranslateService.t(`TUIContact.${item.title}`) }}</div>
        </div>
        <div class="TUI-contact-list-item-header-right">
          <span
            class="TUI-contact-list-item-header-right-unread"
            v-if="item.unreadCount"
          >
            {{ item.unreadCount }}
          </span>
        </div>
      </header>
      <ul
        class="TUI-contact-list-item-main"
        v-if="currentContactListKey === key"
      >
        <li
          v-for="(listItem, listItemKey) in item.list"
          :key="listItemKey"
          class="TUI-contact-list-item-main-item"
          :class="['selected']"
          @click="selectItem(listItem)"
        >
          <ContactListItem :listItem="listItem" :list="item.list" />
        </li>
      </ul>
    </li>
  </ul>
  <ul class="TUI-contact-list" v-else>
    <li
      class="TUI-contact-list-item"
      v-for="(item, key) in contactSearchResult"
      :key="key"
    >
      <div class="TUI-contact-search-list" v-if="item.list[0]">
        <div class="TUI-contact-search-list-title">
          {{ TUITranslateService.t(`TUIContact.${item.label}`)}}
        </div>
        <div
          v-for="listItem in item.list"
          class="TUI-contact-search-list-item"
          :class="['selected']"
          @click="selectItem(listItem)"
        >
          <ContactListItem :listItem="listItem" :list="item.list" />
        </div>
      </div>
    </li>
    <div class="TUI-contact-search-list-default" v-if="isContactSearchNoResult">
      {{ TUITranslateService.t("TUIContact.无搜索结果") }}
    </div>
  </ul>
</template>
<script setup lang="ts">
import {
  TUITranslateService,
  TUIStore,
  StoreName,
  IGroupModel,
  TUIFriendService,
  Friend,
  FriendApplication,
  TUIUserService,
} from "@tencentcloud/chat-uikit-engine";
import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import { ref, computed, onMounted } from "../../../adapter-vue";
import Icon from "../../common/Icon.vue";
import downSVG from "../../../assets/icon/down-icon.svg";
import rightSVG from "../../../assets/icon/right-icon.svg";
import {
  IContactList,
  IContactSearchResult,
  IBlackListUserItem,
} from "../../../interface";
import ContactListItem from "./contact-list-item/index.vue";

const currentContactListKey = ref<string>("");
const currentContactInfo = ref<any>({});
const contactListMap = ref<IContactList>({
  friendApplicationList: {
    key: 'friendApplicationList',
    title: "新的联系人",
    list: [] as Array<FriendApplication>,
    unreadCount: 0,
  },
  blackList: {
    key: 'blackList',
    title: "黑名单",
    list: [] as Array<IBlackListUserItem>,
  },
  groupList: {
    key: 'groupList',
    title: "我的群聊",
    list: [] as Array<IGroupModel>,
  },
  friendList: {
    key: 'friendList',
    title: "我的好友",
    list: [] as Array<Friend>,
  },
});
const contactSearchingStatus = ref<boolean>(false);
const contactSearchResult = ref<IContactSearchResult>();

const isContactSearchNoResult = computed((): boolean => {
  return (
    !contactSearchResult?.value?.user?.list[0] &&
    !contactSearchResult?.value?.group?.list[0]
  );
});

const tuiContactExtensionList = TUICore.getExtensionList(TUIConstants.TUIContact.EXTENSION.CONTACT_LIST.EXT_ID);

onMounted(() => {
  if (tuiContactExtensionList.length > 0) {
    const customerData = tuiContactExtensionList.find((extension:any) => {
      const { name, accountList = [] } = extension.data || {};
      return name === 'customer' && accountList.length > 0;
    });
    if (customerData) {
      const { data: { accountList }, text } = customerData;
      TUIUserService.getUserProfile({userIDList: accountList}).then((res: any) => {
        if (res.data.length > 0) {
          const customerList = {
            title: text,
            list: res.data.map((item: any) => {
              return {
                ...item,
                infoKeyList: [],
                btnKeyList: ["enterC2CConversation"],
              }
            })
          }
          contactListMap.value = Object.assign({}, contactListMap.value, { customerList });
        }
      })
    }
  }
});

const updateCurrentContactInfoFromList = (list: Array<any>, type: string) => {
  if (
    !currentContactInfo?.value?.userID &&
    !currentContactInfo?.value?.groupID
  ) {
    return;
  } else if (
    currentContactInfo?.value?.groupID &&
    (type === currentContactListKey.value || contactSearchingStatus.value)
  ) {
    currentContactInfo.value = list?.find(
      (item: any) =>
        item?.groupID && item?.groupID === currentContactInfo?.value?.groupID
    );
    TUIStore.update(
      StoreName.CUSTOM,
      "currentContactInfo",
      currentContactInfo.value
    );
  } else if (
    currentContactInfo?.value?.userID &&
    (type === currentContactListKey.value || contactSearchingStatus.value)
  ) {
    currentContactInfo.value = list?.find(
      (item: any) =>
        item?.userID && item?.userID === currentContactInfo?.value?.userID
    );
    TUIStore.update(
      StoreName.CUSTOM,
      "currentContactInfo",
      currentContactInfo.value
    );
  }
};

TUIStore.watch(StoreName.GRP, {
  groupList: (groupList: Array<IGroupModel>) => {
    contactListMap.value.groupList.list = groupList;
    updateCurrentContactInfoFromList(
      contactListMap.value.groupList.list,
      "groupList"
    );
  },
});

TUIStore.watch(StoreName.USER, {
  userBlacklist: (userBlacklist: Array<IBlackListUserItem>) => {
    contactListMap.value.blackList.list = userBlacklist;
    updateCurrentContactInfoFromList(
      contactListMap.value.blackList.list,
      "blackList"
    );
  },
});

TUIStore.watch(StoreName.FRIEND, {
  friendList: (friendList: Array<Friend>) => {
    contactListMap.value.friendList.list = friendList;
    updateCurrentContactInfoFromList(
      contactListMap.value.friendList.list,
      "friendList"
    );
  },
  friendApplicationList: (
    friendApplicationList: Array<FriendApplication>
  ) => {
    contactListMap.value.friendApplicationList.list = friendApplicationList;
    updateCurrentContactInfoFromList(
      contactListMap.value.friendApplicationList.list,
      "friendApplicationList"
    );
  },
  friendApplicationUnreadCount: (friendApplicationUnreadCount: number) => {
    contactListMap.value.friendApplicationList.unreadCount =
      friendApplicationUnreadCount;
  },
});

TUIStore.watch(StoreName.CUSTOM, {
  currentContactSearchingStatus: (searchingStatus: boolean) => {
    contactSearchingStatus.value = searchingStatus;
    currentContactInfo.value = {};
    currentContactListKey.value = "";
    TUIStore.update(
      StoreName.CUSTOM,
      "currentContactInfo",
      currentContactInfo.value
    );
  },
  currentContactSearchResult: (searchResult: IContactSearchResult) => {
    contactSearchResult.value = searchResult;
  },
});

const toggleCurrentContactList = (key: string) => {
  if (currentContactListKey.value === key) {
    currentContactListKey.value = "";
    currentContactInfo.value = {};
    TUIStore.update(
      StoreName.CUSTOM,
      "currentContactInfo",
      currentContactInfo.value
    );
  } else {
    currentContactListKey.value = key;
    if (key === "friendApplicationList") {
      TUIFriendService.setFriendApplicationRead();
    }
  }
};

const selectItem = (item: any) => {
  currentContactInfo.value = item;
  // 单独处理：
  // 对于 搜索列表 中 某结果，查看 contactInfo 详情前，需要对于“已在群组列表/已在好友列表” 的情况进行数据更新，已获得更详细的信息
  if (contactSearchingStatus.value) {
    let targetListItem;
    if (currentContactInfo?.value?.userID) {
      targetListItem = contactListMap?.value?.friendList?.list?.find(
        (item: any) => item?.userID === currentContactInfo?.value?.userID
      );
    } else if (currentContactInfo?.value?.groupID) {
      targetListItem = contactListMap?.value?.groupList?.list?.find(
        (item: any) => item?.groupID === currentContactInfo?.value?.groupID
      );
    }
    if (targetListItem) {
      currentContactInfo.value = targetListItem;
    }
  }
  // 更新数据
  TUIStore.update(
    StoreName.CUSTOM,
    "currentContactInfo",
    currentContactInfo.value
  );
};
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
