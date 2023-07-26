"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var _this = this;
exports.__esModule = true;
exports.handleSkeletonSize = exports.isMessageTip = exports.throttle = exports.deepCopy = exports.isTypingMessage = exports.JSONToObject = exports.isJSON = exports.handleOptions = exports.isUrl = exports.getImgLoad = exports.translateGroupSystemNotice = exports.handleCustomMessageShowContext = exports.extractCallingInfoFromMessage = exports.handleMergerMessageShowContext = exports.handleFileMessageShowContext = exports.handleAudioMessageShowContext = exports.handleVideoMessageShowContext = exports.handleImageMessageShowContext = exports.handleLocationMessageShowContext = exports.handleFaceMessageShowContext = exports.handleTextMessageShowContext = exports.handleTipMessageShowContext = exports.handleShowLastMessage = exports.handleReferenceForShow = exports.handleAt = exports.handleName = exports.handleAvatar = void 0;
var date_1 = require("../../../utils/date");
var decodeText_1 = require("./decodeText");
var tim_1 = require("../../../../TUICore/tim");
var constant_1 = require("../../constant");
// Handling avatars
function handleAvatar(item) {
    var _a, _b, _c, _d, _e, _f;
    var avatar = '';
    switch (item.type) {
        case tim_1["default"].TYPES.CONV_C2C:
            avatar = isUrl((_a = item === null || item === void 0 ? void 0 : item.userProfile) === null || _a === void 0 ? void 0 : _a.avatar)
                ? (_b = item === null || item === void 0 ? void 0 : item.userProfile) === null || _b === void 0 ? void 0 : _b.avatar : 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png';
            break;
        case tim_1["default"].TYPES.CONV_GROUP:
            avatar = isUrl((_c = item === null || item === void 0 ? void 0 : item.groupProfile) === null || _c === void 0 ? void 0 : _c.avatar)
                ? (_d = item === null || item === void 0 ? void 0 : item.groupProfile) === null || _d === void 0 ? void 0 : _d.avatar : 'https://web.sdk.qcloud.com/im/demo/TUIkit/web/img/constomer.svg';
            break;
        case tim_1["default"].TYPES.CONV_SYSTEM:
            avatar = isUrl((_e = item === null || item === void 0 ? void 0 : item.groupProfile) === null || _e === void 0 ? void 0 : _e.avatar)
                ? (_f = item === null || item === void 0 ? void 0 : item.groupProfile) === null || _f === void 0 ? void 0 : _f.avatar : 'https://web.sdk.qcloud.com/component/TUIKit/assets/group_avatar.png';
            break;
    }
    return avatar;
}
exports.handleAvatar = handleAvatar;
// Handling names
function handleName(item) {
    var _a, _b;
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var name = '';
    switch (item.type) {
        case tim_1["default"].TYPES.CONV_C2C:
            name = (item === null || item === void 0 ? void 0 : item.userProfile.nick) || ((_a = item === null || item === void 0 ? void 0 : item.userProfile) === null || _a === void 0 ? void 0 : _a.userID) || '';
            break;
        case tim_1["default"].TYPES.CONV_GROUP:
            name = item.groupProfile.name || ((_b = item === null || item === void 0 ? void 0 : item.groupProfile) === null || _b === void 0 ? void 0 : _b.groupID) || '';
            break;
        case tim_1["default"].TYPES.CONV_SYSTEM:
            name = t('系统通知');
            break;
    }
    return name;
}
exports.handleName = handleName;
// Handle whether there is someone@
function handleAt(item) {
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var List = [
        "[" + t('TUIConversation.有人@我') + "]",
        "[" + t('TUIConversation.@所有人') + "]",
        "[" + t('TUIConversation.@所有人') + "][" + t('TUIConversation.有人@我') + "]",
    ];
    var showAtType = '';
    for (var index = 0; index < item.groupAtInfoList.length; index++) {
        if (item.groupAtInfoList[index].atTypeArray[0] && item.unreadCount > 0) {
            showAtType = List[item.groupAtInfoList[index].atTypeArray[0] - 1];
        }
    }
    return showAtType;
}
exports.handleAt = handleAt;
function handleReferenceForShow(message) {
    var _a;
    var data = {
        referenceMessageForShow: '',
        referenceMessageType: 0
    };
    if (!message || !(message === null || message === void 0 ? void 0 : message.ID) || !(message === null || message === void 0 ? void 0 : message.type))
        return data;
    switch (message.type) {
        case tim_1["default"].TYPES.MSG_TEXT:
            data.referenceMessageForShow = (_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.text;
            data.referenceMessageType = 1;
            break;
        case tim_1["default"].TYPES.MSG_CUSTOM:
            data.referenceMessageForShow = '[自定义消息]';
            data.referenceMessageType = 2;
            break;
        case tim_1["default"].TYPES.MSG_IMAGE:
            data.referenceMessageForShow = '[图片]';
            data.referenceMessageType = 3;
            break;
        case tim_1["default"].TYPES.MSG_AUDIO:
            data.referenceMessageForShow = '[语音]';
            data.referenceMessageType = 4;
            break;
        case tim_1["default"].TYPES.MSG_VIDEO:
            data.referenceMessageForShow = '[视频]';
            data.referenceMessageType = 5;
            break;
        case tim_1["default"].TYPES.MSG_FILE:
            data.referenceMessageForShow = '[文件]';
            data.referenceMessageType = 6;
            break;
        case tim_1["default"].TYPES.MSG_FACE:
            data.referenceMessageForShow = '[表情]';
            data.referenceMessageType = 8;
            break;
    }
    return data;
}
exports.handleReferenceForShow = handleReferenceForShow;
// Internal display of processing message box
function handleShowLastMessage(item) {
    var _a;
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var lastMessage = item.lastMessage;
    var conversation = item;
    var showNick = '';
    var lastMessagePayload = '';
    // Judge the number of unread messages and display them only when the message is enabled without interruption.
    var showUnreadCount = conversation.unreadCount > 0 &&
        conversation.messageRemindType === tim_1["default"].TYPES.MSG_REMIND_ACPT_NOT_NOTE
        ? "[" + (conversation.unreadCount > 99 ? "99+" : conversation.unreadCount) + t('TUIConversation.条') + "] "
        : "";
    // Determine the lastmessage sender of the group. Namecard / Nick / userid is displayed by priority
    if (conversation.type === tim_1["default"].TYPES.CONV_GROUP) {
        if (lastMessage.fromAccount === conversation.groupProfile.selfInfo.userID) {
            showNick = t('TUIConversation.我');
        }
        else {
            showNick = lastMessage.nameCard || lastMessage.nick || lastMessage.fromAccount;
        }
    }
    // Display content of lastmessage message body
    if (lastMessage.type === tim_1["default"].TYPES.MSG_TEXT) {
        lastMessagePayload = lastMessage.payload.text;
    }
    else if (lastMessage.type === tim_1["default"].TYPES.MSG_CUSTOM) {
        var data = JSONToObject((_a = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.payload) === null || _a === void 0 ? void 0 : _a.data);
        if ((data === null || data === void 0 ? void 0 : data.businessID) === 1) {
            lastMessagePayload = extractCallingInfoFromMessage(lastMessage);
            return lastMessagePayload;
        }
        lastMessagePayload = lastMessage.messageForShow;
    }
    else {
        lastMessagePayload = lastMessage.messageForShow;
    }
    if (lastMessage.isRevoked) {
        lastMessagePayload = t('TUIChat.撤回了一条消息');
    }
    if (conversation.type === tim_1["default"].TYPES.CONV_GROUP && lastMessage.type === tim_1["default"].TYPES.MSG_GRP_TIP) {
        return lastMessagePayload;
    }
    // Specific display content of message box
    return "" + showUnreadCount + (showNick ? showNick + ":" : '') + lastMessagePayload;
}
exports.handleShowLastMessage = handleShowLastMessage;
// Handling system tip message display
function handleTipMessageShowContext(message) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var options = {
        message: message,
        text: ''
    };
    var userName = (message === null || message === void 0 ? void 0 : message.nick) || ((_b = (_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.userIDList) === null || _b === void 0 ? void 0 : _b.join(','));
    if (((_d = (_c = message === null || message === void 0 ? void 0 : message.payload) === null || _c === void 0 ? void 0 : _c.memberList) === null || _d === void 0 ? void 0 : _d.length) > 0) {
        userName = '';
        (_f = (_e = message === null || message === void 0 ? void 0 : message.payload) === null || _e === void 0 ? void 0 : _e.memberList) === null || _f === void 0 ? void 0 : _f.map(function (user) {
            userName += ((user === null || user === void 0 ? void 0 : user.nick) || (user === null || user === void 0 ? void 0 : user.userID)) + ",";
        });
        userName = userName === null || userName === void 0 ? void 0 : userName.slice(0, -1);
    }
    if ((message === null || message === void 0 ? void 0 : message.type) === ((_g = tim_1["default"] === null || tim_1["default"] === void 0 ? void 0 : tim_1["default"].TYPES) === null || _g === void 0 ? void 0 : _g.MSG_GRP_TIP)) {
        switch (message.payload.operationType) {
            case tim_1["default"].TYPES.GRP_TIP_MBR_JOIN:
                options.text = userName + " " + t('message.tip.加入群组');
                break;
            case tim_1["default"].TYPES.GRP_TIP_MBR_QUIT:
                options.text = t('message.tip.群成员') + "\uFF1A" + userName + " " + t('message.tip.退出群组');
                break;
            case tim_1["default"].TYPES.GRP_TIP_MBR_KICKED_OUT:
                options.text = t('message.tip.群成员') + "\uFF1A" + userName + " " + t('message.tip.被') + message.payload.operatorID + t('message.tip.踢出群组');
                break;
            case tim_1["default"].TYPES.GRP_TIP_MBR_SET_ADMIN:
                options.text = t('message.tip.群成员') + "\uFF1A" + userName + " " + t('message.tip.成为管理员');
                break;
            case tim_1["default"].TYPES.GRP_TIP_MBR_CANCELED_ADMIN:
                options.text = t('message.tip.群成员') + "\uFF1A" + userName + " " + t('message.tip.被撤销管理员');
                break;
            case tim_1["default"].TYPES.GRP_TIP_GRP_PROFILE_UPDATED:
                // options.text =  `${userName} 修改群组资料`;
                options.text = handleTipGrpUpdated(message);
                break;
            case tim_1["default"].TYPES.GRP_TIP_MBR_PROFILE_UPDATED:
                for (var _i = 0, _k = message.payload.memberList; _i < _k.length; _i++) {
                    var member = _k[_i];
                    if (member.muteTime > 0) {
                        options.text = t('message.tip.群成员') + "\uFF1A" + member.userID + t('message.tip.被禁言');
                    }
                    else {
                        options.text = t('message.tip.群成员') + "\uFF1A" + member.userID + t('message.tip.被取消禁言');
                    }
                }
                break;
            default:
                options.text = "[" + t('message.tip.群提示消息') + "]";
                break;
        }
    }
    else if (((_h = message === null || message === void 0 ? void 0 : message.payload) === null || _h === void 0 ? void 0 : _h.data) === "group_create") {
        options.text = (_j = message === null || message === void 0 ? void 0 : message.payload) === null || _j === void 0 ? void 0 : _j.extension;
    }
    else {
        options.text = extractCallingInfoFromMessage(message);
    }
    return options;
}
exports.handleTipMessageShowContext = handleTipMessageShowContext;
function handleTipGrpUpdated(message) {
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var payload = message.payload;
    var newGroupProfile = payload.newGroupProfile;
    var operatorID = payload.operatorID;
    var text = "";
    if ("muteAllMembers" in newGroupProfile) {
        if (newGroupProfile["muteAllMembers"]) {
            text = t("message.tip.管理员") + " " + operatorID + " " + t("message.tip.开启全员禁言");
        }
        else {
            text = t("message.tip.管理员") + " " + operatorID + " " + t("message.tip.取消全员禁言");
        }
    }
    else if ("ownerID" in newGroupProfile) {
        text = newGroupProfile["ownerID"] + " " + t("message.tip.成为新的群主");
    }
    else if ("groupName" in newGroupProfile) {
        text = operatorID + " " + t("message.tip.修改群名为") + " " + newGroupProfile["groupName"];
    }
    else if ("notification" in newGroupProfile) {
        text = operatorID + " " + t("message.tip.发布新公告");
    }
    return text;
}
// Parsing and handling text message display
function handleTextMessageShowContext(item) {
    var options = {
        text: decodeText_1.decodeText(item.payload)
    };
    return options;
}
exports.handleTextMessageShowContext = handleTextMessageShowContext;
// Parsing and handling face message display
function handleFaceMessageShowContext(item) {
    var face = {
        message: item,
        name: '',
        url: ''
    };
    face.name = item.payload.data;
    if (item.payload.data.indexOf('@2x') < 0) {
        face.name = face.name + "@2x";
    }
    face.url = "https://web.sdk.qcloud.com/im/assets/face-elem/" + face.name + ".png";
    return face;
}
exports.handleFaceMessageShowContext = handleFaceMessageShowContext;
// Parsing and handling location message display
function handleLocationMessageShowContext(item) {
    var location = {
        lon: '',
        lat: '',
        href: '',
        url: '',
        description: '',
        message: item
    };
    location.lon = item.payload.longitude.toFixed(6);
    location.lat = item.payload.latitude.toFixed(6);
    location.href =
        'https://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&' +
            ("pointx=" + location.lon + "&pointy=" + location.lat + "&name=" + item.payload.description);
    location.url =
        'https://apis.map.qq.com/ws/staticmap/v2/?' +
            ("center=" + location.lat + "," + location.lon + "&zoom=10&size=300*150&maptype=roadmap&") +
            ("markers=size:large|color:0xFFCCFF|label:k|" + location.lat + "," + location.lon + "&") +
            'key=UBNBZ-PTP3P-TE7DB-LHRTI-Y4YLE-VWBBD';
    location.description = item.payload.description;
    return location;
}
exports.handleLocationMessageShowContext = handleLocationMessageShowContext;
// Parsing and handling image message display
function handleImageMessageShowContext(item) {
    return {
        progress: (item === null || item === void 0 ? void 0 : item.status) === 'unSend' && item.progress,
        url: item.payload.imageInfoArray[1].url,
        width: item.payload.imageInfoArray[0].width,
        height: item.payload.imageInfoArray[0].height,
        message: item
    };
}
exports.handleImageMessageShowContext = handleImageMessageShowContext;
// Parsing and handling video message display
function handleVideoMessageShowContext(item) {
    var _a, _b, _c, _d;
    return {
        progress: (item === null || item === void 0 ? void 0 : item.status) === 'unSend' && (item === null || item === void 0 ? void 0 : item.progress),
        url: (_a = item === null || item === void 0 ? void 0 : item.payload) === null || _a === void 0 ? void 0 : _a.videoUrl,
        snapshotUrl: (_b = item === null || item === void 0 ? void 0 : item.payload) === null || _b === void 0 ? void 0 : _b.snapshotUrl,
        snapshotWidth: (_c = item === null || item === void 0 ? void 0 : item.payload) === null || _c === void 0 ? void 0 : _c.snapshotWidth,
        snapshotHeight: (_d = item === null || item === void 0 ? void 0 : item.payload) === null || _d === void 0 ? void 0 : _d.snapshotHeight,
        message: item
    };
}
exports.handleVideoMessageShowContext = handleVideoMessageShowContext;
// Parsing and handling audio message display
function handleAudioMessageShowContext(item) {
    return {
        progress: (item === null || item === void 0 ? void 0 : item.status) === 'unSend' && item.progress,
        url: item.payload.url,
        message: item,
        second: item.payload.second
    };
}
exports.handleAudioMessageShowContext = handleAudioMessageShowContext;
// Parsing and handling file message display
function handleFileMessageShowContext(item) {
    var size = '';
    if (item.payload.fileSize >= 1024 * 1024) {
        size = (item.payload.fileSize / (1024 * 1024)).toFixed(2) + " Mb";
    }
    else if (item.payload.fileSize >= 1024) {
        size = (item.payload.fileSize / 1024).toFixed(2) + " Kb";
    }
    else {
        size = item.payload.fileSize.toFixed(2) + "B";
    }
    return {
        progress: (item === null || item === void 0 ? void 0 : item.status) === 'unSend' && item.progress,
        url: item.payload.fileUrl,
        message: item,
        name: item.payload.fileName,
        size: size
    };
}
exports.handleFileMessageShowContext = handleFileMessageShowContext;
// Parsing and handling merger message display
function handleMergerMessageShowContext(item) {
    return __assign({ message: item }, item.payload);
}
exports.handleMergerMessageShowContext = handleMergerMessageShowContext;
// Parse audio and video call messages
function extractCallingInfoFromMessage(message) {
    var _a, _b;
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var callingMessage = {};
    var objectData = {};
    try {
        callingMessage = JSONToObject((_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.data);
    }
    catch (error) {
        callingMessage = {};
    }
    if (callingMessage.businessID !== 1) {
        return '';
    }
    try {
        objectData = JSONToObject(callingMessage.data);
    }
    catch (error) {
        objectData = {};
    }
    var inviteeList = '';
    (_b = callingMessage === null || callingMessage === void 0 ? void 0 : callingMessage.inviteeList) === null || _b === void 0 ? void 0 : _b.forEach(function (userID, index) {
        var _a;
        if (index < ((_a = callingMessage === null || callingMessage === void 0 ? void 0 : callingMessage.inviteeList) === null || _a === void 0 ? void 0 : _a.length) - 1) {
            inviteeList += "\"" + userID + "\"\u3001";
        }
        else {
            inviteeList += "\"" + userID + "\" ";
        }
    });
    var inviter = "\"" + (callingMessage === null || callingMessage === void 0 ? void 0 : callingMessage.inviter) + "\" ";
    switch (callingMessage.actionType) {
        case 1: {
            if (objectData.call_end >= 0 && !callingMessage.groupID) {
                return t('message.custom.通话时长') + "\uFF1A" + date_1.formatTime(objectData.call_end);
            }
            if (callingMessage.groupID && callingMessage.timeout > 0) {
                return "" + inviter + t('message.custom.发起通话');
            }
            if (callingMessage.groupID) {
                return "" + t('message.custom.结束群聊');
            }
            if (objectData.data && objectData.data.cmd === 'switchToAudio') {
                return "" + t('message.custom.切换语音通话');
            }
            if (objectData.data && objectData.data.cmd === 'switchToVideo') {
                return "" + t('message.custom.切换视频通话');
            }
            return "" + t('message.custom.发起通话');
        }
        case 2:
            return "" + (callingMessage.groupID ? inviter : '') + t('message.custom.取消通话');
        case 3:
            if (objectData.data && objectData.data.cmd === 'switchToAudio') {
                return "" + t('message.custom.切换语音通话');
            }
            if (objectData.data && objectData.data.cmd === 'switchToVideo') {
                return "" + t('message.custom.切换视频通话');
            }
            return "" + (callingMessage.groupID ? inviteeList : '') + t('message.custom.已接听');
        case 4:
            return "" + (callingMessage.groupID ? inviteeList : '') + t('message.custom.拒绝通话');
        case 5:
            if (objectData.data && objectData.data.cmd === 'switchToAudio') {
                return "" + t('message.custom.切换语音通话');
            }
            if (objectData.data && objectData.data.cmd === 'switchToVideo') {
                return "" + t('message.custom.切换视频通话');
            }
            return "" + (callingMessage.groupID ? inviteeList : '') + t('message.custom.无应答');
        default:
            return '';
    }
}
exports.extractCallingInfoFromMessage = extractCallingInfoFromMessage;
// Parsing and handling custom message display
function handleCustomMessageShowContext(item) {
    var _a;
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var payloadObj = JSONToObject((_a = item === null || item === void 0 ? void 0 : item.payload) === null || _a === void 0 ? void 0 : _a.data);
    if ((payloadObj === null || payloadObj === void 0 ? void 0 : payloadObj.businessID) === constant_1["default"].typeEvaluate) {
        if (!((payloadObj === null || payloadObj === void 0 ? void 0 : payloadObj.score) > 0)) {
            payloadObj.score = 1;
            item.payload.data = JSON.stringify(payloadObj);
        }
    }
    return {
        message: item,
        custom: extractCallingInfoFromMessage(item) || "[" + t('message.custom.自定义消息') + "]"
    };
}
exports.handleCustomMessageShowContext = handleCustomMessageShowContext;
// Parsing and handling system message display
function translateGroupSystemNotice(message) {
    var t = window.TUIKitTUICore.config.i18n.useI18n().t;
    var groupName = message.payload.groupProfile.name || message.payload.groupProfile.groupID;
    switch (message.payload.operationType) {
        case 1:
            return message.payload.operatorID + " " + t('message.tip.申请加入群组') + "\uFF1A" + groupName;
        case 2:
            return t('message.tip.成功加入群组') + "\uFF1A" + groupName;
        case 3:
            return t('message.tip.申请加入群组') + "\uFF1A" + groupName + " " + t('message.tip.被拒绝');
        case 4:
            return "" + t('message.tip.你被管理员') + message.payload.operatorID + " " + t('message.tip.踢出群组') + "\uFF1A" + groupName;
        case 5:
            return t('message.tip.群') + "\uFF1A" + groupName + " " + t('message.tip.被') + " " + message.payload.operatorID + " " + t('message.tip.解散');
        case 6:
            return message.payload.operatorID + " " + t('message.tip.创建群') + "\uFF1A" + groupName;
        case 7:
            return message.payload.operatorID + " " + t('message.tip.邀请你加群') + "\uFF1A" + groupName;
        case 8:
            return t('message.tip.你退出群组') + "\uFF1A" + groupName;
        case 9:
            return "" + t('message.tip.你被') + message.payload.operatorID + " " + t('message.tip.设置为群') + "\uFF1A" + groupName + " " + t('message.tip.的管理员');
        case 10:
            return "" + t('message.tip.你被') + message.payload.operatorID + " " + t('message.tip.撤销群') + "\uFF1A" + groupName + " " + t('message.tip.的管理员身份');
        case 12:
            return message.payload.operatorID + " " + t('message.tip.邀请你加群') + "\uFF1A" + groupName;
        case 13:
            return message.payload.operatorID + " " + t('message.tip.同意加群') + "\uFF1A" + groupName;
        case 14:
            return message.payload.operatorID + " " + t('message.tip.拒接加群') + "\uFF1A" + groupName;
        case 255:
            return t('message.tip.自定义群系统通知') + ": " + message.payload.userDefinedField;
    }
}
exports.translateGroupSystemNotice = translateGroupSystemNotice;
// Image loading complete
function getImgLoad(container, className, callback) {
    var images = (container === null || container === void 0 ? void 0 : container.querySelectorAll("." + className)) || [];
    var promiseList = Array.prototype.slice.call(images).map(function (node) {
        return new Promise(function (resolve, reject) {
            node.onload = function () {
                resolve(node);
            };
            node.onloadeddata = function () {
                resolve(node);
            };
            node.onprogress = function () {
                resolve(node);
            };
            if (node.complete) {
                resolve(node);
            }
        });
    });
    return Promise.all(promiseList)
        .then(function () {
        callback && callback();
    })["catch"](function (e) {
        console.error('网络异常', e);
    });
}
exports.getImgLoad = getImgLoad;
// Determine whether it is url
function isUrl(url) {
    return /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/.test(url);
}
exports.isUrl = isUrl;
// Handling custom message options
function handleOptions(businessID, version, other) {
    return __assign({ businessID: businessID,
        version: version }, other);
}
exports.handleOptions = handleOptions;
// Determine if it is a JSON string
function isJSON(str) {
    // eslint-disable-next-line no-useless-escape
    if (typeof str === 'string') {
        try {
            var data = JSON.parse(str);
            if (data) {
                return true;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    return false;
}
exports.isJSON = isJSON;
// Determine if it is a JSON string
function JSONToObject(str) {
    if (!str || !isJSON(str)) {
        return str;
    }
    return JSON.parse(str);
}
exports.JSONToObject = JSONToObject;
// Determine if it is a typing message
function isTypingMessage(item) {
    var _a;
    if (!item)
        return false;
    try {
        var businessID = JSONToObject((_a = item === null || item === void 0 ? void 0 : item.payload) === null || _a === void 0 ? void 0 : _a.data).businessID;
        if (businessID === constant_1["default"].typeUserTyping)
            return true;
    }
    catch (_b) {
        return false;
    }
    return false;
}
exports.isTypingMessage = isTypingMessage;
function deepCopy(data, hash) {
    if (hash === void 0) { hash = new WeakMap(); }
    if (typeof data !== 'object' || data === null) {
        throw new TypeError('传入参数不是对象');
    }
    if (hash.has(data)) {
        return hash.get(data);
    }
    var newData = Object.create(Object.getPrototypeOf(data));
    var dataKeys = Object.keys(data);
    dataKeys.forEach(function (value) {
        var currentDataValue = data[value];
        if (typeof currentDataValue !== 'object' || currentDataValue === null) {
            newData[value] = currentDataValue;
        }
        else if (Array.isArray(currentDataValue)) {
            newData[value] = __spreadArrays(currentDataValue);
        }
        else if (currentDataValue instanceof Set) {
            newData[value] = new Set(__spreadArrays(currentDataValue));
        }
        else if (currentDataValue instanceof Map) {
            newData[value] = new Map(__spreadArrays(currentDataValue));
        }
        else {
            hash.set(data, data);
            newData[value] = deepCopy(currentDataValue, hash);
        }
    });
    return newData;
}
exports.deepCopy = deepCopy;
exports.throttle = function (fn) {
    var isRunning = false;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (isRunning)
            return;
        setTimeout(function () {
            fn.apply(_this, args);
            isRunning = false;
        }, 100);
    };
};
exports.isMessageTip = function (message) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if ((message === null || message === void 0 ? void 0 : message.type) === ((_a = tim_1["default"] === null || tim_1["default"] === void 0 ? void 0 : tim_1["default"].TYPES) === null || _a === void 0 ? void 0 : _a.MSG_GRP_TIP) ||
        ((message === null || message === void 0 ? void 0 : message.type) === ((_b = tim_1["default"] === null || tim_1["default"] === void 0 ? void 0 : tim_1["default"].TYPES) === null || _b === void 0 ? void 0 : _b.MSG_CUSTOM) &&
            (message === null || message === void 0 ? void 0 : message.conversationType) === ((_c = tim_1["default"] === null || tim_1["default"] === void 0 ? void 0 : tim_1["default"].TYPES) === null || _c === void 0 ? void 0 : _c.CONV_GROUP) &&
            ((_e = JSONToObject((_d = message === null || message === void 0 ? void 0 : message.payload) === null || _d === void 0 ? void 0 : _d.data)) === null || _e === void 0 ? void 0 : _e.businessID) === (constant_1["default"] === null || constant_1["default"] === void 0 ? void 0 : constant_1["default"].TYPE_CALL_MESSAGE)) ||
        ((message === null || message === void 0 ? void 0 : message.type) === ((_f = tim_1["default"] === null || tim_1["default"] === void 0 ? void 0 : tim_1["default"].TYPES) === null || _f === void 0 ? void 0 : _f.MSG_CUSTOM) &&
            (message === null || message === void 0 ? void 0 : message.conversationType) === ((_g = tim_1["default"] === null || tim_1["default"] === void 0 ? void 0 : tim_1["default"].TYPES) === null || _g === void 0 ? void 0 : _g.CONV_GROUP) &&
            ((_h = message === null || message === void 0 ? void 0 : message.payload) === null || _h === void 0 ? void 0 : _h.data) === "group_create")) {
        return true;
    }
    return false;
};
exports.handleSkeletonSize = function (width, height, maxWidth, maxHeight) {
    var widthToHeight = width / height;
    var maxWidthToHeight = maxWidth / maxHeight;
    if (width <= maxWidth && height <= maxHeight) {
        return { width: width, height: height };
    }
    else if ((width <= maxWidth && height > maxHeight) ||
        (width > maxWidth && height > maxHeight && widthToHeight <= maxWidthToHeight)) {
        return { width: width * (maxHeight / height), height: maxHeight };
    }
    else {
        return { width: maxWidth, height: height * (maxWidth / width) };
    }
};
