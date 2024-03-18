<template>
  <ul
    v-if="!contactSearchingStatus"
    class="tui-contact-list"
  >
    <li
      v-for="(contactListObj, key) in contactListMap"
      :key="key"
      class="tui-contact-list-item"
    >
      <header
        class="tui-contact-list-item-header"
        @click="toggleCurrentContactList(key)"
      >
        <div class="tui-contact-list-item-header-left">
          <Icon
            :file="currentContactListKey === key ? downSVG : rightSVG"
            width="16px"
            height="16px"
          />
          <div>{{ TUITranslateService.t(`TUIContact.${contactListObj.title}`) }}</div>
        </div>
        <div class="tui-contact-list-item-header-right">
          <span
            v-if="contactListObj.unreadCount"
            class="tui-contact-list-item-header-right-unread"
          >
            {{ contactListObj.unreadCount }}
          </span>
        </div>
      </header>
      <ul
        v-if="currentContactListKey === key"
        class="tui-contact-list-item-main"
      >
        <li
          v-for="(contactListItem, contactListItemKey) in contactListObj.list"
          :key="contactListItemKey"
          class="tui-contact-list-item-main-item"
          :class="['selected']"
          @click="selectItem(contactListItem)"
        >
          <ContactListItem
            :item="contactListItem"
            :list="contactListObj.list"
            :displayOnlineStatus="contactListObj.key === 'friendList' && displayOnlineStatus"
            :userOnlineStatusMap="userOnlineStatusMap"
          />
        </li>
      </ul>
    </li>
  </ul>
  <ul
    v-else
    class="tui-contact-list"
  >
    <li
      v-for="(item, key) in contactSearchResult"
      :key="key"
      class="tui-contact-list-item"
    >
      <div
        v-if="item.list[0]"
        class="tui-contact-search-list"
      >
        <div class="tui-contact-search-list-title">
          {{ TUITranslateService.t(`TUIContact.${item.label}`) }}
        </div>
        <div
          v-for="(listItem, index) in item.list"
          :key="index"
          class="tui-contact-search-list-item"
          :class="['selected']"
          @click="selectItem(listItem)"
        >
          <ContactListItem
            :item="listItem"
            :list="item.list"
          />
        </div>
      </div>
    </li>
    <div
      v-if="isContactSearchNoResult"
      class="tui-contact-search-list-default"
    >
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
} from '@tencentcloud/chat-uikit-engine';
import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import { ref, computed, onMounted, onUnmounted } from '../../../adapter-vue';
import Icon from '../../common/Icon.vue';
import downSVG from '../../../assets/icon/down-icon.svg';
import rightSVG from '../../../assets/icon/right-icon.svg';
import {
  IContactList,
  IContactSearchResult,
  IBlackListUserItem,
  IUserStatus,
  IUserStatusMap,
  IContactInfoType,
} from '../../../interface';
import ContactListItem from './contact-list-item/index.vue';

const currentContactListKey = ref<keyof IContactList>('');
const currentContactInfo = ref<IContactInfoType>({} as IContactInfoType);
const contactListMap = ref<IContactList>({
  friendApplicationList: {
    key: 'friendApplicationList',
    title: '新的联系人',
    list: [] as Array<FriendApplication>,
    unreadCount: 0,
  },
  blackList: {
    key: 'blackList',
    title: '黑名单',
    list: [] as Array<IBlackListUserItem>,
  },
  groupList: {
    key: 'groupList',
    title: '我的群聊',
    list: [] as Array<IGroupModel>,
  },
  friendList: {
    key: 'friendList',
    title: '我的好友',
    list: [] as Array<Friend>,
  },
});
const contactSearchingStatus = ref<boolean>(false);
const contactSearchResult = ref<IContactSearchResult>();
const displayOnlineStatus = ref<boolean>(false);
const userOnlineStatusMap = ref<IUserStatusMap>();

const isContactSearchNoResult = computed((): boolean => {
  return (
    !contactSearchResult?.value?.user?.list[0]
    && !contactSearchResult?.value?.group?.list[0]
  );
});

onMounted(() => {
  TUIStore.watch(StoreName.APP, {
    enabledCustomerServicePlugin: onCustomerServiceCommercialPluginUpdated,
  });

  TUIStore.watch(StoreName.GRP, {
    groupList: onGroupListUpdated,
  });

  TUIStore.watch(StoreName.USER, {
    userBlacklist: onUserBlacklistUpdated,
    displayOnlineStatus: onDisplayOnlineStatusUpdated,
    userStatusList: onUserStatusListUpdated,
  });

  TUIStore.watch(StoreName.FRIEND, {
    friendList: onFriendListUpdated,
    friendApplicationList: onFriendApplicationListUpdated,
    friendApplicationUnreadCount: onFriendApplicationUnreadCountUpdated,
  });

  TUIStore.watch(StoreName.CUSTOM, {
    currentContactSearchingStatus: onCurrentContactSearchingStatusUpdated,
    currentContactSearchResult: onCurrentContactSearchResultUpdated,
  });
});

onUnmounted(() => {
  TUIStore.unwatch(StoreName.APP, {
    enabledCustomerServicePlugin: onCustomerServiceCommercialPluginUpdated,
  });

  TUIStore.unwatch(StoreName.GRP, {
    groupList: onGroupListUpdated,
  });

  TUIStore.unwatch(StoreName.USER, {
    userBlacklist: onUserBlacklistUpdated,
    displayOnlineStatus: onDisplayOnlineStatusUpdated,
    userStatusList: onUserStatusListUpdated,
  });

  TUIStore.unwatch(StoreName.FRIEND, {
    friendList: onFriendListUpdated,
    friendApplicationList: onFriendApplicationListUpdated,
    friendApplicationUnreadCount: onFriendApplicationUnreadCountUpdated,
  });

  TUIStore.unwatch(StoreName.CUSTOM, {
    currentContactSearchingStatus: onCurrentContactSearchingStatusUpdated,
    currentContactSearchResult: onCurrentContactSearchResultUpdated,
  });
});

function updateCurrentContactInfoFromList(list: Array<IContactInfoType>, type: string) {
  if (
    !(currentContactInfo.value as Friend)?.userID
    && !(currentContactInfo.value as IGroupModel)?.groupID
  ) {
    return;
  } else if (
    (currentContactInfo.value as IGroupModel)?.groupID
    && (type === currentContactListKey.value || contactSearchingStatus.value)
  ) {
    currentContactInfo.value = list?.find(
      (item: any) =>
        item?.groupID && item?.groupID === (currentContactInfo.value as IGroupModel)?.groupID,
    ) || {} as IContactInfoType;
    TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', currentContactInfo.value);
  } else if (
    (currentContactInfo.value as Friend)?.userID
    && (type === currentContactListKey.value || contactSearchingStatus.value)
  ) {
    currentContactInfo.value = list?.find(
      (item: any) =>
        item?.userID && item?.userID === (currentContactInfo.value as Friend)?.userID,
    ) || {} as IContactInfoType;
    TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', currentContactInfo.value);
  }
}

function toggleCurrentContactList(key: keyof IContactList) {
  if (currentContactListKey.value === key) {
    currentContactListKey.value = '';
    currentContactInfo.value = {} as IContactInfoType;
    TUIStore.update(
      StoreName.CUSTOM,
      'currentContactInfo',
      currentContactInfo.value,
    );
  } else {
    currentContactListKey.value = key;
    if (key === 'friendApplicationList') {
      TUIFriendService.setFriendApplicationRead();
    }
  }
}

function selectItem(item: any) {
  currentContactInfo.value = item;
  // 单独处理：
  // 对于 搜索列表 中 某结果，查看 contactInfo 详情前，需要对于“已在群组列表/已在好友列表” 的情况进行数据更新，已获得更详细的信息
  if (contactSearchingStatus.value) {
    let targetListItem;
    if ((currentContactInfo.value as Friend)?.userID) {
      targetListItem = contactListMap.value?.friendList?.list?.find(
        (item: IContactInfoType) => (item as Friend)?.userID === (currentContactInfo.value as Friend)?.userID,
      );
    } else if ((currentContactInfo.value as IGroupModel)?.groupID) {
      targetListItem = contactListMap.value?.groupList?.list?.find(
        (item: IContactInfoType) => (item as IGroupModel)?.groupID === (currentContactInfo.value as IGroupModel)?.groupID,
      );
    }
    if (targetListItem) {
      currentContactInfo.value = targetListItem;
    }
  }
  // 更新数据
  TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', currentContactInfo.value);
}

function onDisplayOnlineStatusUpdated(status: boolean) {
  displayOnlineStatus.value = status;
}

function onUserStatusListUpdated(list: Map<string, IUserStatus>) {
  if (list?.size > 0) {
    userOnlineStatusMap.value = Object.fromEntries(list?.entries());
  }
}

function onCustomerServiceCommercialPluginUpdated(isEnabled: boolean) {
  if (!isEnabled) {
    return;
  }

  /// 客户购买客服插件后 engine 通过商业化能力位更新将 enabledCustomerServicePlugin 设置为 true
  const contactListExtensionID = TUIConstants.TUIContact.EXTENSION.CONTACT_LIST.EXT_ID;
  const tuiContactExtensionList = TUICore.getExtensionList(contactListExtensionID);

  const customerData = tuiContactExtensionList.find((extension: any) => {
    const { name, accountList = [] } = extension.data || {};
    return name === 'customer' && accountList.length > 0;
  });

  if (customerData) {
    const { data, text } = customerData;
    const { accountList } = (data || {}) as { accountList: string[] };

    TUIUserService.getUserProfile({ userIDList: accountList })
      .then((res) => {
        if (res.data.length > 0) {
          const customerList = {
            title: text,
            list: res.data.map((item: any) => {
              return {
                ...item,
                infoKeyList: [],
                btnKeyList: ['enterC2CConversation'],
              };
            }),
            key: 'customerList',
          };
          contactListMap.value = { ...contactListMap.value, customerList };
        }
      })
      .catch(() => {});
  }
}

function onGroupListUpdated(groupList: Array<IGroupModel>) {
  contactListMap.value.groupList.list = groupList;
  updateCurrentContactInfoFromList(contactListMap.value.groupList.list, 'groupList');
}

function onUserBlacklistUpdated(userBlacklist: Array<IBlackListUserItem>) {
  contactListMap.value.blackList.list = userBlacklist;
  updateCurrentContactInfoFromList(contactListMap.value.blackList.list, 'blackList');
}

function onFriendApplicationUnreadCountUpdated(friendApplicationUnreadCount: number) {
  contactListMap.value.friendApplicationList.unreadCount = friendApplicationUnreadCount;
}

function onFriendListUpdated(friendList: Array<Friend>) {
  contactListMap.value.friendList.list = friendList;
  updateCurrentContactInfoFromList(contactListMap.value.friendList.list, 'friendList');
}

function onFriendApplicationListUpdated(friendApplicationList: Array<FriendApplication>) {
  contactListMap.value.friendApplicationList.list = friendApplicationList;
  updateCurrentContactInfoFromList(contactListMap.value.friendApplicationList.list, 'friendApplicationList');
}

function onCurrentContactSearchResultUpdated(searchResult: IContactSearchResult) {
  contactSearchResult.value = searchResult;
}

function onCurrentContactSearchingStatusUpdated(searchingStatus: boolean) {
  contactSearchingStatus.value = searchingStatus;
  currentContactInfo.value = {} as IContactInfoType;
  currentContactListKey.value = '';
  TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', currentContactInfo.value);
}
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
