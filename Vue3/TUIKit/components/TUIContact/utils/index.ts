import TUIChatEngine, {
  TUIFriendService,
  TUIConversationService,
  TUIGroupService,
  TUIUserService,
  TUITranslateService,
  AddFriendParams,
} from "@tencentcloud/chat-uikit-engine";
import { Toast, TOAST_TYPE } from "../../common/Toast/index";
import { TUIGlobal } from "../../../utils/universal-api/index";

// 解析 用户头像/群头像
export const generateAvatar = (item: any): string => {
  return (
    item?.avatar ||
    item?.profile?.avatar ||
    (item?.groupID &&
      "https://web.sdk.qcloud.com/im/assets/images/Public.svg") ||
    "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png"
  );
};

// 解析 用户名称/群名称
export const generateName = (item: any): string => {
  return (
    item?.remark ||
    item?.name ||
    item?.profile?.nick ||
    item?.nick ||
    item?.groupID ||
    item?.userID ||
    ""
  );
};

// 解析 信息界面 用户名称/群名称
export const generateContactInfoName = (item: any): string => {
  return (
    item?.name ||
    item?.profile?.nick ||
    item?.nick ||
    item?.groupID ||
    item?.userID ||
    ""
  );
};

// 解析 contactInfo 模块 基础信息展示内容
// 群信息展示: 群ID 群类型
// 用户信息展示: 用户ID 个性签名
export const generateContactInfoBasic = (
  contactInfo: any
): Array<{ label: string; data: string }> => {
  let res = [
    {
      label: contactInfo?.groupID ? "群ID" : "ID",
      data: contactInfo?.groupID || contactInfo?.userID || "",
    },
  ];
  if (!isApplicationType(contactInfo)) {
    res.push({
      label: contactInfo?.groupID ? "群类型" : "个性签名",
      data: contactInfo?.type || contactInfo?.profile?.selfSignature || "",
    });
  }
  return res;
};

// 判断是否为申请
export const isApplicationType = (info: any) => {
  return (
    info?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_TO_ME ||
    info?.type === TUIChatEngine?.TYPES?.SNS_APPLICATION_SENT_BY_ME
  );
};

// 好友相关
// 判断是否为双向好友关系
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
          // 无好友关系：A 的好友表中没有 B，B 的好友表中也没有 A
          case TUIChatEngine.TYPES.SNS_TYPE_NO_RELATION:
            resolve(false);
            break;
          // 单项好友：A 的好友表中有 B，但 B 的好友表中没有 A
          case TUIChatEngine.TYPES.SNS_TYPE_A_WITH_B:
            resolve(false);
            break;
          // 单项好友：A 的好友表中没有 B，但 B 的好友表中有 A
          case TUIChatEngine.TYPES.SNS_TYPE_B_WITH_A:
            resolve(false);
            break;
          // 双向好友关系
          case TUIChatEngine.TYPES.SNS_TYPE_BOTH_WAY:
            resolve(true);
            break;
          default:
            resolve(false);
            break;
        }
      })
      .catch((error: any) => {
        console.warn("checkFriend error", error);
        reject(error);
      });
  });
};

// 修改好友备注 / change friend‘s remark
export const updateFriendRemark = (userID: string, remark: string) => {
  // eslint-disable-next-line no-control-regex
  if (remark?.replace(/[^\u0000-\u00ff]/g, "aa")?.length > 96) {
    Toast({
      message: TUITranslateService.t("TUIContact.修改备注失败: 备注长度不得超过 96 字节"),
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
        message: TUITranslateService.t("TUIContact.修改备注成功"),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn("update friend remark failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.修改备注失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 删除某个好友 / delete one friend
export const deleteFriend = (userID: string) => {
  TUIFriendService.deleteFriend({
    userIDList: [userID],
    type: TUIChatEngine.TYPES.SNS_DELETE_TYPE_BOTH,
  })
    .then((res: any) => {
      const { successUserIDList } = res.data;
      if (successUserIDList[0].userID === userID) {
        Toast({
          message: TUITranslateService.t("TUIContact.删除好友成功"),
          type: TOAST_TYPE.SUCCESS,
        });
      } else {
        Toast({
          message: TUITranslateService.t("TUIContact.删除好友失败"),
          type: TOAST_TYPE.ERROR,
        });
      }
    })
    .catch((error: any) => {
      console.warn("delete friend failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.删除好友失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 添加好友 / add friend
export const addFriend = (params: AddFriendParams) => {
  TUIFriendService.addFriend(params)
    .then((res: any) => {
      Toast({
        message: TUITranslateService.t("TUIContact.申请已发送"),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn("delete friend failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.申请发送失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 进入会话 / enter conversation
// todo：后续抽离为切换会话服务
export const enterConversation = (item: any) => {
  const conversationID = item?.groupID
    ? `GROUP${item?.groupID}`
    : `C2C${item?.userID}`;
  TUIConversationService.switchConversation(conversationID).catch(
    (error: any) => {
      console.warn("switch conversation failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.进入会话失败"),
        type: TOAST_TYPE.ERROR,
      });
    }
  );
};

// 同意好友申请 / accept friend application
export const acceptFriendApplication = (userID: string) => {
  TUIFriendService.acceptFriendApplication({
    userID,
    type: TUIChatEngine.TYPES.SNS_APPLICATION_AGREE_AND_ADD,
  })
    .then(() => {
      Toast({
        message: TUITranslateService.t("TUIContact.添加好友成功"),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn("accept friend application failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.同意好友申请失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 拒绝好友申请 / refuse friend application
export const refuseFriendApplication = (userID: string) => {
  TUIFriendService.refuseFriendApplication(userID)
    .then(() => {
      Toast({
        message: TUITranslateService.t("TUIContact.拒绝成功"),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn("accept friend application failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.拒绝好友申请失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 群组相关
// todo: 后续抽离为 TUIGroup/server 中以 extension 形式提供
// 解散群聊 / dismiss group
export const dismissGroup = (groupID: string) => {
  TUIGroupService.dismissGroup(groupID)
    .then(() => {
      Toast({
        message: TUITranslateService.t("TUIContact.解散群聊成功"),
        type: TOAST_TYPE.SUCCESS,
      });
      // 解散群聊后特殊情况：
      // 如果当前为 TUIContact 搜索状态，即 currentContactSearchingStatus === true
      // 且当前打开的为 搜索结果 中的 群聊信息界面
      // 需要更新搜索结果相关更新数据
      TUIGlobal?.updateContactSearch && TUIGlobal?.updateContactSearch();
    })
    .catch((error: any) => {
      console.warn("dismiss group failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.解散群聊失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 退出群聊 / quit group
export const quitGroup = (groupID: string) => {
  TUIGroupService.quitGroup(groupID)
    .then(() => {
      Toast({
        message: TUITranslateService.t("TUIContact.退出群组成功"),
        type: TOAST_TYPE.SUCCESS,
      });
    })
    .catch((error: any) => {
      console.warn("quit group failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.退出群组失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 申请加入群聊 / join group
export const joinGroup = (groupID: string, applyMessage?: string) => {
  TUIGroupService.joinGroup({
    groupID,
    applyMessage,
  })
    .then((imResponse: { data: { status?: string } }) => {
      switch (imResponse?.data?.status) {
        case TUIChatEngine.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
          Toast({
            message: TUITranslateService.t("TUIContact.等待管理员同意"),
            type: TOAST_TYPE.SUCCESS,
          });
          break;
        case TUIChatEngine.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
          // todo: 切换到群聊所在chat界面
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
      console.warn("join group failed:", error);
      Toast({
        message: "申请入群失败",
        type: TOAST_TYPE.ERROR,
      });
    });
};

// 以下为黑名单相关逻辑
// 加入黑名单
export const addToBlacklist = (userID: string, successCallBack?: Function) => {
  TUIUserService.addToBlacklist({
    userIDList: [userID],
  })
    .then((res: any) => {
      successCallBack && successCallBack();
    })
    .catch((error: any) => {
      console.warn("add to blacklist failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.加入黑名单失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};
// 移除黑名单
export const removeFromBlacklist = (
  userID: string,
  successCallBack?: Function
) => {
  TUIUserService.removeFromBlacklist({
    userIDList: [userID],
  })
    .then((res: any) => {
      successCallBack && successCallBack();
    })
    .catch((error: any) => {
      console.warn("remove from balcklist failed:", error);
      Toast({
        message: TUITranslateService.t("TUIContact.移除黑名单失败"),
        type: TOAST_TYPE.ERROR,
      });
    });
};
