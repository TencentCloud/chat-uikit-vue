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
var IComponentServer_1 = require("../IComponentServer");
var store = {};
/**
 * class TUIContactServer
 *
 * TUIGroup 逻辑主体
 */
var TUIContactServer = /** @class */ (function (_super) {
    __extends(TUIContactServer, _super);
    function TUIContactServer(TUICore) {
        var _this = _super.call(this) || this;
        _this.currentStore = {};
        _this.TUICore = TUICore;
        _this.bindTIMEvent();
        _this.store = TUICore.setComponentStore('TUIContact', store, _this.updateStore.bind(_this));
        return _this;
    }
    /**
     * 组件销毁
     * destroy
     */
    TUIContactServer.prototype.destroyed = function () {
        this.unbindTIMEvent();
    };
    /**
     * 数据监听回调
     * data listener callback
     *
     * @param {any} newValue 新数据/new value
     * @param {any} oldValue 旧数据/old value
     */
    TUIContactServer.prototype.updateStore = function (newValue, oldValue) {
        this.currentStore.groupList = newValue.groupList;
        this.currentStore.searchGroup = newValue.searchGroup;
        this.currentStore.systemConversation = newValue.systemConversation;
        this.currentStore.systemMessageList = newValue.systemMessageList;
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                    TIM 事件监听注册接口
     * //                        TIM Event listener registration interface
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    TUIContactServer.prototype.bindTIMEvent = function () {
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.GROUP_LIST_UPDATED, this.handleGroupListUpdated, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.GROUP_ATTRIBUTES_UPDATED, this.handleGroupAttributesUpdated, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.handleConversationListUpdate, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.FRIEND_LIST_UPDATED, this.handleFriendListUpdated, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.USER_STATUS_UPDATED, this.handleUserStatusUpdated, this);
    };
    TUIContactServer.prototype.unbindTIMEvent = function () {
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.GROUP_LIST_UPDATED, this.handleGroupListUpdated);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.GROUP_ATTRIBUTES_UPDATED, this.handleGroupAttributesUpdated);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.handleConversationListUpdate);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.FRIEND_LIST_UPDATED, this.handleFriendListUpdated);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.USER_STATUS_UPDATED, this.handleUserStatusUpdated);
    };
    TUIContactServer.prototype.handleGroupListUpdated = function (event) {
        this.store.groupList = event.data;
    };
    TUIContactServer.prototype.handleGroupAttributesUpdated = function (event) {
        var _a = event.data, groupID = _a.groupID, groupAttributes = _a.groupAttributes;
        console.log(groupID, groupAttributes);
    };
    TUIContactServer.prototype.handleConversationListUpdate = function (res) {
        this.handleFilterSystem(res.data);
    };
    TUIContactServer.prototype.handleFriendListUpdated = function (event) {
        this.currentStore.friendList = event.data;
        this.currentStore.userIDList = this.currentStore.friendList.map(function (item) { return item.userID; });
    };
    TUIContactServer.prototype.handleUserStatusUpdated = function (event) {
        var _this = this;
        var userStatusList = event.data;
        userStatusList.forEach(function (item) {
            var _a, _b, _c, _d, _e, _f, _g;
            var userID = item.userID, statusType = item.statusType, customStatus = item.customStatus;
            (_b = (_a = _this.currentStore) === null || _a === void 0 ? void 0 : _a.userStatusList) === null || _b === void 0 ? void 0 : _b.set(userID, { statusType: statusType, customStatus: customStatus });
            (_g = (_f = (_e = (_d = (_c = _this.TUICore) === null || _c === void 0 ? void 0 : _c.TUIServer) === null || _d === void 0 ? void 0 : _d.TUIConversation) === null || _e === void 0 ? void 0 : _e.currentStore) === null || _f === void 0 ? void 0 : _f.userStatusList) === null || _g === void 0 ? void 0 : _g.set(userID, { statusType: statusType, customStatus: customStatus });
        });
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
     * 处理异步函数
     * Handling asynchronous functions
     *
     * @param {callback} callback 回调函数/callback
     * @returns {Promise} 返回异步函数/return callback
     */
    TUIContactServer.prototype.handlePromiseCallback = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var config = {
                TUIName: 'TUIContact',
                callback: function () {
                    callback && callback(resolve, reject);
                }
            };
            _this.TUICore.setAwaitFunc(config.TUIName, config.callback);
        });
    };
    /**
     * 处理conversationList
     * Handle conversation list
     *
     * @param {Array} list conversationList
     * @returns {Object}
     */
    TUIContactServer.prototype.handleFilterSystem = function (list) {
        var _this = this;
        var options = {
            allConversationList: list,
            systemConversationList: []
        };
        options.systemConversationList = list.filter(function (item) { return item.type === _this.TUICore.TIM.TYPES.CONV_SYSTEM; });
        this.store.allConversationList = options.allConversationList;
        this.store.systemConversationList = options.systemConversationList;
        var systemConversation = options.systemConversationList[0];
        this.store.systemConversation = systemConversation;
        return options;
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                 对外方法
     * //                               TIM methods
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /*
     * 获取 conversationList
     * Get conversation list
     *
     * @returns {Promise}
     */
    TUIContactServer.prototype.getConversationList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getConversationList()];
                                case 1:
                                    imResponse = _a.sent();
                                    this.handleFilterSystem(imResponse.data.conversationList);
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    reject(error_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取系统通知 messageList
     * Get system messages
     *
     * @returns {Promise}
     */
    TUIContactServer.prototype.getSystemMessageList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            var _this = this;
            return __generator(this, function (_a) {
                options = {
                    conversationID: this.store.systemConversation.conversationID,
                    count: 15
                };
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getMessageList(options)];
                                case 1:
                                    imResponse = _a.sent();
                                    this.store.systemMessageList = imResponse.data.messageList;
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    reject(error_2);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 设置已读
     * Set message read
     *
     * @param {string} conversationID 会话ID/ conversation's ID
     * @returns {Promise}
     */
    TUIContactServer.prototype.setMessageRead = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.setMessageRead({
                                            conversationID: this.store.systemConversation.conversationID
                                        })];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_3 = _a.sent();
                                    reject(error_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取群组列表
     * Get group list
     *
     * @param {any} options 参数/options
     * @param {Array.<String>} options.groupProfileFilter 群资料过滤器/group profile filter
     * @returns {Promise}
     */
    TUIContactServer.prototype.getGroupList = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    imResponse = {};
                                    if (!!options) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.TUICore.tim.getGroupList()];
                                case 1:
                                    imResponse = _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, this.TUICore.tim.getGroupList(options)];
                                case 3:
                                    imResponse = _a.sent();
                                    _a.label = 4;
                                case 4:
                                    this.store.groupList = imResponse.data.groupList;
                                    resolve(imResponse);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_4 = _a.sent();
                                    reject(error_4);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取群组属性
     * Get group profile
     *
     * @param {any} options 参数/options
     * @param {String} options.groupID 群组ID/group's ID
     * @param {Array.<String>} options.groupProfileFilter 群资料过滤器/group profile filter
     * @returns {Promise}
     */
    TUIContactServer.prototype.getGroupProfile = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.getGroupProfile(options)];
                    case 1:
                        imResponse = _a.sent();
                        this.store.groupList = imResponse.data.groupList;
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        reject(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 删除群组
     * Dismiss group
     *
     * @param {String} groupID 群组ID/group's ID
     * @returns {Promise}
     */
    TUIContactServer.prototype.dismissGroup = function (groupID) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.dismissGroup(groupID)];
                    case 1:
                        imResponse = _a.sent();
                        this.store.groupProfile = imResponse.data.group;
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        reject(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 修改群组资料
     * Update group profile
     *
     * @param {any} options 参数/params options
     * @param {String} options.groupID 群组ID/group's ID
     * @param {String} options.name 群组名称/group's name
     * @param {String} options.introduction 群简介/group's introduction
     * @param {String} options.notification 群公告/group's notification
     * @param {String} options.avatar 群头像 URL/group's avatar url
     * @param {Number} options.maxMemberNum 最大群成员数量/the max number of group's member
     * @param {Number} options.joinOption 申请加群处理方式/group's join options
     * @param {Array.<Object>} options.groupCustomField 群组维度的自定义字段/custom fields for group dimensions
     * @returns {Promise}
     */
    TUIContactServer.prototype.updateGroupProfile = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.updateGroupProfile(options)];
                    case 1:
                        imResponse = _a.sent();
                        this.store.groupProfile = imResponse.data.group;
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        reject(error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 申请加群
     * Join group
     *
     * @param {any} options 参数/options
     * @param {String} options.groupID 群组ID/group's ID
     * @param {String} options.applyMessage 附言/apply message
     * @param {String} options.type 群组类型/group's type
     * @returns {Promise}
     */
    TUIContactServer.prototype.joinGroup = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.joinGroup(options)];
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
        }); });
    };
    /**
     * 退出群组
     * Quit group
     *
     * @param {String} groupID 群组ID/group's ID
     * @returns {Promise}
     */
    TUIContactServer.prototype.quitGroup = function (groupID) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.quitGroup(groupID)];
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
        }); });
    };
    /**
     * 通过 groupID 搜索群组
     * Search group by group's ID
     *
     * @param {String} groupID 群组ID/group's ID
     * @returns {Promise}
     */
    TUIContactServer.prototype.searchGroupByID = function (groupID) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.TUICore.tim.searchGroupByID(groupID)];
                    case 1:
                        imResponse = _a.sent();
                        this.store.searchGroup = imResponse.data.group;
                        resolve(imResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        this.store.searchGroup = {};
                        reject(error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 处理申请加群
     * Handle group application
     * - 管理员/administrator
     *
     * @param {any} options 参数/options
     * @param {String} options.handleAction 处理结果 Agree(同意) / Reject(拒绝)
     * @param {String} options.handleMessage 附言/apply message
     * @param {Message} options.message 对应【群系统通知】的消息实例/the message corresponding to 【group system notification】
     * @returns {Promise}
     */
    TUIContactServer.prototype.handleGroupApplication = function (options) {
        var _this = this;
        return this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var imResponse, error_11;
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
                        error_11 = _a.sent();
                        reject(error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * 获取 SDK 缓存的好友列表
     * Get friend list from SDK
     *
     * @param {Array<string>} userIDList 用户的账号列表/userID list
     * @returns {Promise}
     */
    TUIContactServer.prototype.getFriendList = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getFriendList()];
                                case 1:
                                    imResponse = _a.sent();
                                    this.currentStore.friendList = imResponse.data;
                                    this.currentStore.userIDList = this.currentStore.friendList.map(function (item) { return item.userID; }) || [];
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_12 = _a.sent();
                                    reject(error_12);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取 用户状态
     * Get users’ status
     *
     * @param {Array<string>} userIDList 用户 userID 列表 / userID list
     * @returns {Promise}
     */
    TUIContactServer.prototype.getUserStatus = function (userIDList) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_13;
                        var _this = this;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 3]);
                                    if (!userIDList.length)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, this.TUICore.tim.getUserStatus({ userIDList: userIDList })];
                                case 1:
                                    imResponse = _c.sent();
                                    (_b = (_a = imResponse === null || imResponse === void 0 ? void 0 : imResponse.data) === null || _a === void 0 ? void 0 : _a.successUserList) === null || _b === void 0 ? void 0 : _b.forEach(function (item) {
                                        var _a, _b, _c, _d, _e, _f, _g;
                                        if (item && (item === null || item === void 0 ? void 0 : item.userID)) {
                                            (_b = (_a = _this.currentStore) === null || _a === void 0 ? void 0 : _a.userStatusList) === null || _b === void 0 ? void 0 : _b.set(item === null || item === void 0 ? void 0 : item.userID, {
                                                statusType: item === null || item === void 0 ? void 0 : item.statusType,
                                                customStatus: item === null || item === void 0 ? void 0 : item.customStatus
                                            });
                                            (_g = (_f = (_e = (_d = (_c = _this.TUICore) === null || _c === void 0 ? void 0 : _c.TUIServer) === null || _d === void 0 ? void 0 : _d.TUIConversation) === null || _e === void 0 ? void 0 : _e.currentStore) === null || _f === void 0 ? void 0 : _f.userStatusList) === null || _g === void 0 ? void 0 : _g.set(item === null || item === void 0 ? void 0 : item.userID, {
                                                statusType: item === null || item === void 0 ? void 0 : item.statusType,
                                                customStatus: item === null || item === void 0 ? void 0 : item.customStatus
                                            });
                                        }
                                    });
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_13 = _c.sent();
                                    reject(error_13);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 订阅 用户状态
     * Subscribe users' status
     *
     * @param {Array<string>} userIDList 用户 userID 列表 / userID list
     * @returns {Promise}
     */
    TUIContactServer.prototype.subscribeUserStatus = function (userIDList) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_14;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    if (!userIDList.length)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, this.TUICore.tim.subscribeUserStatus({ userIDList: userIDList })];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_14 = _a.sent();
                                    reject(error_14);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 取消订阅 用户状态
     * Unscribe users' status
     *
     * @param {Array<string>} userIDList 用户 userID 列表 / userID list
     * @returns {Promise}
     */
    TUIContactServer.prototype.unsubscribeUserStatus = function (userIDList) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_15;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 3]);
                                    if (userIDList && !userIDList.length)
                                        return [2 /*return*/];
                                    return [4 /*yield*/, this.TUICore.tim.unsubscribeUserStatus({ userIDList: userIDList })];
                                case 1:
                                    imResponse = _c.sent();
                                    (_b = (_a = this.currentStore) === null || _a === void 0 ? void 0 : _a.userStatusList) === null || _b === void 0 ? void 0 : _b.clear();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_15 = _c.sent();
                                    reject(error_15);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 处理 用户状态（订阅并获取用户状态 / 取消订阅用户状态）
     * Handle users' status （ subscribe and get user status / unsubscribe user status ）
     *
     * @param {boolean} displayOnlineStatus 是否展示用户在线状态 / whether to display the user's online status
     * @param {Array<string>} userIDList 用户 userID 列表 / userID list
     * @returns {Promise}
     */
    TUIContactServer.prototype.handleUserStatus = function (displayOnlineStatus, userIDList) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            try {
                                setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!displayOnlineStatus) return [3 /*break*/, 3];
                                                return [4 /*yield*/, this.subscribeUserStatus(userIDList)];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, this.getUserStatus(userIDList)];
                                            case 2:
                                                _a.sent();
                                                return [3 /*break*/, 5];
                                            case 3: return [4 /*yield*/, this.unsubscribeUserStatus(userIDList)];
                                            case 4:
                                                _a.sent();
                                                _a.label = 5;
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); }, 1000);
                            }
                            catch (error) {
                                reject(error);
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    /**
     * 赋值
     * Bind
     *
     * @param {Object} params 使用的数据/params data
     * @returns {Object} 数据/data
     */
    TUIContactServer.prototype.bind = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.currentStore = params;
                        return [4 /*yield*/, this.getGroupList()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getConversationList()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getFriendList()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.currentStore];
                }
            });
        });
    };
    return TUIContactServer;
}(IComponentServer_1["default"]));
exports["default"] = TUIContactServer;
