"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var TUIPlugin_1 = require("../../../TUIPlugin");
var IComponentServer_1 = require("../IComponentServer");
var utils_1 = require("./utils/utils");
/**
 * class TUIChatServer
 *
 * TUIChat 逻辑主体
 */
var TUIChatServer = /** @class */ (function (_super) {
    __extends(TUIChatServer, _super);
    function TUIChatServer(TUICore) {
        var _this = _super.call(this) || this;
        _this.currentStore = {};
        _this.TUICore = TUICore;
        _this.bindTIMEvent();
        _this.store = TUICore.setComponentStore("TUIChat", {}, _this.updateStore.bind(_this));
        return _this;
    }
    /**
     * 组件销毁
     * destroy
     */
    TUIChatServer.prototype.destroyed = function () {
        this.unbindTIMEvent();
    };
    /**
     * 数据监听回调
     * data listener callback
     *
     * @param {any} newValue 新数据
     * @param {any} oldValue 旧数据
     *
     */
    TUIChatServer.prototype.updateStore = function (newValue, oldValue) {
        Object.assign(this.currentStore, newValue);
        if (!newValue.conversation.conversationID) {
            this.currentStore.messageList = [];
            return;
        }
        if (newValue.conversation.conversationID &&
            newValue.conversation.conversationID !==
                oldValue.conversation.conversationID) {
            this.render(newValue.conversation);
        }
    };
    TUIChatServer.prototype.render = function (conversation) {
        var _this = this;
        var _a, _b, _c;
        var len = 15;
        this.currentStore.isFirstRender = true;
        this.currentStore.messageList = [];
        this.currentStore.readSet.clear();
        this.getMessageList({
            conversationID: conversation.conversationID,
            count: len
        });
        if (conversation.type === this.TUICore.TIM.TYPES.CONV_GROUP) {
            this.currentStore.userInfo.isGroup = true;
            var options = {
                groupID: conversation.groupProfile.groupID,
                userIDList: [conversation.groupProfile.selfInfo.userID]
            };
            this.getGroupProfile({ groupID: conversation.groupProfile.groupID });
            this.getGroupMemberProfile(options).then(function (res) {
                var memberList = res.data.memberList;
                var selfInfo = memberList[0];
                _this.currentStore.selfInfo = selfInfo;
            });
            (_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.TUICore) === null || _a === void 0 ? void 0 : _a.TUIServer) === null || _b === void 0 ? void 0 : _b.TUIGroup) === null || _c === void 0 ? void 0 : _c.getGroupMemberList({
                groupID: conversation.groupProfile.groupID,
                count: 100,
                offset: 0
            }).then(function (res) {
                var _a;
                _this.currentStore.allMemberList = (_a = res.data) === null || _a === void 0 ? void 0 : _a.memberList;
            });
        }
        else {
            this.currentStore.userInfo.isGroup = false;
            this.currentStore.userInfo.list = [conversation === null || conversation === void 0 ? void 0 : conversation.userProfile];
        }
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                    TIM 事件监听注册接口
     * //                        TIM Event listener registration interface
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    TUIChatServer.prototype.bindTIMEvent = function () {
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.MESSAGE_RECEIVED, this.handleMessageReceived, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.MESSAGE_MODIFIED, this.handleMessageModified, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.MESSAGE_REVOKED, this.handleMessageRevoked, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.MESSAGE_READ_BY_PEER, this.handleMessageReadByPeer, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.GROUP_LIST_UPDATED, this.handleGroupListUpdated, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.MESSAGE_READ_RECEIPT_RECEIVED, this.handleMessageReadReceiptReceived, this);
    };
    TUIChatServer.prototype.unbindTIMEvent = function () {
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.MESSAGE_RECEIVED, this.handleMessageReceived);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.MESSAGE_MODIFIED, this.handleMessageModified);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.MESSAGE_REVOKED, this.handleMessageRevoked);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.MESSAGE_READ_BY_PEER, this.handleMessageReadByPeer);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.GROUP_LIST_UPDATED, this.handleGroupListUpdated);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.MESSAGE_READ_RECEIPT_RECEIVED, this.handleMessageReadReceiptReceived);
    };
    TUIChatServer.prototype.handleMessageReceived = function (event) {
        var _this = this;
        var _a;
        (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.forEach(function (message) {
            var _a, _b;
            if ((message === null || message === void 0 ? void 0 : message.conversationID) === ((_b = (_a = _this === null || _this === void 0 ? void 0 : _this.store) === null || _a === void 0 ? void 0 : _a.conversation) === null || _b === void 0 ? void 0 : _b.conversationID)) {
                _this.currentStore.messageList = __spreadArrays(_this.currentStore.messageList, [
                    message,
                ]);
            }
            TUIPlugin_1.TUINotification.getInstance().notify(message);
        });
    };
    TUIChatServer.prototype.handleMessageModified = function (event) {
        var middleData = this.currentStore.messageList;
        this.currentStore.messageList = [];
        this.currentStore.messageList = middleData;
    };
    TUIChatServer.prototype.handleMessageRevoked = function (event) {
        var middleData = this.currentStore.messageList;
        this.currentStore.messageList = [];
        this.currentStore.messageList = middleData;
    };
    TUIChatServer.prototype.handleMessageReadByPeer = function (event) {
        var middleData = this.currentStore.messageList;
        this.currentStore.messageList = [];
        this.currentStore.messageList = middleData;
    };
    TUIChatServer.prototype.handleGroupListUpdated = function (event) {
        var _this = this;
        event === null || event === void 0 ? void 0 : event.data.map(function (item) {
            var _a, _b, _c;
            if ((item === null || item === void 0 ? void 0 : item.groupID) === ((_c = (_b = (_a = _this === null || _this === void 0 ? void 0 : _this.store) === null || _a === void 0 ? void 0 : _a.conversation) === null || _b === void 0 ? void 0 : _b.groupProfile) === null || _c === void 0 ? void 0 : _c.groupID)) {
                _this.store.conversation.groupProfile = item;
                _this.currentStore.conversation = {};
                _this.currentStore.conversation = _this.store.conversation;
            }
            return item;
        });
    };
    TUIChatServer.prototype.handleMessageReadReceiptReceived = function (event) {
        var middleData = this.currentStore.messageList;
        this.currentStore.messageList = [];
        this.currentStore.messageList = middleData;
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                 处理 TIM 接口参数及回调
     * //                     Handling TIM interface parameters and callbacks
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /**
     * 创建消息生成参数
     * Create message generation parameters
     *
     * @param {Object} content 消息体
     * @param {String} type 消息类型 text: 文本类型 file: 文件类型 face: 表情 location: 地址 custom: 自定义 merger: 合并 forward: 转发
     * @param {Callback} callback 回调函数
     * @param {any} to 发送的对象
     * @returns {options} 消息参数
     */
    TUIChatServer.prototype.handleMessageOptions = function (content, type, callback, to) {
        var _a, _b, _c, _d, _e, _f;
        var options = {
            to: "",
            conversationType: (to === null || to === void 0 ? void 0 : to.type) || this.store.conversation.type,
            payload: content,
            needReadReceipt: this.currentStore.needReadReceipt
        };
        if (this.currentStore.needTyping) {
            options.cloudCustomData = {
                messageFeature: {
                    needTyping: 1,
                    version: 1
                }
            };
            options.cloudCustomData = JSON.stringify(options.cloudCustomData);
        }
        if (type === "file" && callback) {
            options.onProgress = callback;
        }
        switch (options.conversationType) {
            case this.TUICore.TIM.TYPES.CONV_C2C:
                options.to =
                    ((_a = to === null || to === void 0 ? void 0 : to.userProfile) === null || _a === void 0 ? void 0 : _a.userID) || ((_c = (_b = this.store.conversation) === null || _b === void 0 ? void 0 : _b.userProfile) === null || _c === void 0 ? void 0 : _c.userID) ||
                        "";
                break;
            case this.TUICore.TIM.TYPES.CONV_GROUP:
                options.to =
                    ((_d = to === null || to === void 0 ? void 0 : to.groupProfile) === null || _d === void 0 ? void 0 : _d.groupID) || ((_f = (_e = this.store.conversation) === null || _e === void 0 ? void 0 : _e.groupProfile) === null || _f === void 0 ? void 0 : _f.groupID) ||
                        "";
                break;
            default:
                break;
        }
        return options;
    };
    /**
     * 处理异步函数
     * Handling asynchronous functions
     *
     * @param {callback} callback 回调函数
     * @returns {Promise} 返回异步函数
     */
    TUIChatServer.prototype.handlePromiseCallback = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var config = {
                TUIName: "TUIChat",
                callback: function () {
                    callback && callback(resolve, reject);
                }
            };
            _this.TUICore.setAwaitFunc(config.TUIName, config.callback);
        });
    };
    /**
     * 重试异步函数
     * Retry asynchronous functions
     * 默认执行一次，之后按时间间隔列表重复执行直到成功，重复次数完毕后仍失败则失败
     * Execute once by default, and then repeat it according to the time interval list until it succeeds.
     * If it still fails after the number of repetitions is complete, it will reject.
     *
     * @param {callback} callback 回调函数/callback function
     * @param {Array<number>} intervalList 间隔时间列表/interval list
     * @param {callback} retryBreakFn 强制重复结束条件函数/break retry function
     * @returns {Promise} 返回异步函数/return
     */
    TUIChatServer.prototype.handlePromiseCallbackRetry = function (callback, intervalList, retryBreakFn) {
        if (intervalList === void 0) { intervalList = []; }
        if (retryBreakFn === void 0) { retryBreakFn = function () {
            return false;
        }; }
        return new Promise(function (resolve, reject) {
            var times = 0;
            function tryFn() {
                times++;
                callback()
                    .then(resolve)["catch"](function (error) {
                    if (times > intervalList.length ||
                        (retryBreakFn && retryBreakFn(error))) {
                        reject(error);
                        return;
                    }
                    setTimeout(tryFn, intervalList[times - 1]);
                });
            }
            tryFn();
        });
    };
    /**
     * 文件上传进度函数处理
     * File upload progress function processing
     *
     * @param {number} progress 文件上传进度 1表示完成
     * @param {message} message 文件消息
     */
    TUIChatServer.prototype.handleUploadProgress = function (progress, message) {
        this.currentStore.messageList.map(function (item) {
            if (item.ID === message.ID) {
                item.progress = progress;
            }
            return item;
        });
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                 TIM 方法
     * //                               TIM methods
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /**
     * 发送表情消息
     * Send face messages
     *
     * @param {Object} data 消息内容/message content
     * @param {Number} data.index 表情索引/face index
     * @param {String} data.data 额外数据/extra data
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendFaceMessage = function (data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message, imResponse_1, error_1, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions(data, "face");
                        message = this.TUICore.tim.createFaceMessage(options);
                        this.currentStore.messageList.push(message);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message)];
                    case 1:
                        imResponse_1 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_1.data.message.ID) {
                                return imResponse_1.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_1);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        reject(error_1);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送图片消息
     * Send image message
     *
     * @param {Image} image 图片文件/image
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendImageMessage = function (image) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message_1, imResponse_2, error_2, middleData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions({ file: image }, "file", function (progress) {
                            _this.handleUploadProgress(progress, message_1);
                        });
                        message_1 = this.TUICore.tim.createImageMessage(options);
                        message_1.progress = 0.01;
                        this.currentStore.messageList.push(message_1);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message_1)];
                    case 1:
                        imResponse_2 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_2.data.message.ID) {
                                return imResponse_2.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_2);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        reject(error_2);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送视频消息
     * Send video message
     *
     * @param {Video} video 视频文件/video
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendVideoMessage = function (video) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message_2, imResponse_3, error_3, middleData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions({ file: video }, "file", function (progress) {
                            _this.handleUploadProgress(progress, message_2);
                        });
                        message_2 = this.TUICore.tim.createVideoMessage(options);
                        message_2.progress = 0.01;
                        this.currentStore.messageList.push(message_2);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message_2)];
                    case 1:
                        imResponse_3 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_3.data.message.ID) {
                                return imResponse_3.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_3);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        reject(error_3);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送文件消息
     * Send file message
     *
     * @param {File} file 文件/file
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendFileMessage = function (file) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message_3, imResponse_4, error_4, middleData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions({ file: file }, "file", function (progress) {
                            _this.handleUploadProgress(progress, message_3);
                        });
                        message_3 = this.TUICore.tim.createFileMessage(options);
                        message_3.progress = 0.01;
                        this.currentStore.messageList.push(message_3);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message_3)];
                    case 1:
                        imResponse_4 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_4.data.message.ID) {
                                return imResponse_4.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_4);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        reject(error_4);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送自定义消息
     * Send Custom message
     *
     * @param {Object} data 消息内容/message content
     * @param {String} data.data 自定义消息的数据字段/custom message data fields
     * @param {String} data.description 自定义消息的说明字段/custom message description fields
     * @param {String} data.extension 自定义消息的扩展字段/custom message extension fields
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendCustomMessage = function (data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message, imResponse_5, error_5, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data.data = JSON.stringify(data.data);
                        options = this.handleMessageOptions(data, "custom");
                        message = this.TUICore.tim.createCustomMessage(options);
                        this.currentStore.messageList.push(message);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message)];
                    case 1:
                        imResponse_5 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_5.data.message.ID) {
                                return imResponse_5.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_5);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        reject(error_5);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送地理位置消息
     * Send location message
     *
     * @param {Object} data 消息内容/message content
     * @param {String} data.description 地理位置描述信息/geographic descriptive information
     * @param {Number} data.longitude 经度/longitude
     * @param {Number} data.latitude 纬度/latitude
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendLocationMessage = function (data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message, imResponse, error_6, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions(data, "location");
                        message = this.TUICore.tim.createLocationMessage(options);
                        this.currentStore.messageList.push(message);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message)];
                    case 1:
                        imResponse = _a.sent();
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        reject(error_6);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 转发消息
     * forward message
     *
     * @param {message} message 消息实例/message
     * @param {any} to 转发的对象/forward to
     * @returns {Promise}
     */
    TUIChatServer.prototype.forwardMessage = function (message, to) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, imMessage, imResponse, error_7, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions(message, "forward", {}, to);
                        imMessage = this.TUICore.tim.createForwardMessage(options);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(imMessage)];
                    case 1:
                        imResponse = _a.sent();
                        if (this.store.conversation.conversationID ===
                            imResponse.data.message.conversationID) {
                            this.currentStore.messageList.push(imResponse.data.message);
                        }
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        reject(error_7);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送消息已读回执
     * Send message read receipt
     *
     * @param {Array} messageList 同一个 C2C 或 GROUP 会话的消息列表，最大长度为30/A list of messages for the same C2C or GROUP conversation, with a maximum length of 30
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendMessageReadReceipt = function (messageList) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.sendMessageReadReceipt(messageList)];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_8 = _a.sent();
                                    reject(error_8);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 拉取已读回执列表
     * Pull read receipt list
     *
     * @param {Array} messageList 同一群会话的消息列表/The message list of the same group of the conversation
     * @returns {Promise}
     */
    TUIChatServer.prototype.getMessageReadReceiptList = function (messageList) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getMessageReadReceiptList(messageList)];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_9 = _a.sent();
                                    reject(error_9);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                 对外方法
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /**
     * 获取 messageList
     * get messagelist
     *
     * @param {any} options 获取 messageList 参数/messageList options
     * @param {Boolean} history  是否获取历史消息/Whether to get historical information
     * @returns {Promise}
     */
    TUIChatServer.prototype.getMessageList = function (options, history) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, this.TUICore.tim.getMessageList(options)];
                                case 1:
                                    imResponse = _a.sent();
                                    console.warn(imResponse.data.messageList);
                                    if (!imResponse.data.messageList.length) return [3 /*break*/, 3];
                                    return [4 /*yield*/, this.getMessageReadReceiptList(imResponse.data.messageList)];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3:
                                    if (!history) {
                                        this.currentStore.messageList = imResponse.data.messageList;
                                    }
                                    else {
                                        this.currentStore.messageList = __spreadArrays(imResponse.data.messageList, this.currentStore.messageList);
                                    }
                                    this.currentStore.nextReqMessageID = imResponse.data.nextReqMessageID;
                                    this.currentStore.isCompleted = imResponse.data.isCompleted;
                                    resolve(imResponse);
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_10 = _a.sent();
                                    reject(error_10);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取历史消息
     * get history messagelist
     *
     * @returns {Promise}
     */
    TUIChatServer.prototype.getHistoryMessageList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                options = {
                    conversationID: this.currentStore.conversation.conversationID,
                    nextReqMessageID: this.currentStore.nextReqMessageID,
                    count: 15
                };
                if (!this.currentStore.isCompleted) {
                    this.getMessageList(options, true);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 发送文本消息
     * send text message
     *
     * @param {any} text 发送的消息/text message
     * @param {object} data 被引用消息的内容/The content of the quoted message
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendTextMessage = function (text, data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, cloudCustomDataObj, cloudCustomData, secondOptions, message, imResponse_6, error_11, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions({ text: text }, "text");
                        cloudCustomDataObj = {};
                        if (options.cloudCustomData) {
                            try {
                                cloudCustomDataObj = utils_1.JSONToObject(options.cloudCustomData);
                            }
                            catch (_b) {
                                cloudCustomDataObj = {};
                            }
                        }
                        cloudCustomData = JSON.stringify(data);
                        secondOptions = Object.assign(options, __assign({ cloudCustomData: cloudCustomData }, cloudCustomDataObj));
                        message = this.TUICore.tim.createTextMessage(secondOptions);
                        this.currentStore.messageList.push(message);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message)];
                    case 1:
                        imResponse_6 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_6.data.message.ID) {
                                return imResponse_6.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_6);
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        reject(error_11);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送【对方正在输入中】在线自定义消息
     * send typing online custom message
     *
     * @param {Object} data 消息内容/message content
     * @param {String} data.data 自定义消息的数据字段/custom message data field
     * @param {String} data.description 自定义消息的说明字段/custom message description field
     * @param {String} data.extension 自定义消息的扩展字段/custom message extension field
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendTypingMessage = function (data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message, imResponse, error_12, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data.data = JSON.stringify(data.data);
                        options = this.handleMessageOptions(data, "custom");
                        message = this.TUICore.tim.createCustomMessage(options);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message, {
                                onlineUserOnly: true
                            })];
                    case 1:
                        imResponse = _a.sent();
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        reject(error_12);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送@ 提醒功能的文本消息
     * Send @ Reminder text message
     *
     * @param {any} data 消息内容/message content
     * @param {String} data.text 文本消息/text message
     * @param {Array} data.atUserList 需要 @ 的用户列表，如果需要 @ALL，请传入 TIM.TYPES.MSG_AT_ALL / List of users who need @, if you need @ALL, please pass in TIM.TYPES.MSG_AT_ALL
     * @returns {message}
     *
     * - 注：此接口仅用于群聊/This interface is only used for group chat
     */
    TUIChatServer.prototype.sendTextAtMessage = function (data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message, imResponse_7, error_13, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions(data, "text");
                        message = this.TUICore.tim.createTextAtMessage(options);
                        this.currentStore.messageList.push(message);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message)];
                    case 1:
                        imResponse_7 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_7.data.message.ID) {
                                return imResponse_7.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_7);
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        reject(error_13);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 发送合并消息
     * send merger message
     *
     * @param {Object} data 消息内容/message content
     * @param {Array.<Message>} data.messageList 合并的消息列表/merger message list
     * @param {String} data.title 合并的标题/merger title
     * @param {String} data.abstractList 摘要列表，不同的消息类型可以设置不同的摘要信息/Summary list, different message types can set different summary information
     * @param {String} data.compatibleText 兼容文本/ompatible text
     * @returns {Promise}
     */
    TUIChatServer.prototype.sendMergerMessage = function (data) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var options, message, imResponse_8, error_14, middleData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        options = this.handleMessageOptions(data, "merger");
                        message = this.TUICore.tim.createMergerMessage(options);
                        this.currentStore.messageList.push(message);
                        return [4 /*yield*/, this.TUICore.tim.sendMessage(message)];
                    case 1:
                        imResponse_8 = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.map(function (item) {
                            if (item.ID === imResponse_8.data.message.ID) {
                                return imResponse_8.data.message;
                            }
                            return item;
                        });
                        resolve(imResponse_8);
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _a.sent();
                        reject(error_14);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 消息撤回
     * revoke message
     *
     * @param {message} message 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.revokeMessage = function (message) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, cloudCustomData, error_15, middleData;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.TUICore.tim.revokeMessage(message)];
                    case 1:
                        imResponse = _b.sent();
                        cloudCustomData = utils_1.JSONToObject(message === null || message === void 0 ? void 0 : message.cloudCustomData);
                        if (!((_a = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReply) === null || _a === void 0 ? void 0 : _a.messageRootID)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.revokeReplyMessage(message)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        resolve(imResponse);
                        return [3 /*break*/, 5];
                    case 4:
                        error_15 = _b.sent();
                        reject(error_15);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 重发消息
     * resend message
     *
     * @param {message} message 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.resendMessage = function (message) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.resendMessage(message)];
                    case 1:
                        imResponse = _a.sent();
                        this.currentStore.messageList = this.currentStore.messageList.filter(function (item) { return item.ID !== message.ID; });
                        this.currentStore.messageList.push(imResponse.data.message);
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _a.sent();
                        reject(error_16);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 删除消息
     * delete message
     *
     * @param {Array.<message>} messages 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.deleteMessage = function (messages) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, middleData, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.deleteMessage(messages)];
                    case 1:
                        imResponse = _a.sent();
                        resolve(imResponse);
                        middleData = this.currentStore.messageList;
                        this.currentStore.messageList = [];
                        this.currentStore.messageList = middleData;
                        return [3 /*break*/, 3];
                    case 2:
                        error_17 = _a.sent();
                        reject(error_17);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 变更消息
     * modify message
     *
     * @param {Array.<message>} message 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.modifyMessage = function (message) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_18, code, data;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.modifyMessage(message)];
                    case 1:
                        imResponse = _c.sent();
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_18 = _c.sent();
                        code = (_a = error_18) === null || _a === void 0 ? void 0 : _a.code;
                        data = (_b = error_18) === null || _b === void 0 ? void 0 : _b.data;
                        if (code === 2480) {
                            console.warn("MODIFY_MESSAGE_ERROR", "修改消息发生冲突，data.message 是最新的消息", "data.message:", data === null || data === void 0 ? void 0 : data.message);
                        }
                        else if (code === 2481) {
                            console.warn("MODIFY_MESSAGE_ERROR", "不支持修改直播群消息");
                        }
                        else if (code === 20026) {
                            console.warn("MODIFY_MESSAGE_ERROR", "消息不存在");
                        }
                        reject(error_18);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 回复消息
     * reply message
     * @param {Array.<message>} message 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.replyMessage = function (message, messageRoot) {
        var _this = this;
        var replyFunction = function () {
            return _this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var repliesObject, cloudCustomData, messageRootID_1, rootCloudCustomData, imResponse, error_19;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 3, , 4]);
                            repliesObject = {
                                messageAbstract: (_a = message === null || message === void 0 ? void 0 : message.payload) === null || _a === void 0 ? void 0 : _a.text,
                                messageSender: message === null || message === void 0 ? void 0 : message.from,
                                messageID: message === null || message === void 0 ? void 0 : message.ID,
                                messageType: message === null || message === void 0 ? void 0 : message.type,
                                messageTime: message === null || message === void 0 ? void 0 : message.time,
                                messageSequence: message === null || message === void 0 ? void 0 : message.sequence,
                                version: 1
                            };
                            if (!!messageRoot) return [3 /*break*/, 2];
                            cloudCustomData = utils_1.JSONToObject(message === null || message === void 0 ? void 0 : message.cloudCustomData);
                            messageRootID_1 = (_b = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReply) === null || _b === void 0 ? void 0 : _b.messageRootID;
                            return [4 /*yield*/, ((_d = (_c = this === null || this === void 0 ? void 0 : this.currentStore) === null || _c === void 0 ? void 0 : _c.messageList) === null || _d === void 0 ? void 0 : _d.find(function (item) { return (item === null || item === void 0 ? void 0 : item.ID) === messageRootID_1; }))];
                        case 1:
                            messageRoot =
                                (_g.sent()) || this.findMessage(messageRootID_1);
                            _g.label = 2;
                        case 2:
                            rootCloudCustomData = (messageRoot === null || messageRoot === void 0 ? void 0 : messageRoot.cloudCustomData) ? utils_1.JSONToObject(messageRoot === null || messageRoot === void 0 ? void 0 : messageRoot.cloudCustomData)
                                : { messageReplies: {} };
                            if ((_e = rootCloudCustomData === null || rootCloudCustomData === void 0 ? void 0 : rootCloudCustomData.messageReplies) === null || _e === void 0 ? void 0 : _e.replies) {
                                rootCloudCustomData.messageReplies.replies = __spreadArrays((_f = rootCloudCustomData === null || rootCloudCustomData === void 0 ? void 0 : rootCloudCustomData.messageReplies) === null || _f === void 0 ? void 0 : _f.replies, [
                                    repliesObject,
                                ]);
                            }
                            else {
                                rootCloudCustomData.messageReplies = {
                                    replies: [repliesObject],
                                    version: 1
                                };
                            }
                            messageRoot.cloudCustomData = JSON.stringify(rootCloudCustomData);
                            imResponse = this.modifyMessage(messageRoot);
                            resolve(imResponse);
                            return [3 /*break*/, 4];
                        case 3:
                            error_19 = _g.sent();
                            reject(error_19);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        };
        var retryBreakFunction = function (error) {
            if (error && (error === null || error === void 0 ? void 0 : error.code) === 2480)
                return false;
            return true;
        };
        return this.handlePromiseCallbackRetry(replyFunction, [500, 1000, 3000], retryBreakFunction);
    };
    /**
     * 撤回回复消息
     * revoke reply message
     * @param {Array.<message>} message 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.revokeReplyMessage = function (message, messageRoot) {
        var _this = this;
        var revokeReplyFunction = function () {
            return _this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var cloudCustomData, messageRootID_2, rootCloudCustomData, index, imResponse, error_20;
                var _a, _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 3, , 4]);
                            if (!!messageRoot) return [3 /*break*/, 2];
                            cloudCustomData = utils_1.JSONToObject(message === null || message === void 0 ? void 0 : message.cloudCustomData);
                            messageRootID_2 = (_a = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReply) === null || _a === void 0 ? void 0 : _a.messageRootID;
                            return [4 /*yield*/, ((_c = (_b = this === null || this === void 0 ? void 0 : this.currentStore) === null || _b === void 0 ? void 0 : _b.messageList) === null || _c === void 0 ? void 0 : _c.find(function (item) { return (item === null || item === void 0 ? void 0 : item.ID) === messageRootID_2; }))];
                        case 1:
                            messageRoot =
                                (_g.sent()) || this.findMessage(messageRootID_2);
                            _g.label = 2;
                        case 2:
                            rootCloudCustomData = (messageRoot === null || messageRoot === void 0 ? void 0 : messageRoot.cloudCustomData) ? utils_1.JSONToObject(messageRoot === null || messageRoot === void 0 ? void 0 : messageRoot.cloudCustomData)
                                : { messageReplies: {} };
                            if ((_d = rootCloudCustomData === null || rootCloudCustomData === void 0 ? void 0 : rootCloudCustomData.messageReplies) === null || _d === void 0 ? void 0 : _d.replies) {
                                index = rootCloudCustomData.messageReplies.replies.findIndex(function (item) { return (item === null || item === void 0 ? void 0 : item.messageID) === (message === null || message === void 0 ? void 0 : message.ID); });
                                (_f = (_e = rootCloudCustomData === null || rootCloudCustomData === void 0 ? void 0 : rootCloudCustomData.messageReplies) === null || _e === void 0 ? void 0 : _e.replies) === null || _f === void 0 ? void 0 : _f.splice(index, 1);
                            }
                            messageRoot.cloudCustomData = JSON.stringify(rootCloudCustomData);
                            imResponse = this.modifyMessage(messageRoot);
                            resolve(imResponse);
                            return [3 /*break*/, 4];
                        case 3:
                            error_20 = _g.sent();
                            reject(error_20);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        };
        var retryBreakFunction = function (error) {
            if (error && (error === null || error === void 0 ? void 0 : error.code) === 2480)
                return false;
            return true;
        };
        return this.handlePromiseCallbackRetry(revokeReplyFunction, [500, 1000, 3000], retryBreakFunction);
    };
    /**
     * 表情回应
     * emoji react
     * @param {Array.<message>} message 消息实例/message
     * @returns {Promise}
     */
    TUIChatServer.prototype.emojiReact = function (message, emojiID) {
        var _this = this;
        var emojiReactFunction = function () {
            return _this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var userID, cloudCustomData, index, imResponse, error_21;
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
                return __generator(this, function (_u) {
                    switch (_u.label) {
                        case 0:
                            _u.trys.push([0, 2, , 3]);
                            if (!message || !(message === null || message === void 0 ? void 0 : message.ID) || !emojiID)
                                reject();
                            userID = (_e = (_d = (_c = (_b = (_a = this.TUICore) === null || _a === void 0 ? void 0 : _a.TUIServer) === null || _b === void 0 ? void 0 : _b.TUIProfile) === null || _c === void 0 ? void 0 : _c.store) === null || _d === void 0 ? void 0 : _d.profile) === null || _e === void 0 ? void 0 : _e.userID;
                            return [4 /*yield*/, ((_g = (_f = this === null || this === void 0 ? void 0 : this.currentStore) === null || _f === void 0 ? void 0 : _f.messageList) === null || _g === void 0 ? void 0 : _g.find(function (item) { return (item === null || item === void 0 ? void 0 : item.ID) === (message === null || message === void 0 ? void 0 : message.ID); }))];
                        case 1:
                            message =
                                (_u.sent()) || this.findMessage(message === null || message === void 0 ? void 0 : message.ID);
                            cloudCustomData = (message === null || message === void 0 ? void 0 : message.cloudCustomData) ? utils_1.JSONToObject(message === null || message === void 0 ? void 0 : message.cloudCustomData)
                                : { messageReact: {} };
                            if ((_h = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _h === void 0 ? void 0 : _h.reacts) {
                                if ((_j = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _j === void 0 ? void 0 : _j.reacts[emojiID]) {
                                    index = (_l = (_k = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _k === void 0 ? void 0 : _k.reacts[emojiID]) === null || _l === void 0 ? void 0 : _l.indexOf(userID);
                                    if (index === -1) {
                                        (_o = (_m = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _m === void 0 ? void 0 : _m.reacts[emojiID]) === null || _o === void 0 ? void 0 : _o.push(userID);
                                    }
                                    else {
                                        (_q = (_p = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _p === void 0 ? void 0 : _p.reacts[emojiID]) === null || _q === void 0 ? void 0 : _q.splice(index, 1);
                                        if (((_s = (_r = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _r === void 0 ? void 0 : _r.reacts[emojiID]) === null || _s === void 0 ? void 0 : _s.length) === 0) {
                                            (_t = cloudCustomData === null || cloudCustomData === void 0 ? void 0 : cloudCustomData.messageReact) === null || _t === void 0 ? true : delete _t.reacts[emojiID];
                                        }
                                    }
                                }
                                else {
                                    cloudCustomData.messageReact.reacts[emojiID] = [userID];
                                }
                            }
                            else {
                                cloudCustomData.messageReact = {
                                    reacts: {},
                                    version: 1
                                };
                                cloudCustomData.messageReact.reacts[emojiID] = [userID];
                            }
                            message.cloudCustomData = JSON.stringify(cloudCustomData);
                            imResponse = this.modifyMessage(message);
                            resolve(imResponse);
                            return [3 /*break*/, 3];
                        case 2:
                            error_21 = _u.sent();
                            reject(error_21);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        };
        var retryBreakFunction = function (error) {
            if (error && (error === null || error === void 0 ? void 0 : error.code) === 2480)
                return false;
            return true;
        };
        return this.handlePromiseCallbackRetry(emojiReactFunction, [500, 1000, 3000], retryBreakFunction);
    };
    /**
     * 查询消息
     * find message
     * @param {String} messageID 消息实例ID/messageID
     * @returns {Promise}
     */
    TUIChatServer.prototype.findMessage = function (messageID) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.findMessage(messageID)];
                    case 1:
                        imResponse = _a.sent();
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_22 = _a.sent();
                        reject(error_22);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 获取群组属性
     * get group profile
     *
     * @param {any} options 参数
     * @param {String} options.groupID 群组ID
     * @param {Array.<String>} options.groupProfileFilter 群资料过滤器
     * @returns {Promise}
     */
    TUIChatServer.prototype.getGroupProfile = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.getGroupProfile(options)];
                    case 1:
                        imResponse = _a.sent();
                        this.currentStore.conversation.groupProfile = imResponse.data.group;
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_23 = _a.sent();
                        reject(error_23);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 获取群成员资料
     * get group member profile
     *
     * @param {any} options 参数
     * @param {String} options.groupID 群组ID
     * @param {Array.<String>} options.userIDList 要查询的群成员用户 ID 列表
     * @param {	Array.<String>} options.memberCustomFieldFilter 群成员自定义字段筛选
     * @returns {Promise}
     */
    TUIChatServer.prototype.getGroupMemberProfile = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_24;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.getGroupMemberProfile(options)];
                    case 1:
                        imResponse = _a.sent();
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_24 = _a.sent();
                        reject(error_24);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 处理申请加群
     * handling group application
     * - 管理员
     *   administrator
     *
     * @param {any} options 参数
     * @param {String} options.handleAction 处理结果 Agree(同意) / Reject(拒绝)
     * @param {String} options.handleMessage 附言
     * @param {Message} options.message 对应【群系统通知】的消息实例
     * @returns {Promise}
     */
    TUIChatServer.prototype.handleGroupApplication = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_25;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.handleGroupApplication(options)];
                    case 1:
                        imResponse = _a.sent();
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_25 = _a.sent();
                        reject(error_25);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 获取其他用户资料
     * get user profile
     *
     * @param {Array<string>} userIDList 用户的账号列表/userID list
     * @returns {Promise}
     */
    TUIChatServer.prototype.getUserProfile = function (userIDList) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_26;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getUserProfile({
                                            userIDList: userIDList
                                        })];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_26 = _a.sent();
                                    reject(error_26);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取 SDK 缓存的好友列表
     * Get the friend list cached by the SDK
     *
     * @param {Array<string>} userIDList 用户的账号列表
     * @returns {Promise}
     */
    TUIChatServer.prototype.getFriendList = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_27;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getFriendList()];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_27 = _a.sent();
                                    reject(error_27);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 校验好友关系
     * check friend
     *
     * @param {string} userID 用户账号
     * @returns {Promise}
     */
    TUIChatServer.prototype.checkFriend = function (userID, type) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, isFriendShip, error_28;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.checkFriend({
                                            userIDList: [userID],
                                            type: type
                                        })];
                                case 1:
                                    imResponse = _c.sent();
                                    isFriendShip = (_b = (_a = imResponse === null || imResponse === void 0 ? void 0 : imResponse.data) === null || _a === void 0 ? void 0 : _a.successUserIDList[0]) === null || _b === void 0 ? void 0 : _b.relation;
                                    resolve(isFriendShip);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_28 = _c.sent();
                                    reject(error_28);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取群消息已读成员列表
     * Get the list of memebers who have read the group message.
     *
     * @param {message} message 消息实例/message
     * @param {string} cursor 分页拉取的游标，第一次拉取传''/Paging pull the cursor,first pull pass ''
     * @param {number} count 分页拉取的个数/The number of page pulls
     * @returns {Promise}
     */
    TUIChatServer.prototype.getGroupReadMemberList = function (message, cursor, count) {
        if (cursor === void 0) { cursor = ""; }
        if (count === void 0) { count = 15; }
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_29;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getGroupMessageReadMemberList({
                                            message: message,
                                            filter: 0,
                                            cursor: cursor,
                                            count: count
                                        })];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_29 = _a.sent();
                                    reject(error_29);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取群消息未读成员列表
     * Get the list of memebers who have not read the group message.
     *
     * @param {message} message 消息实例/message
     * @param {string} cursor 分页拉取的游标，第一次拉取传''/Paging pull the cursor,first pull pass ''
     * @param {number} count 分页拉取的个数/The number of page pulls
     * @returns {Promise}
     */
    TUIChatServer.prototype.getGroupUnreadMemberList = function (message, cursor, count) {
        if (cursor === void 0) { cursor = ""; }
        if (count === void 0) { count = 15; }
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_30;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getGroupMessageReadMemberList({
                                            message: message,
                                            filter: 1,
                                            cursor: cursor,
                                            count: count
                                        })];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_30 = _a.sent();
                                    reject(error_30);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 自己发送消息上屏显示
     *
     * @param {message} message 消息实例/message
     */
    TUIChatServer.prototype.handleMessageSentByMeToView = function (message) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                if ((message === null || message === void 0 ? void 0 : message.conversationID) === ((_b = (_a = this === null || this === void 0 ? void 0 : this.store) === null || _a === void 0 ? void 0 : _a.conversation) === null || _b === void 0 ? void 0 : _b.conversationID)) {
                    this.currentStore.messageList.push(message);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                    UI 数据绑定server数据同步
     * //                           UI data binding server data synchronization
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /**
     * 赋值
     * bind
     *
     * @param {Object} params 使用的数据/params
     * @returns {Object} 数据/data
     */
    TUIChatServer.prototype.bind = function (params) {
        return (this.currentStore = params);
    };
    return TUIChatServer;
}(IComponentServer_1["default"]));
exports["default"] = TUIChatServer;
