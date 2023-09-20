"use strict";
exports.__esModule = true;
exports.contactButtonConfig = exports.contactMoreInfoConfig = void 0;
var constant_1 = require("../../../constant");
var index_1 = require("../utils/index");
exports.contactMoreInfoConfig = {
    // 设置好友备注
    setRemark: {
        key: "setRemark",
        label: "备注名",
        data: "",
        labelPosition: constant_1.CONTACT_INFO_LABEL_POSITION.LEFT,
        editable: true,
        editType: constant_1.CONTACT_INFO_MORE_EDIT_TYPE.INPUT,
        editing: false,
        editSubmitHandler: function (props) {
            var _a, _b, _c, _d, _e, _f;
            if (props === null || props === void 0 ? void 0 : props.isBothFriend) {
                var newRemarkValue = (_a = props === null || props === void 0 ? void 0 : props.item) === null || _a === void 0 ? void 0 : _a.data;
                index_1.updateFriendRemark((_b = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _b === void 0 ? void 0 : _b.userID, newRemarkValue);
                ((_c = props === null || props === void 0 ? void 0 : props.item) === null || _c === void 0 ? void 0 : _c.editing) && (props.item.editing = false);
                ((_d = props === null || props === void 0 ? void 0 : props.item) === null || _d === void 0 ? void 0 : _d.data) && (props.item.data = (_e = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _e === void 0 ? void 0 : _e.remark);
            }
            else {
                ((_f = props === null || props === void 0 ? void 0 : props.item) === null || _f === void 0 ? void 0 : _f.editing) && (props.item.editing = false);
            }
        }
    },
    // 黑名单
    blackList: {
        key: "blackList",
        label: "加入黑名单",
        data: false,
        labelPosition: constant_1.CONTACT_INFO_LABEL_POSITION.LEFT,
        editable: true,
        editType: constant_1.CONTACT_INFO_MORE_EDIT_TYPE.SWITCH,
        editing: true,
        editSubmitHandler: function (props) {
            var _a, _b;
            if (props === null || props === void 0 ? void 0 : props.isInBlackList) {
                index_1.removeFromBlacklist((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.userID);
            }
            else {
                index_1.addToBlacklist((_b = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _b === void 0 ? void 0 : _b.userID);
            }
        }
    },
    // 填写验证信息（申请方）
    setWords: {
        key: "setWords",
        label: "请填写验证信息",
        data: "",
        labelPosition: constant_1.CONTACT_INFO_LABEL_POSITION.TOP,
        editable: true,
        editType: constant_1.CONTACT_INFO_MORE_EDIT_TYPE.TEXTAREA,
        editing: true
    },
    // 展示验证信息（申请接收方）
    displayWords: {
        key: "displayWords",
        label: "验证信息",
        data: "",
        labelPosition: constant_1.CONTACT_INFO_LABEL_POSITION.LEFT,
        editable: false
    }
};
exports.contactButtonConfig = {
    // ---------------------
    // group command config
    // ---------------------
    dismissGroup: {
        key: "dismissGroup",
        label: "解散群聊",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.CANCEL,
        onClick: function (props) {
            var _a;
            index_1.dismissGroup((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.groupID);
        }
    },
    quitGroup: {
        key: "quitGroup",
        label: "退出群聊",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.CANCEL,
        onClick: function (props) {
            var _a;
            index_1.quitGroup((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.groupID);
        }
    },
    joinGroup: {
        key: "joinGroup",
        label: "发送申请",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.SUBMIT,
        onClick: function (props) {
            var _a, _b;
            index_1.joinGroup((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.groupID, (_b = props === null || props === void 0 ? void 0 : props.contactInfoMoreList[0]) === null || _b === void 0 ? void 0 : _b.data);
        }
    },
    joinAVChatGroup: {
        key: "joinAVChatGroup",
        label: "加入直播群",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.SUBMIT,
        onClick: function (props) {
            var _a;
            index_1.joinGroup((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.groupID);
        }
    },
    enterGroupConversation: {
        key: "enterGroupConversation",
        label: "进入群聊",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.SUBMIT,
        onClick: function (props) {
            index_1.enterConversation(props === null || props === void 0 ? void 0 : props.contactInfoData);
        }
    },
    // ---------------------
    // friend command config
    // ---------------------
    addFriend: {
        key: "addFriend",
        label: "发送申请",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.SUBMIT,
        onClick: function (props) {
            var _a, _b, _c;
            index_1.addFriend({
                to: (_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.userID,
                source: "AddSource_Type_Web",
                remark: (_b = props === null || props === void 0 ? void 0 : props.contactInfoMoreList[1]) === null || _b === void 0 ? void 0 : _b.data,
                wording: (_c = props === null || props === void 0 ? void 0 : props.contactInfoMoreList[0]) === null || _c === void 0 ? void 0 : _c.data
            });
        }
    },
    deleteFriend: {
        key: "deleteFriend",
        label: "删除好友",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.CANCEL,
        onClick: function (props) {
            var _a;
            index_1.deleteFriend((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.userID);
        }
    },
    enterC2CConversation: {
        key: "enterC2CConversation",
        label: "发送消息",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.SUBMIT,
        onClick: function (props) {
            index_1.enterConversation(props === null || props === void 0 ? void 0 : props.contactInfoData);
        }
    },
    // ---------------------
    // friend application command config
    // ---------------------
    acceptFriendApplication: {
        key: "acceptFriendApplication",
        label: "同意",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.SUBMIT,
        onClick: function (props) {
            var _a;
            index_1.acceptFriendApplication((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.userID);
        }
    },
    refuseFriendApplication: {
        key: "refuseFriendApplication",
        label: "拒绝",
        type: constant_1.CONTACT_INFO_BUTTON_TYPE.CANCEL,
        onClick: function (props) {
            var _a;
            index_1.refuseFriendApplication((_a = props === null || props === void 0 ? void 0 : props.contactInfoData) === null || _a === void 0 ? void 0 : _a.userID);
        }
    }
};
