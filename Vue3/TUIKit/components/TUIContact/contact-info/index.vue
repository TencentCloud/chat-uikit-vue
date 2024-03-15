<template>
  <div
    v-if="showContactInfo"
    :class="['tui-contact-info', !isPC && 'tui-contact-info-h5']"
  >
    <div
      v-if="!isPC"
      :class="[
        'tui-contact-info-header',
        !isPC && 'tui-contact-info-h5-header',
      ]"
    >
      <div
        :class="[
          'tui-contact-info-header-icon',
          !isPC && 'tui-contact-info-h5-header-icon',
        ]"
        @click="resetContactSearchingUIData"
      >
        <Icon :file="backSVG" />
      </div>
      <div
        :class="[
          'tui-contact-info-header-title',
          !isPC && 'tui-contact-info-h5-header-title',
        ]"
      >
        {{ TUITranslateService.t("TUIContact.添加好友/群聊") }}
      </div>
    </div>
    <div
      :class="['tui-contact-info-basic', !isPC && 'tui-contact-info-h5-basic']"
    >
      <div
        :class="[
          'tui-contact-info-basic-text',
          !isPC && 'tui-contact-info-h5-basic-text',
        ]"
      >
        <div
          :class="[
            'tui-contact-info-basic-text-name',
            !isPC && 'tui-contact-info-h5-basic-text-name',
          ]"
        >
          {{ generateContactInfoName(contactInfoData) }}
        </div>
        <div
          v-for="item in contactInfoBasicList"
          :key="item.label"
          :class="[
            'tui-contact-info-basic-text-other',
            !isPC && 'tui-contact-info-h5-basic-text-other',
          ]"
        >
          {{
            `${TUITranslateService.t(`TUIContact.${item.label}`)}:
            ${item.data}`
          }}
        </div>
      </div>
      <img
        :class="[
          'tui-contact-info-basic-avatar',
          !isPC && 'tui-contact-info-h5-basic-avatar',
        ]"
        :src="generateAvatar(contactInfoData)"
      >
    </div>
    <div
      v-if="contactInfoMoreList[0]"
      :class="['tui-contact-info-more', !isPC && 'tui-contact-info-h5-more']"
    >
      <div
        v-for="item in contactInfoMoreList"
        :key="item.key"
        :class="[
          'tui-contact-info-more-item',
          !isPC && 'tui-contact-info-h5-more-item',
          item.labelPosition === CONTACT_INFO_LABEL_POSITION.TOP
            ? 'tui-contact-info-more-item-top'
            : 'tui-contact-info-more-item-left',
        ]"
      >
        <div
          :class="[
            'tui-contact-info-more-item-label',
            !isPC && 'tui-contact-info-h5-more-item-label',
          ]"
        >
          {{ `${TUITranslateService.t(`TUIContact.${item.label}`)}` }}
        </div>
        <div
          :class="[
            'tui-contact-info-more-item-content',
            !isPC && 'tui-contact-info-h5-more-item-content',
          ]"
        >
          <div
            v-if="!item.editing"
            :class="[
              'tui-contact-info-more-item-content-text',
              !isPC && 'tui-contact-info-h5-more-item-content-text',
            ]"
          >
            <div
              :class="[
                'tui-contact-info-more-item-content-text-data',
                !isPC && 'tui-contact-info-h5-more-item-content-text-data',
              ]"
            >
              {{ item.data }}
            </div>
            <div
              v-if="item.editable"
              :class="[
                'tui-contact-info-more-item-content-text-icon',
                !isPC && 'tui-contact-info-h5-more-item-content-text-icon',
              ]"
              @click="setEditing(item)"
            >
              <Icon
                :file="editSVG"
                width="14px"
                height="14px"
              />
            </div>
          </div>
          <input
            v-else-if="item.editType === CONTACT_INFO_MORE_EDIT_TYPE.INPUT"
            v-model="item.data"
            :class="[
              'tui-contact-info-more-item-content-input',
              !isPC && 'tui-contact-info-h5-more-item-content-input',
            ]"
            type="text"
            @confirm="onContactInfoEmitSubmit(item)"
            @keyup.enter="onContactInfoEmitSubmit(item)"
          >
          <textarea
            v-else-if="item.editType === CONTACT_INFO_MORE_EDIT_TYPE.TEXTAREA"
            v-model="item.data"
            :class="[
              'tui-contact-info-more-item-content-textarea',
              !isPC && 'tui-contact-info-h5-more-item-content-textarea',
            ]"
            confirm-type="done"
          />
          <div
            v-else-if="item.editType === CONTACT_INFO_MORE_EDIT_TYPE.SWITCH"
            @click="onContactInfoEmitSubmit(item)"
          >
            <SwitchBar :value="item.data" />
          </div>
        </div>
      </div>
    </div>
    <div
      :class="[
        'tui-contact-info-button',
        !isPC && 'tui-contact-info-h5-button',
      ]"
    >
      <button
        v-for="item in contactInfoButtonList"
        :key="item.key"
        :class="[
          'tui-contact-info-button-item',
          !isPC && 'tui-contact-info-h5-button-item',
          item.type === CONTACT_INFO_BUTTON_TYPE.CANCEL
            ? `tui-contact-info-button-item-cancel`
            : `tui-contact-info-button-item-submit`,
        ]"
        @click="onContactInfoButtonClicked(item)"
      >
        {{ TUITranslateService.t(`TUIContact.${item.label}`) }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import TUIChatEngine, {
  TUIStore,
  StoreName,
  TUITranslateService,
  IGroupModel,
  Friend,
  FriendApplication,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { ref, computed } from '../../../adapter-vue';
import { isPC } from '../../../utils/env';

import {
  generateAvatar,
  generateContactInfoName,
  generateContactInfoBasic,
  isFriend,
  isApplicationType,
} from '../utils/index';
import {
  contactMoreInfoConfig,
  contactButtonConfig,
} from './contact-info-config';
import Icon from '../../common/Icon.vue';
import editSVG from '../../../assets/icon/edit.svg';
import backSVG from '../../../assets/icon/back.svg';
import SwitchBar from '../../common/SwitchBar/index.vue';
import {
  IBlackListUserItem,
  IContactInfoMoreItem,
  IContactInfoButton,
} from '../../../interface';
import {
  CONTACT_INFO_LABEL_POSITION,
  CONTACT_INFO_MORE_EDIT_TYPE,
  CONTACT_INFO_BUTTON_TYPE,
} from '../../../constant';
import { deepCopy } from '../../TUIChat/utils/utils';

type IContactInfoType = IGroupModel | Friend | FriendApplication | IBlackListUserItem;

const emits = defineEmits(['switchConversation']);

const contactInfoData = ref<IContactInfoType>();
const contactInfoBasicList = ref<Array<{ label: string; data: string }>>([]);
const contactInfoMoreList = ref<Array<IContactInfoMoreItem>>([]);
const contactInfoButtonList = ref<Array<IContactInfoButton>>([]);
const showContactInfo = computed((): boolean => {
  for (const i in contactInfoData.value) {
    return true;
  }
  return false;
});

const setEditing = (item: any) => {
  item.editing = true;
};

// 是否为群组类型
const isGroup = computed((): boolean =>
  (contactInfoData.value as IGroupModel)?.groupID ? true : false,
);
// 是否为申请类型
const isApplication = computed((): boolean => {
  return isApplicationType(contactInfoData?.value);
});
// 是否为双向好友关系, 若为群组类型则一直保持false
const isBothFriend = ref<boolean>(false);
// 是否是群成员（包含普通成员、管理员、群主）
const isGroupMember = computed((): boolean => {
  return (contactInfoData.value as IGroupModel)?.selfInfo?.userID ? true : false;
});
// 是否是黑名单用户, 若为群组类型则一直保持false
const isInBlackList = computed((): boolean => {
  return (
    !isGroup.value
    && blackList.value?.findIndex(
      (item: IBlackListUserItem) =>
        item?.userID === (contactInfoData.value as IBlackListUserItem)?.userID,
    ) >= 0
  );
});

const blackList = ref<Array<IBlackListUserItem>>([]);

const resetContactInfoUIData = () => {
  contactInfoData.value = {} as IContactInfoType;
  contactInfoBasicList.value = [];
  contactInfoMoreList.value = [];
  contactInfoButtonList.value = [];
};

const resetContactSearchingUIData = () => {
  TUIStore.update(StoreName.CUSTOM, 'currentContactInfo', {});
  TUIStore.update(StoreName.CUSTOM, 'currentContactSearchingStatus', false);
  TUIGlobal?.closeSearching && TUIGlobal?.closeSearching();
};

TUIStore.watch(StoreName.USER, {
  userBlacklist: (userBlacklist: Array<IBlackListUserItem>) => {
    blackList.value = userBlacklist;
  },
});

const onContactInfoEmitSubmit = (item: any) => {
  item.editSubmitHandler
  && item.editSubmitHandler({
    item,
    contactInfoData: contactInfoData.value,
    isBothFriend: isBothFriend.value,
    isInBlackList: isInBlackList.value,
  });
};

const onContactInfoButtonClicked = (item: any) => {
  item.onClick
  && item.onClick({
    contactInfoData: contactInfoData.value,
    contactInfoMoreList: contactInfoMoreList.value,
  });
  if (
    item.key === 'enterGroupConversation'
    || item.key === 'enterC2CConversation'
  ) {
    emits('switchConversation', contactInfoData.value);
    // 清空当前 contact 相关数据信息
    resetContactSearchingUIData();
  }
};

const generateMoreInfo = async () => {
  // 非 好友申请类 信息展示
  if (!isApplication.value) {
    // 非好友关系 / 非群成员 且 不在黑名单中 且 不是直播群，展示 申请加群/加好友验证信息 填写
    if (
      (!isGroup.value && !isBothFriend.value && !isInBlackList.value)
      || (isGroup.value
      && !isGroupMember.value
      && (contactInfoData.value as IGroupModel)?.type !== TUIChatEngine?.TYPES?.GRP_AVCHATROOM)
    ) {
      contactMoreInfoConfig.setWords.data = '';
      contactInfoMoreList.value.push(contactMoreInfoConfig.setWords);
    }
    // 用户界面，展示 备注名 设置，包含：
    // 1. 若为好友关系，直接修改好友相关资料
    // 2. 若非好友关系，且非黑名单用户，提供 申请加好友备注信息 填写
    if (!isGroup.value && !isInBlackList.value) {
      contactMoreInfoConfig.setRemark.data
        = (contactInfoData.value as Friend)?.remark || '';
      contactMoreInfoConfig.setRemark.editing = false;
      contactInfoMoreList.value.push(contactMoreInfoConfig.setRemark);
    }
    // 用户界面，展示 黑名单 设置，包含：
    // 1. 若为好友关系，提供设置黑名单入口
    // 2. 若已在黑名单中，提供接触黑名单入口
    if (!isGroup.value && (isBothFriend.value || isInBlackList.value)) {
      contactMoreInfoConfig.blackList.data = isInBlackList.value || false;
      contactInfoMoreList.value.push(contactMoreInfoConfig.blackList);
    }
  } else {
    // 对方 好友请求/群聊申请
    contactMoreInfoConfig.displayWords.data
      = (contactInfoData.value as FriendApplication)?.wording || '';
    contactInfoMoreList.value.push(contactMoreInfoConfig.displayWords);
  }
};

const generateButton = () => {
  // 黑名单用户，在解除黑名单前没有任何操作button
  if (isInBlackList.value) {
    return;
  }
  // 非黑名单用户
  if (isApplication.value) {
    if (
      (contactInfoData.value as FriendApplication)?.type
      === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME
    ) {
      contactInfoButtonList?.value?.push(
        contactButtonConfig.refuseFriendApplication,
      );
      contactInfoButtonList?.value?.push(
        contactButtonConfig.acceptFriendApplication,
      );
    }
  } else {
    if (isGroup.value && isGroupMember.value) {
      // 群聊信息页+是群成员
      switch ((contactInfoData.value as IGroupModel)?.selfInfo?.role) {
        case 'Owner':
          contactInfoButtonList?.value?.push(contactButtonConfig.dismissGroup);
          break;
        default:
          contactInfoButtonList?.value?.push(contactButtonConfig.quitGroup);
          break;
      }
      contactInfoButtonList?.value?.push(
        contactButtonConfig.enterGroupConversation,
      );
    } else if (!isGroup.value && isBothFriend.value) {
      // 用户信息页+是好友关系
      contactInfoButtonList?.value?.push(contactButtonConfig.deleteFriend);
      contactInfoButtonList?.value?.push(
        contactButtonConfig.enterC2CConversation,
      );
    } else {
      // 群聊信息页+不是群成员 / 用户信息页 + 非好友关系
      if (isGroup.value) {
        contactInfoButtonList?.value?.push(
          (contactInfoData.value as IGroupModel)?.type === TUIChatEngine?.TYPES?.GRP_AVCHATROOM
            ? contactButtonConfig.joinAVChatGroup
            : contactButtonConfig.joinGroup,
        );
      } else {
        contactInfoButtonList?.value?.push(contactButtonConfig.addFriend);
      }
    }
  }
};

// 总: 当前联系人信息页数据源获取
TUIStore.watch(StoreName.CUSTOM, {
  currentContactInfo: async (data: any) => {
    // 去重
    if (
      contactInfoData.value
      && data
      && JSON.stringify(contactInfoData.value) === JSON.stringify(data)
    ) {
      return;
    }
    resetContactInfoUIData();
    // deep clone
    contactInfoData.value = deepCopy(data) || {};
    if (!contactInfoData.value || Object.keys(contactInfoData.value)?.length === 0) {
      return;
    }
    contactInfoBasicList.value = generateContactInfoBasic(
      contactInfoData.value,
    );
    isBothFriend.value = await isFriend(contactInfoData.value);
    generateMoreInfo();
    generateButton();
    if (data.infoKeyList) {
      contactInfoMoreList.value = data.infoKeyList.map((key: string) => {
        return (contactMoreInfoConfig as any)[key];
      });
    }
    if (data.btnKeyList) {
      contactInfoButtonList.value = data.btnKeyList.map((key: string) => {
        return (contactButtonConfig as any)[key];
      });
    }
  },
});
</script>
<style lang="scss" scoped src="./style/index.scss"></style>
