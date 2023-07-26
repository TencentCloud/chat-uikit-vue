"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var utils_1 = require("../../TUIComponents/container/TUIChat/utils/utils");
var chat_1 = require("@tencentcloud/chat");
var TUINotification = /** @class */ (function () {
    function TUINotification(params) {
        this.allowNotifications = true;
        this.showPreviews = true;
        this.notificationTitle = '腾讯云 IM ';
        this.notificationIcon = 'https://web.sdk.qcloud.com/im/demo/latest/faviconnew.png';
        if (!params)
            return;
        ((params === null || params === void 0 ? void 0 : params.allowNotifications) !== undefined) && (this.allowNotifications = params.allowNotifications);
        ((params === null || params === void 0 ? void 0 : params.showPreviews) !== undefined) && (this.showPreviews = params.showPreviews);
        ((params === null || params === void 0 ? void 0 : params.notificationTitle) !== undefined) && (this.notificationTitle = params.notificationTitle);
        ((params === null || params === void 0 ? void 0 : params.notificationIcon) !== undefined) && (this.notificationIcon = params.notificationIcon);
    }
    /**
   * 获取 TUINotification 实例
   *
   * @returns {TUINotification}
   */
    TUINotification.getInstance = function (options) {
        if (!TUINotification.instance) {
            TUINotification.instance = new TUINotification(options);
        }
        return TUINotification.instance;
    };
    /**
   * 挂载到 TUICore
   *
   * @param {TUICore} TUICore TUICore实例
   */
    TUINotification.plugin = function (TUICore, options) {
        TUICore.config.notification = this.getInstance(options);
        this.TUICore = TUICore;
    };
    /**
   * 挂载到 vue 实例的上
   *
   * @param {app} app vue的实例
   */
    TUINotification.install = function (app) {
        app.use(this.getInstance());
    };
    TUINotification.prototype.setNotificationConfiguration = function (params) {
        if (!params)
            return;
        ((params === null || params === void 0 ? void 0 : params.allowNotifications) !== undefined) && (this.allowNotifications = params.allowNotifications);
        ((params === null || params === void 0 ? void 0 : params.showPreviews) !== undefined) && (this.showPreviews = params.showPreviews);
        ((params === null || params === void 0 ? void 0 : params.notificationTitle) !== undefined) && (this.notificationTitle = params.notificationTitle);
        ((params === null || params === void 0 ? void 0 : params.notificationIcon) !== undefined) && (this.notificationIcon = params.notificationIcon);
    };
    TUINotification.prototype.notify = function (message) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.allowNotifications) {
                            return [2 /*return*/];
                        }
                        if (!this.checkNotificationAbility()) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.requestNotificationPermission()];
                    case 1:
                        if (!(_a.sent())) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.handleNotification(message)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TUINotification.prototype.checkNotificationAbility = function () {
        if (!('Notification' in window) || window.Notification.permission === 'denied') {
            return false;
        }
        return true;
    };
    TUINotification.prototype.requestNotificationPermission = function () {
        return new Promise(function (resolve, reject) {
            if (!(window === null || window === void 0 ? void 0 : window.Notification))
                reject(false);
            if (window.Notification.permission === 'granted') {
                resolve(true);
            }
            window.Notification.requestPermission().then(function (permission) {
                // 如果用户同意，就可以向他们发送通知
                if (permission === 'granted') {
                    resolve(true);
                }
            })["catch"](function () {
                reject(false);
            });
        });
    };
    TUINotification.prototype.handleNotification = function (message) {
        return __awaiter(this, void 0, Promise, function () {
            var notificationType, content, options, _a, _b, notification;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this._isMessageNeedNotification(message))
                            return [2 /*return*/];
                        notificationType = this._handleNotificationType(message);
                        options = {
                            badge: this.notificationIcon,
                            icon: this.notificationIcon,
                            body: '',
                            requireInteraction: false
                        };
                        _a = notificationType;
                        switch (_a) {
                            case 'call': return [3 /*break*/, 1];
                            case 'chat': return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        content = this._handleCallNotificationContent(message);
                        if (!(content === null || content === void 0 ? void 0 : content.content)) {
                            return [2 /*return*/];
                        }
                        options.body = content.content;
                        options.requireInteraction = !content.callEnd;
                        return [3 /*break*/, 4];
                    case 2:
                        _b = options;
                        return [4 /*yield*/, this._handleChatNotificationContent(message)];
                    case 3:
                        _b.body = _c.sent();
                        options.requireInteraction = false;
                        return [3 /*break*/, 4];
                    case 4:
                        notification = new Notification(this.notificationTitle, options);
                        notification.onclick = function () {
                            var _a, _b;
                            window.focus();
                            if (!message || !(message === null || message === void 0 ? void 0 : message.conversationID)) {
                                return;
                            }
                            var TUIConversationServer = (_b = (_a = TUINotification === null || TUINotification === void 0 ? void 0 : TUINotification.TUICore) === null || _a === void 0 ? void 0 : _a.TUIServer) === null || _b === void 0 ? void 0 : _b.TUIConversation;
                            if ((message === null || message === void 0 ? void 0 : message.conversationType) === chat_1["default"].TYPES.CONV_C2C || (message === null || message === void 0 ? void 0 : message.conversationType) === chat_1["default"].TYPES.CONV_GROUP) {
                                TUIConversationServer === null || TUIConversationServer === void 0 ? void 0 : TUIConversationServer.getConversationProfile(message === null || message === void 0 ? void 0 : message.conversationID).then(function (imResponse) {
                                    var _a, _b;
                                    ((_a = imResponse === null || imResponse === void 0 ? void 0 : imResponse.data) === null || _a === void 0 ? void 0 : _a.conversation) && TUIConversationServer.handleCurrentConversation((_b = imResponse === null || imResponse === void 0 ? void 0 : imResponse.data) === null || _b === void 0 ? void 0 : _b.conversation);
                                });
                            }
                            notification.close();
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    TUINotification.prototype._isMessageNeedNotification = function (message) {
        var _a, _b, _c, _d;
        if (!message || !(message === null || message === void 0 ? void 0 : message.ID) || !(message === null || message === void 0 ? void 0 : message.type) || (message === null || message === void 0 ? void 0 : message.isRevoked) || (message === null || message === void 0 ? void 0 : message.isDeleted) ||
            (utils_1.isTypingMessage && utils_1.isTypingMessage(message))) {
            return false;
        }
        if ((message === null || message === void 0 ? void 0 : message.type) === chat_1["default"].TYPES.MSG_GRP_TIP || (message === null || message === void 0 ? void 0 : message.type) === chat_1["default"].TYPES.MSG_GRP_SYS_NOTICE) {
            return false;
        }
        var currentConversationID = (_d = (_c = (_b = (_a = TUINotification === null || TUINotification === void 0 ? void 0 : TUINotification.TUICore) === null || _a === void 0 ? void 0 : _a.TUIServer) === null || _b === void 0 ? void 0 : _b.TUIConversation) === null || _c === void 0 ? void 0 : _c.currentStore) === null || _d === void 0 ? void 0 : _d.currentConversationID;
        if (this.checkPageFocus() && (message === null || message === void 0 ? void 0 : message.conversationID) === currentConversationID) {
            return false;
        }
        return true;
    };
    TUINotification.prototype._handleNotificationType = function (message) {
        var _a;
        if (message.type === chat_1["default"].TYPES.MSG_CUSTOM) {
            var payloadData = utils_1.JSONToObject((_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.data);
            if ((payloadData === null || payloadData === void 0 ? void 0 : payloadData.businessID) === 1 || (payloadData === null || payloadData === void 0 ? void 0 : payloadData.businessID) === 'av_call') {
                return 'call';
            }
        }
        return 'chat';
    };
    TUINotification.prototype._handleChatNotificationContent = function (message) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var content, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        content = '';
                        if (!message || !(message === null || message === void 0 ? void 0 : message.ID) || !(message === null || message === void 0 ? void 0 : message.type)) {
                            return [2 /*return*/, content];
                        }
                        _c = this.showPreviews;
                        switch (_c) {
                            case true: return [3 /*break*/, 1];
                            case false: return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this._handleChatNotificationContentTitle(message)];
                    case 2:
                        content = _e.sent();
                        content += this._handleChatNotificationContentText(message);
                        return [3 /*break*/, 6];
                    case 3:
                        _d = '您有';
                        return [4 /*yield*/, ((_b = (_a = TUINotification === null || TUINotification === void 0 ? void 0 : TUINotification.TUICore) === null || _a === void 0 ? void 0 : _a.tim) === null || _b === void 0 ? void 0 : _b.getTotalUnreadMessageCount())];
                    case 4:
                        content = _d + (_e.sent()) + '条新消息';
                        return [3 /*break*/, 6];
                    case 5: return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, content];
                }
            });
        });
    };
    TUINotification.prototype._handleChatNotificationContentTitle = function (message) {
        var _a, _b, _c;
        return __awaiter(this, void 0, Promise, function () {
            var title, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        title = '';
                        _d = message === null || message === void 0 ? void 0 : message.conversationType;
                        switch (_d) {
                            case chat_1["default"].TYPES.CONV_C2C: return [3 /*break*/, 1];
                            case chat_1["default"].TYPES.CONV_GROUP: return [3 /*break*/, 2];
                            case chat_1["default"].TYPES.CONV_SYSTEM: return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        title = ((message === null || message === void 0 ? void 0 : message.nick) || (message === null || message === void 0 ? void 0 : message.from)) + ': ';
                        return [3 /*break*/, 6];
                    case 2:
                        title = (message === null || message === void 0 ? void 0 : message.conversationID) + ': ';
                        return [4 /*yield*/, ((_c = (_b = (_a = TUINotification === null || TUINotification === void 0 ? void 0 : TUINotification.TUICore) === null || _a === void 0 ? void 0 : _a.tim) === null || _b === void 0 ? void 0 : _b.getConversationProfile(message === null || message === void 0 ? void 0 : message.conversationID)) === null || _c === void 0 ? void 0 : _c.then(function (imResponse) {
                                var _a, _b, _c;
                                title = (((_c = (_b = (_a = imResponse === null || imResponse === void 0 ? void 0 : imResponse.data) === null || _a === void 0 ? void 0 : _a.conversation) === null || _b === void 0 ? void 0 : _b.groupProfile) === null || _c === void 0 ? void 0 : _c.name) || (message === null || message === void 0 ? void 0 : message.conversationID)) + ': ';
                            })["catch"](function () {
                                title = (message === null || message === void 0 ? void 0 : message.conversationID) + ': ';
                            }))];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        title = '系统消息: ';
                        return [3 /*break*/, 6];
                    case 5: return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, title];
                }
            });
        });
    };
    TUINotification.prototype._handleChatNotificationContentText = function (message) {
        var _a;
        var content = '';
        switch (message.type) {
            case chat_1["default"].TYPES.MSG_TEXT:
                content += (_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.text;
                break;
            case chat_1["default"].TYPES.MSG_CUSTOM:
                content += '[自定义消息]';
                break;
            case chat_1["default"].TYPES.MSG_IMAGE:
                content += '[图片]';
                break;
            case chat_1["default"].TYPES.MSG_AUDIO:
                content += '[语音]';
                break;
            case chat_1["default"].TYPES.MSG_VIDEO:
                content += '[视频]';
                break;
            case chat_1["default"].TYPES.MSG_FILE:
                content += '[文件]';
                break;
            case chat_1["default"].TYPES.MSG_FACE:
                content += '[表情]';
                break;
            case chat_1["default"].TYPES.MSG_MERGER:
                content += '[聊天记录]';
                break;
            case chat_1["default"].TYPES.MSG_LOCATION:
                content += '[位置]';
                break;
            default:
                break;
        }
        return content;
    };
    TUINotification.prototype._handleCallNotificationContent = function (message) {
        var _a;
        var content = '';
        var callEnd = false;
        try {
            if (message.type === chat_1["default"].TYPES.MSG_CUSTOM) {
                var callInfo = utils_1.JSONToObject((_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.data);
                var callDataInfo = utils_1.JSONToObject(callInfo.data);
                if ((callInfo === null || callInfo === void 0 ? void 0 : callInfo.businessID) === 1) {
                    if (callInfo.actionType === 1 && ((callInfo.groupID && callInfo.timeout > 0) ||
                        ((!callInfo.call_end && callInfo.call_end !== 0) &&
                            !callInfo.groupID &&
                            !((callDataInfo === null || callDataInfo === void 0 ? void 0 : callDataInfo.data) && ((callDataInfo === null || callDataInfo === void 0 ? void 0 : callDataInfo.data.cmd) === 'switchToAudio' || (callDataInfo === null || callDataInfo === void 0 ? void 0 : callDataInfo.data.cmd) === 'switchToVideo'))))) {
                        content = this.showPreviews ? callInfo.inviter + " \u53D1\u8D77\u901A\u8BDD" : "\u60A8\u6709\u4E00\u4E2A\u901A\u8BDD\u8BF7\u6C42";
                        callEnd = false;
                    }
                    else if (callInfo.actionType === 2) {
                        content = this.showPreviews ? callInfo.inviter + " \u53D6\u6D88\u901A\u8BDD" : "\u901A\u8BDD\u53D6\u6D88";
                        callEnd = true;
                    }
                }
            }
        }
        catch (error) {
            console.warn(error);
        }
        return {
            content: content,
            callEnd: callEnd
        };
    };
    TUINotification.prototype.checkPageFocus = function () {
        return document.hasFocus();
    };
    return TUINotification;
}());
exports["default"] = TUINotification;
