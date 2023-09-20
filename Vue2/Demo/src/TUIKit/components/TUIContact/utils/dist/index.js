"use strict";
exports.__esModule = true;
exports.removeFromBlacklist = exports.addToBlacklist = exports.joinGroup = exports.quitGroup = exports.dismissGroup = exports.refuseFriendApplication = exports.acceptFriendApplication = exports.enterConversation = exports.addFriend = exports.deleteFriend = exports.updateFriendRemark = exports.isFriend = exports.isApplicationType = exports.generateContactInfoBasic = exports.generateContactInfoName = exports.generateName = exports.generateAvatar = void 0;
var chat_uikit_engine_1 = require("@tencentcloud/chat-uikit-engine");
var index_1 = require("../../common/Toast/index");
// 解析 用户头像/群头像
exports.generateAvatar = function (item) {
    var _a;
    return ((item === null || item === void 0 ? void 0 : item.avatar) || ((_a = item === null || item === void 0 ? void 0 : item.profile) === null || _a === void 0 ? void 0 : _a.avatar) ||
        ((item === null || item === void 0 ? void 0 : item.groupID) &&
            "https://web.sdk.qcloud.com/im/assets/images/Public.svg") ||
        "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png");
};
// 解析 用户名称/群名称
exports.generateName = function (item) {
    var _a;
    return ((item === null || item === void 0 ? void 0 : item.remark) || (item === null || item === void 0 ? void 0 : item.name) || ((_a = item === null || item === void 0 ? void 0 : item.profile) === null || _a === void 0 ? void 0 : _a.nick) || (item === null || item === void 0 ? void 0 : item.nick) || (item === null || item === void 0 ? void 0 : item.groupID) || (item === null || item === void 0 ? void 0 : item.userID) ||
        "");
};
// 解析 信息界面 用户名称/群名称
exports.generateContactInfoName = function (item) {
    var _a;
    return ((item === null || item === void 0 ? void 0 : item.name) || ((_a = item === null || item === void 0 ? void 0 : item.profile) === null || _a === void 0 ? void 0 : _a.nick) || (item === null || item === void 0 ? void 0 : item.nick) || (item === null || item === void 0 ? void 0 : item.groupID) || (item === null || item === void 0 ? void 0 : item.userID) ||
        "");
};
// 解析 contactInfo 模块 基础信息展示内容
// 群信息展示: 群ID 群类型
// 用户信息展示: 用户ID 个性签名
exports.generateContactInfoBasic = function (contactInfo) {
    var _a;
    var res = [
        {
            label: (contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.groupID) ? "群ID" : "ID",
            data: (contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.groupID) || (contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.userID) || ""
        },
    ];
    if (!exports.isApplicationType(contactInfo)) {
        res.push({
            label: (contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.groupID) ? "群类型" : "个性签名",
            data: (contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.type) || ((_a = contactInfo === null || contactInfo === void 0 ? void 0 : contactInfo.profile) === null || _a === void 0 ? void 0 : _a.selfSignature) || ""
        });
    }
    return res;
};
// 判断是否为申请
exports.isApplicationType = function (info) {
    var _a, _b;
    return ((info === null || info === void 0 ? void 0 : info.type) === ((_a = chat_uikit_engine_1["default"] === null || chat_uikit_engine_1["default"] === void 0 ? void 0 : chat_uikit_engine_1["default"].TYPES) === null || _a === void 0 ? void 0 : _a.SNS_APPLICATION_SENT_TO_ME) ||
        (info === null || info === void 0 ? void 0 : info.type) === ((_b = chat_uikit_engine_1["default"] === null || chat_uikit_engine_1["default"] === void 0 ? void 0 : chat_uikit_engine_1["default"].TYPES) === null || _b === void 0 ? void 0 : _b.SNS_APPLICATION_SENT_BY_ME));
};
// 好友相关
// 判断是否为双向好友关系
exports.isFriend = function (info) {
    return new Promise(function (resolve, reject) {
        if ((info === null || info === void 0 ? void 0 : info.groupID) || !(info === null || info === void 0 ? void 0 : info.userID)) {
            resolve(false);
            return;
        }
        if (info === null || info === void 0 ? void 0 : info.addTime) {
            resolve(true);
            return;
        }
        chat_uikit_engine_1.TUIFriendService.checkFriend({
            userIDList: [info === null || info === void 0 ? void 0 : info.userID],
            type: chat_uikit_engine_1["default"].TYPES.SNS_CHECK_TYPE_BOTH
        })
            .then(function (res) {
            var _a, _b;
            switch ((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.successUserIDList[0]) === null || _b === void 0 ? void 0 : _b.relation) {
                // 无好友关系：A 的好友表中没有 B，B 的好友表中也没有 A
                case chat_uikit_engine_1["default"].TYPES.SNS_TYPE_NO_RELATION:
                    resolve(false);
                    break;
                // 单项好友：A 的好友表中有 B，但 B 的好友表中没有 A
                case chat_uikit_engine_1["default"].TYPES.SNS_TYPE_A_WITH_B:
                    resolve(false);
                    break;
                // 单项好友：A 的好友表中没有 B，但 B 的好友表中有 A
                case chat_uikit_engine_1["default"].TYPES.SNS_TYPE_B_WITH_A:
                    resolve(false);
                    break;
                // 双向好友关系
                case chat_uikit_engine_1["default"].TYPES.SNS_TYPE_BOTH_WAY:
                    resolve(true);
                    break;
                default:
                    resolve(false);
                    break;
            }
        })["catch"](function (error) {
            console.warn("checkFriend error", error);
            reject(error);
        });
    });
};
// 修改好友备注 / change friend‘s remark
exports.updateFriendRemark = function (userID, remark) {
    var _a;
    // eslint-disable-next-line no-control-regex
    if (((_a = remark === null || remark === void 0 ? void 0 : remark.replace(/[^\u0000-\u00ff]/g, "aa")) === null || _a === void 0 ? void 0 : _a.length) > 96) {
        index_1.Toast({
            message: "修改备注失败: 备注长度不得超过 96 字节",
            type: index_1.TOAST_TYPE.ERROR
        });
        return;
    }
    chat_uikit_engine_1.TUIFriendService.updateFriend({
        userID: userID,
        remark: remark
    })
        .then(function () {
        index_1.Toast({
            message: "修改备注成功",
            type: index_1.TOAST_TYPE.SUCCESS
        });
    })["catch"](function (error) {
        console.warn("update friend remark failed:", error);
        index_1.Toast({
            message: "修改备注失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 删除某个好友 / delete one friend
exports.deleteFriend = function (userID) {
    chat_uikit_engine_1.TUIFriendService.deleteFriend({
        userIDList: [userID],
        type: chat_uikit_engine_1["default"].TYPES.SNS_DELETE_TYPE_BOTH
    })
        .then(function (res) {
        var successUserIDList = res.data.successUserIDList;
        if (successUserIDList[0].userID === userID) {
            index_1.Toast({
                message: "删除好友成功",
                type: index_1.TOAST_TYPE.SUCCESS
            });
        }
        else {
            index_1.Toast({
                message: "删除好友失败",
                type: index_1.TOAST_TYPE.ERROR
            });
        }
    })["catch"](function (error) {
        console.warn("delete friend failed:", error);
        index_1.Toast({
            message: "删除好友失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 添加好友 / add friend
exports.addFriend = function (params) {
    chat_uikit_engine_1.TUIFriendService.addFriend(params)
        .then(function (res) {
        var _a, _b;
        index_1.Toast({
            message: ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.message) ? (_b = res === null || res === void 0 ? void 0 : res.data) === null || _b === void 0 ? void 0 : _b.message : "申请已发送",
            type: index_1.TOAST_TYPE.SUCCESS
        });
    })["catch"](function (error) {
        console.warn("delete friend failed:", error);
        index_1.Toast({
            message: "申请发送失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 进入会话 / enter conversation
// todo：后续抽离为切换会话服务
exports.enterConversation = function (item) {
    // todo: 目前仅处理 web / h5 切换到当前会话 情况
    // uniapp 版本待处理
    var conversationID = (item === null || item === void 0 ? void 0 : item.groupID) ? "GROUP" + (item === null || item === void 0 ? void 0 : item.groupID)
        : "C2C" + (item === null || item === void 0 ? void 0 : item.userID);
    chat_uikit_engine_1.TUIConversationService.switchConversation(conversationID)["catch"](function (error) {
        console.warn("switch conversation failed:", error);
        index_1.Toast({
            message: "进入会话失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 同意好友申请 / accept friend application
exports.acceptFriendApplication = function (userID) {
    chat_uikit_engine_1.TUIFriendService.acceptFriendApplication({
        userID: userID,
        type: chat_uikit_engine_1["default"].TYPES.SNS_APPLICATION_AGREE_AND_ADD
    })
        .then(function () {
        index_1.Toast({
            message: "添加好友成功",
            type: index_1.TOAST_TYPE.SUCCESS
        });
    })["catch"](function (error) {
        console.warn("accept friend application failed:", error);
        index_1.Toast({
            message: "同意好友申请失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 拒绝好友申请 / refuse friend application
exports.refuseFriendApplication = function (userID) {
    chat_uikit_engine_1.TUIFriendService.refuseFriendApplication(userID)
        .then(function () {
        index_1.Toast({
            message: "拒绝成功",
            type: index_1.TOAST_TYPE.SUCCESS
        });
    })["catch"](function (error) {
        console.warn("accept friend application failed:", error);
        index_1.Toast({
            message: "拒绝好友申请失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 群组相关
// todo: 后续抽离为 TUIGroup/server 中以 extension 形式提供
// 解散群聊 / dismiss group
exports.dismissGroup = function (groupID) {
    chat_uikit_engine_1.TUIGroupService.dismissGroup(groupID)
        .then(function () {
        index_1.Toast({
            message: "解散群聊成功",
            type: index_1.TOAST_TYPE.SUCCESS
        });
        // 解散群聊后特殊情况：
        // 如果当前为 TUIContact 搜索状态，即 currentContactSearchingStatus === true
        // 且当前打开的为 搜索结果 中的 群聊信息界面
        // 需要更新搜索结果相关更新数据
        (chat_uikit_engine_1.TUIGlobal === null || chat_uikit_engine_1.TUIGlobal === void 0 ? void 0 : chat_uikit_engine_1.TUIGlobal.updateContactSearch) && (chat_uikit_engine_1.TUIGlobal === null || chat_uikit_engine_1.TUIGlobal === void 0 ? void 0 : chat_uikit_engine_1.TUIGlobal.updateContactSearch());
    })["catch"](function (error) {
        console.warn("dismiss group failed:", error);
        index_1.Toast({
            message: "解散群聊失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 退出群聊 / quit group
exports.quitGroup = function (groupID) {
    chat_uikit_engine_1.TUIGroupService.quitGroup(groupID)
        .then(function () {
        index_1.Toast({
            message: "退出群组成功",
            type: index_1.TOAST_TYPE.SUCCESS
        });
    })["catch"](function (error) {
        console.warn("quit group failed:", error);
        index_1.Toast({
            message: "退出群组失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 申请加入群聊 / join group
exports.joinGroup = function (groupID, applyMessage) {
    chat_uikit_engine_1.TUIGroupService.joinGroup({
        groupID: groupID,
        applyMessage: applyMessage
    })
        .then(function (imResponse) {
        var _a;
        switch ((_a = imResponse === null || imResponse === void 0 ? void 0 : imResponse.data) === null || _a === void 0 ? void 0 : _a.status) {
            case chat_uikit_engine_1["default"].TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
                index_1.Toast({
                    message: chat_uikit_engine_1.TUITranslateService.t("TUIContact.等待管理员同意"),
                    type: index_1.TOAST_TYPE.SUCCESS
                });
                break;
            case chat_uikit_engine_1["default"].TYPES.JOIN_STATUS_SUCCESS: // 加群成功
                // todo: 切换到群聊所在chat界面
                index_1.Toast({
                    message: chat_uikit_engine_1.TUITranslateService.t("TUIContact.加群成功"),
                    type: index_1.TOAST_TYPE.SUCCESS
                });
                break;
            case chat_uikit_engine_1["default"].TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
                index_1.Toast({
                    message: chat_uikit_engine_1.TUITranslateService.t("TUIContact.您已是群成员"),
                    type: index_1.TOAST_TYPE.SUCCESS
                });
                break;
            default:
                break;
        }
    })["catch"](function (error) {
        console.warn("join group failed:", error);
        index_1.Toast({
            message: "申请入群失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 以下为黑名单相关逻辑
// 加入黑名单
exports.addToBlacklist = function (userID, successCallBack) {
    chat_uikit_engine_1.TUIUserService.addToBlacklist({
        userIDList: [userID]
    })
        .then(function (res) {
        successCallBack && successCallBack();
    })["catch"](function (error) {
        console.warn("add to blacklist failed:", error);
        index_1.Toast({
            message: "加入黑名单失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
// 移除黑名单
exports.removeFromBlacklist = function (userID, successCallBack) {
    chat_uikit_engine_1.TUIUserService.removeFromBlacklist({
        userIDList: [userID]
    })
        .then(function (res) {
        successCallBack && successCallBack();
    })["catch"](function (error) {
        console.warn("remove from balcklist failed:", error);
        index_1.Toast({
            message: "移除黑名单失败",
            type: index_1.TOAST_TYPE.ERROR
        });
    });
};
