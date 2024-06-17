import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import {
  CONTACT_INFO_LABEL_POSITION,
  CONTACT_INFO_MORE_EDIT_TYPE,
  CONTACT_INFO_BUTTON_TYPE,
} from '../../../constant';
import {
  updateFriendRemark,
  deleteFriend,
  enterConversation,
  quitGroup,
  dismissGroup,
  joinGroup,
  addFriend,
  acceptFriendApplication,
  refuseFriendApplication,
  addToBlacklist,
  removeFromBlacklist,
} from '../utils/index';

export const contactMoreInfoConfig = {
  // set friends' remark
  setRemark: {
    key: 'setRemark',
    label: '备注名',
    data: '',
    labelPosition: CONTACT_INFO_LABEL_POSITION.LEFT,
    editable: true,
    editType: CONTACT_INFO_MORE_EDIT_TYPE.INPUT,
    editing: false,
    editSubmitHandler: (props: {
      item: any;
      contactInfoData: any;
      [propsName: string]: any;
    }) => {
      if (props?.isBothFriend) {
        const newRemarkValue = props?.item?.data;
        updateFriendRemark(props?.contactInfoData?.userID, newRemarkValue);
        props?.item?.editing && (props.item.editing = false);
        props?.item?.data && (props.item.data = props?.contactInfoData?.remark);
      } else {
        props?.item?.editing && (props.item.editing = false);
      }
    },
  },
  // blocked list
  blackList: {
    key: 'blackList',
    label: '加入黑名单',
    data: false,
    labelPosition: CONTACT_INFO_LABEL_POSITION.LEFT,
    editable: true,
    editType: CONTACT_INFO_MORE_EDIT_TYPE.SWITCH,
    editing: true,
    editSubmitHandler: (props: {
      item: any;
      contactInfoData: any;
      [propsName: string]: any;
    }) => {
      if (props?.isInBlackList) {
        removeFromBlacklist(props?.contactInfoData?.userID);
      } else {
        addToBlacklist(props?.contactInfoData?.userID);
        TUIStore.update(StoreName.CUSTOM, 'currentContactListKey', 'blackList');
      }
    },
  },
  // Fill in verification words (applicant)
  setWords: {
    key: 'setWords',
    label: '请填写验证信息',
    data: '',
    labelPosition: CONTACT_INFO_LABEL_POSITION.TOP,
    editable: true,
    editType: CONTACT_INFO_MORE_EDIT_TYPE.TEXTAREA,
    editing: true,
  },
  // Display verification words (application recipient)
  displayWords: {
    key: 'displayWords',
    label: '验证信息',
    data: '',
    labelPosition: CONTACT_INFO_LABEL_POSITION.LEFT,
    editable: false,
  },
};

export const contactButtonConfig = {
  // ---------------------
  // group command config
  // ---------------------
  dismissGroup: {
    key: 'dismissGroup',
    label: '解散群聊',
    type: CONTACT_INFO_BUTTON_TYPE.CANCEL,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      dismissGroup(props?.contactInfoData?.groupID);
    },
  },
  quitGroup: {
    key: 'quitGroup',
    label: '退出群聊',
    type: CONTACT_INFO_BUTTON_TYPE.CANCEL,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      quitGroup(props?.contactInfoData?.groupID);
    },
  },
  joinGroup: {
    key: 'joinGroup',
    label: '发送申请',
    type: CONTACT_INFO_BUTTON_TYPE.SUBMIT,
    onClick: (props: {
      contactInfoData: any;
      contactInfoMoreList: any;
      [propsName: string]: any;
    }) => {
      joinGroup(
        props?.contactInfoData?.groupID,
        props?.contactInfoMoreList[0]?.data,
      );
    },
  },
  joinAVChatGroup: {
    key: 'joinAVChatGroup',
    label: '加入直播群',
    type: CONTACT_INFO_BUTTON_TYPE.SUBMIT,
    onClick: (props: {
      contactInfoData: any;
      contactInfoMoreList: any;
      [propsName: string]: any;
    }) => {
      joinGroup(props?.contactInfoData?.groupID);
    },
  },
  enterGroupConversation: {
    key: 'enterGroupConversation',
    label: '进入群聊',
    type: CONTACT_INFO_BUTTON_TYPE.SUBMIT,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      enterConversation(props?.contactInfoData);
    },
  },

  // ---------------------
  // friend command config
  // ---------------------
  addFriend: {
    key: 'addFriend',
    label: '发送申请',
    type: CONTACT_INFO_BUTTON_TYPE.SUBMIT,
    onClick: (props: {
      contactInfoData: any;
      contactInfoMoreList: any;
      [propsName: string]: any;
    }) => {
      addFriend({
        to: props?.contactInfoData?.userID,
        source: 'AddSource_Type_Web',
        remark: props?.contactInfoMoreList[1]?.data,
        wording: props?.contactInfoMoreList[0]?.data,
      });
    },
  },
  deleteFriend: {
    key: 'deleteFriend',
    label: '删除好友',
    type: CONTACT_INFO_BUTTON_TYPE.CANCEL,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      deleteFriend(props?.contactInfoData?.userID);
    },
  },
  enterC2CConversation: {
    key: 'enterC2CConversation',
    label: '发送消息',
    type: CONTACT_INFO_BUTTON_TYPE.SUBMIT,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      enterConversation(props?.contactInfoData);
    },
  },

  // ---------------------
  // friend application command config
  // ---------------------
  acceptFriendApplication: {
    key: 'acceptFriendApplication',
    label: '同意',
    type: CONTACT_INFO_BUTTON_TYPE.SUBMIT,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      acceptFriendApplication(props?.contactInfoData?.userID);
      TUIStore.update(StoreName.CUSTOM, 'currentContactListKey', 'friendList');
    },
  },
  refuseFriendApplication: {
    key: 'refuseFriendApplication',
    label: '拒绝',
    type: CONTACT_INFO_BUTTON_TYPE.CANCEL,
    onClick: (props: { contactInfoData: any; [propsName: string]: any }) => {
      refuseFriendApplication(props?.contactInfoData?.userID);
    },
  },
};
