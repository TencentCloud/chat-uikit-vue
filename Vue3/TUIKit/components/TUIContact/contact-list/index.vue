<template>
  <ul
    v-if="!contactSearchingStatus"
    :class="['tui-contact-list', !isPC && 'tui-contact-list-h5']"
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
      <ul :class="['tui-contact-list-item-main', currentContactListKey === key ? '' : 'hidden']">
        <li
          v-for="contactListItem in contactListObj.list"
          :key="contactListItem.renderKey"
          class="tui-contact-list-item-main-item"
          :class="['selected']"
          @click="selectItem(contactListItem)"
        >
          <ContactListItem
            :key="contactListItem.renderKey"
            :item="deepCopy(contactListItem)"
            :displayOnlineStatus="displayOnlineStatus && key === 'friendList'"
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
            :displayOnlineStatus="false"
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
import { ref, computed, onMounted, onUnmounted, provide } from '../../../adapter-vue';
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
import { deepCopy } from '../../TUIChat/utils/utils';
import { isPC } from '../../../utils/env';

const currentContactListKey = ref<keyof IContactList>('');
const currentContactInfo = ref<IContactInfoType>({} as IContactInfoType);
const contactListMap = ref<IContactList>({
  friendApplicationList: {
    key: 'friendApplicationList',
    title: '新的联系人',
    list: [] as FriendApplication[],
    unreadCount: 0,
  },
  blackList: {
    key: 'blackList',
    title: '黑名单',
    list: [] as IBlackListUserItem[],
  },
  groupList: {
    key: 'groupList',
    title: '我的群聊',
    list: [] as IGroupModel[],
  },
  friendList: {
    key: 'friendList',
    title: '我的好友',
    list: [] as Friend[],
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
    currentContactListKey: onCurrentContactListKeyUpdated,
    currentContactInfo: onCurrentContactInfoUpdated,
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
    currentContactListKey: onCurrentContactListKeyUpdated,
    currentContactInfo: onCurrentContactInfoUpdated,
  });
});

function toggleCurrentContactList(key: keyof IContactList) {
  if (currentContactListKey.value === key) {
    currentContactListKey.value = '';
    currentContactInfo.value = {} as IContactInfoType;
    TUIStore.update(StoreName.CUSTOM, 'currentContactListKey', '');
    TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', {} as IContactInfoType);
  } else {
    currentContactListKey.value = key;
    TUIStore.update(StoreName.CUSTOM, 'currentContactListKey', key);
    if (key === 'friendApplicationList') {
      TUIFriendService.setFriendApplicationRead();
    }
  }
}

function selectItem(item: any) {
  currentContactInfo.value = item;
  // For a result in the search list, before viewing the contactInfo details,
  // it is necessary to update the data for the "already in the group list/already in the friend list" situation to obtain more detailed information
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

  // After the customer purchases the customer service plug-in,
  // the engine updates the enabledCustomerServicePlugin to true through the commercial capability bit.
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
            list: res.data.map((item: any, index: number) => {
              return {
                ...item,
                renderKey: generateRenderKey('customerList', item, index),
                infoKeyList: [],
                btnKeyList: ['enterC2CConversation'],
              };
            }),
            key: 'customerList',
          };
          contactListMap.value = { ...contactListMap.value, customerList };
        }
      })
      .catch(() => { });
  }
}

function onGroupListUpdated(groupList: IGroupModel[]) {
  updateContactListMap('groupList', groupList);
}

function onUserBlacklistUpdated(userBlacklist: IBlackListUserItem[]) {
  updateContactListMap('blackList', userBlacklist);
}

function onFriendApplicationUnreadCountUpdated(friendApplicationUnreadCount: number) {
  contactListMap.value.friendApplicationList.unreadCount = friendApplicationUnreadCount;
}

function onFriendListUpdated(friendList: Friend[]) {
  updateContactListMap('friendList', friendList);
}

function onFriendApplicationListUpdated(friendApplicationList: FriendApplication[]) {
  updateContactListMap('friendApplicationList', friendApplicationList);
}

function updateContactListMap(key: keyof IContactList, list: IContactInfoType[]) {
  contactListMap.value[key].list = list;
  contactListMap.value[key].list.map((item: IContactInfoType, index: number) => item.renderKey = generateRenderKey(key, item, index));
  updateCurrentContactInfoFromList(contactListMap.value[key].list, key);
}

function updateCurrentContactInfoFromList(list: IContactInfoType[], type: keyof IContactList) {
  if (
    !(currentContactInfo.value as Friend)?.userID
    && !(currentContactInfo.value as IGroupModel)?.groupID
  ) {
    return;
  }
  if (type === currentContactListKey.value || contactSearchingStatus.value) {
    currentContactInfo.value = list?.find(
      (item: any) =>
        (item?.groupID && item?.groupID === (currentContactInfo.value as IGroupModel)?.groupID) || (item?.userID && item?.userID === (currentContactInfo.value as Friend)?.userID),
    ) || {} as IContactInfoType;
    TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', currentContactInfo.value);
  }
}

function generateRenderKey(contactListMapKey: keyof IContactList, contactInfo: IContactInfoType, index: number) {
  return `${contactListMapKey}-${(contactInfo as Friend).userID || (contactInfo as IGroupModel).groupID || ('index' + index)}`;
}

function onCurrentContactSearchResultUpdated(searchResult: IContactSearchResult) {
  contactSearchResult.value = searchResult;
}

function onCurrentContactSearchingStatusUpdated(searchingStatus: boolean) {
  contactSearchingStatus.value = searchingStatus;
  TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', {} as IContactInfoType);
  TUIStore.update(StoreName.CUSTOM, 'currentContactListKey', '');
}

function onCurrentContactInfoUpdated(contactInfo: IContactInfoType) {
  currentContactInfo.value = contactInfo;
}

function onCurrentContactListKeyUpdated(contactListKey: string) {
  currentContactListKey.value = contactListKey;
}

provide('userOnlineStatusMap', userOnlineStatusMap);
</script>

<style lang="scss" scoped src="./style/index.scss"></style>
