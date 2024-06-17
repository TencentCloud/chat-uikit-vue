import TUIChatEngine, {
  TUIFriendService,
  TUIConversationService,
  TUIGroupService,
  TUIUserService,
  TUITranslateService,
  AddFriendParams,
  JoinGroupParams,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { Toast, TOAST_TYPE } from '../../common/Toast/index';

export const generateAvatar = (item: any): string => {
  return (
    item?.avatar
    || item?.profile?.avatar
    || (item?.groupID && 'https://web.sdk.qcloud.com/im/assets/images/Public.svg')
    || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png'
  );
};

export const generateName = (item: any): string => {
  return (
    item?.remark
    || item?.name
    || item?.profile?.nick
    || item?.nick
    || item?.groupID
    || item?.userID
    || ''
  );
};

export const generateContactInfoName = (item: any): string => {
  return (
    item?.name
    || item?.profile?.nick
    || item?.nick
    || item?.groupID
    || item?.userID
    || ''
  );
};

// Parse the basic information display content of the contactInfo module
// Group information display: group ID group type
// User information display: user ID personal signature
export const generateContactInfoBasic = (
  contactInfo: any,
): any[] => {
  const res = [
    {
      label: contactInfo?.groupID ? '群ID' : 'ID',
      data: contactInfo?.groupID || contactInfo?.userID || '',
    },
  ];
  if (!isApplicationType(contactInfo)) {
    res.push({
      label: contactInfo?.groupID ? '群类型' : '个性签名',
      data: contactInfo?.type || contactInfo?.profile?.selfSignature || '',
    });
  }
  return res;
};

export const isApplicationType = (info: any) => {
  return (
    info?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME
    || info?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  );
};

export const isFriend = (info: any): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (info?.groupID || !info?.userID) {
      resolve(false);
      return;
    }
    if (info?.addTime) {
      resolve(true);
      return;
    }
    TUIFriendService.checkFriend({
      userIDList: [info?.userID],
      type: TUIChatEngine.TYPES.SNS_CHECK_TYPE_BOTH,
    })
      .then((res: any) => {
        switch (res?.data?.successUserIDList[0]?.relation) {
          // No friend relationship: A does not have B in his friend list, and B does not have A in his friend list
          case TUIChatEngine.TYPES.SNS_TYPE_NO_RELATION:
            resolve(false);
            break;
          // Single-item friend: A has B in his friend list, but B does not have A in his friend list
          case TUIChatEngine.TYPES.SNS_TYPE_A_WITH_B:
            resolve(false);
            break;
          // Single-item friend: A does not have B in his friend list, but B has A in his friend list
          case TUIChatEngine.TYPES.SNS_TYPE_B_WITH_A:
            resolve(false);
            break;
          // Two-way friendship
          case TUIChatEngine.TYPES.SNS_TYPE_BOTH_WAY:
            resolve(true);
            break;
          default:
            resolve(false);
            break;
        }
      })
      .catch((error: any) => {
        console.warn('checkFriend error', error);
        reject(error);
      });
  });
};

// Change friend‘s remark
export const updateFriendRemark = (userID: string, remark: string) => {
  // eslint-disable-next-line no-control-regex
  if (remark?.replace(/[^\u0000-\u00ff]/g, 'aa')?.length > 96) {
    Toast({
      message: TUITranslateService.t('TUIContact.修改备注失败: 备注长度不得超过 96 字节'),
      type: TOAST_TYPE.ERROR,
    });
    return;
  }
  TUIFriendService.updateFriend({
    userID,
    remark,
  })
    .then(() => {
      Toast({
        message: TUITranslateService.t('TUIContact.修改备注成功'),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn('update friend remark failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.修改备注失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Delete one friend
export const deleteFriend = (userID: string) => {
  TUIFriendService.deleteFriend({
    userIDList: [userID],
    type: TUIChatEngine.TYPES.SNS_DELETE_TYPE_BOTH,
  })
    .then((res: any) => {
      const { successUserIDList } = res.data;
      if (successUserIDList[0].userID === userID) {
        Toast({
          message: TUITranslateService.t('TUIContact.删除好友成功'),
          type: TOAST_TYPE.SUCCESS,
        });
      } else {
        Toast({
          message: TUITranslateService.t('TUIContact.删除好友失败'),
          type: TOAST_TYPE.ERROR,
        });
      }
    })
    .catch((error: any) => {
      console.warn('delete friend failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.删除好友失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Add friend
export const addFriend = (params: AddFriendParams) => {
  TUIFriendService.addFriend(params)
    .then(() => {
      Toast({
        message: TUITranslateService.t('TUIContact.申请已发送'),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn('delete friend failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.申请发送失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Enter conversation
export const enterConversation = (item: any) => {
  const conversationID = item?.groupID
    ? `GROUP${item?.groupID}`
    : `C2C${item?.userID}`;
  TUIConversationService.switchConversation(conversationID).catch(
    (error: any) => {
      console.warn('switch conversation failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.进入会话失败'),
        type: TOAST_TYPE.ERROR,
      });
    },
  );
};

// Accept friend application
export const acceptFriendApplication = (userID: string) => {
  TUIFriendService.acceptFriendApplication({
    userID,
    type: TUIChatEngine.TYPES.SNS_APPLICATION_AGREE_AND_ADD,
  })
    .then(() => {
      Toast({
        message: TUITranslateService.t('TUIContact.添加好友成功'),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn('accept friend application failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.同意好友申请失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Refuse friend application
export const refuseFriendApplication = (userID: string) => {
  TUIFriendService.refuseFriendApplication(userID)
    .then(() => {
      Toast({
        message: TUITranslateService.t('TUIContact.拒绝成功'),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn('accept friend application failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.拒绝好友申请失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Dismiss group
export const dismissGroup = (groupID: string) => {
  TUIGroupService.dismissGroup(groupID)
    .then(() => {
      Toast({
        message: TUITranslateService.t('TUIContact.解散群聊成功'),
        type: TOAST_TYPE.SUCCESS,
      });
      TUIGlobal?.updateContactSearch && TUIGlobal?.updateContactSearch();
    })
    .catch((error: any) => {
      console.warn('dismiss group failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.解散群聊失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Quit group
export const quitGroup = (groupID: string) => {
  TUIGroupService.quitGroup(groupID)
    .then(() => {
      Toast({
        message: TUITranslateService.t('TUIContact.退出群组成功'),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn('quit group failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.退出群组失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Join group
export const joinGroup = (groupID: string, applyMessage?: string) => {
  TUIGroupService.joinGroup({
    groupID,
    applyMessage,
  } as JoinGroupParams)
    .then((imResponse: { data: { status?: string } }) => {
      switch (imResponse?.data?.status) {
        case TUIChatEngine.TYPES.JOIN_STATUS_WAIT_APPROVAL: // Wait for administrator approval
          Toast({
            message: TUITranslateService.t('TUIContact.等待管理员同意'),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        case TUIChatEngine.TYPES.JOIN_STATUS_SUCCESS: // Join group successfully
          Toast({
            message: TUITranslateService.t('TUIContact.加群成功'),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        case TUIChatEngine.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // Already in the group
          Toast({
            message: TUITranslateService.t('TUIContact.您已是群成员'),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        default:
          break;
      }
    })
    .catch((error: any) => {
      console.warn('join group failed:', error);
      Toast({
        message: '申请入群失败',
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Add to blacklist
export const addToBlacklist = (userID: string, successCallBack?: () => void) => {
  TUIUserService.addToBlacklist({
    userIDList: [userID],
  })
    .then(() => {
      successCallBack && successCallBack();
    })
    .catch((error: any) => {
      console.warn('add to blacklist failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.加入黑名单失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// Remove from Blacklist
export const removeFromBlacklist = (
  userID: string,
  successCallBack?: () => void,
) => {
  TUIUserService.removeFromBlacklist({
    userIDList: [userID],
  })
    .then(() => {
      successCallBack && successCallBack();
    })
    .catch((error: any) => {
      console.warn('remove from blacklist failed:', error);
      Toast({
        message: TUITranslateService.t('TUIContact.移除黑名单失败'),
        type: TOAST_TYPE.ERROR,
      });
    });
};
