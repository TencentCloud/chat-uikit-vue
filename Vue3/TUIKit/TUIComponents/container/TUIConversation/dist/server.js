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
/**
 * class TUIConversationServer
 *
 * TUIConversation 逻辑主体
 */
var TUIConversationServer = /** @class */ (function (_super) {
    __extends(TUIConversationServer, _super);
    function TUIConversationServer(TUICore) {
        var _this = _super.call(this) || this;
        _this.currentStore = {};
        _this.TUICore = TUICore;
        _this.bindTIMEvent();
        _this.store = TUICore.setComponentStore('TUIConversation', {}, _this.updateStore.bind(_this));
        return _this;
    }
    /**
     * 组件销毁
     *
     */
    TUIConversationServer.prototype.destroyed = function () {
        this.unbindTIMEvent();
    };
    /**
     * 数据监听回调
     *
     * @param {any} newValue 新数据
     * @param {any} oldValue 旧数据
     */
    TUIConversationServer.prototype.updateStore = function (newValue, oldValue) {
        var _a, _b;
        if (!((_a = this === null || this === void 0 ? void 0 : this.currentStore) === null || _a === void 0 ? void 0 : _a.conversationData)) {
            return;
        }
        this.currentStore.conversationData.list = newValue.conversationList;
        this.currentStore.userIDList = (_b = this.currentStore.conversationData.list) === null || _b === void 0 ? void 0 : _b.filter(function (item) { var _a; return (_a = item === null || item === void 0 ? void 0 : item.userProfile) === null || _a === void 0 ? void 0 : _a.userID; }).map(function (item) { var _a; return (_a = item === null || item === void 0 ? void 0 : item.userProfile) === null || _a === void 0 ? void 0 : _a.userID; });
    };
    /**
     * 处理异步函数
     *
     * @param {callback} callback 回调函数
     * @returns {Promise} 返回异步函数
     */
    TUIConversationServer.prototype.handlePromiseCallback = function (callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var config = {
                TUIName: 'TUIConversation',
                callback: function () {
                    callback && callback(resolve, reject);
                }
            };
            _this.TUICore.setAwaitFunc(config.TUIName, config.callback);
        });
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                    TIM 事件监听注册接口
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    TUIConversationServer.prototype.bindTIMEvent = function () {
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.handleConversationListUpdate, this);
        this.TUICore.tim.on(this.TUICore.TIM.EVENT.NET_STATE_CHANGE, this.handleNetStateChange, this);
    };
    TUIConversationServer.prototype.unbindTIMEvent = function () {
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.handleConversationListUpdate);
        this.TUICore.tim.off(this.TUICore.TIM.EVENT.NET_STATE_CHANGE, this.handleNetStateChange);
    };
    TUIConversationServer.prototype.handleConversationListUpdate = function (res) {
        this.handleFilterSystem(res.data);
    };
    TUIConversationServer.prototype.handleNetStateChange = function (res) {
        var _a;
        this.currentStore.netWork = ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.state) || '';
    };
    /**
     * 处理conversationList
     *
     * @param {Array} list conversationList
     * @returns {Object}
     */
    TUIConversationServer.prototype.handleFilterSystem = function (list) {
        var _this = this;
        var options = {
            allConversationList: list,
            conversationList: []
        };
        var currentList = list.filter(function (item) { var _a; return (item === null || item === void 0 ? void 0 : item.conversationID) === ((_a = _this === null || _this === void 0 ? void 0 : _this.currentStore) === null || _a === void 0 ? void 0 : _a.currentConversationID); });
        if (currentList.length === 0) {
            this.handleCurrentConversation({});
        }
        options.conversationList = list.filter(function (item) { return item.type !== _this.TUICore.TIM.TYPES.CONV_SYSTEM; });
        this.store.allConversationList = options.allConversationList;
        this.store.conversationList = options.conversationList;
        return options;
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                    TIM 方法
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /**
     * 设置会话内消息为已读状态
     * Set the message within the conversation to read
     *
     * @param {string} conversationID 会话ID
     * @returns {Promise}
     */
    TUIConversationServer.prototype.setMessageRead = function (conversationID) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.setMessageRead({ conversationID: conversationID })];
                                case 1:
                                    imResponse = _a.sent();
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
     * 删除会话
     *
     * @param {string} conversationID 会话ID
     * @returns {Promise}
     */
    TUIConversationServer.prototype.deleteConversation = function (conversationID) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.deleteConversation(conversationID)];
                                case 1:
                                    imResponse = _a.sent();
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
     * 置顶会话
     *
     * @param {Object} options 置顶参数
     * @returns {Promise}
     */
    TUIConversationServer.prototype.pinConversation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.pinConversation(options)];
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
     * C2C消息免打扰
     *
     * @param {Object} options 消息免打扰参数
     * @returns {Promise}
     */
    TUIConversationServer.prototype.muteConversation = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.setMessageRemindType(options)];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_4 = _a.sent();
                                    reject(error_4);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取 conversationList
     *
     * @param {string} conversationID 会话ID
     * @returns {Promise}
     */
    TUIConversationServer.prototype.getConversationProfile = function (conversationID) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getConversationProfile(conversationID)];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_5 = _a.sent();
                                    reject(error_5);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /*
     * 获取 conversationList
     *
     * @returns {Promise}
     */
    TUIConversationServer.prototype.getConversationList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_6;
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
                                    error_6 = _a.sent();
                                    reject(error_6);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取其他用户资料
     *
     * @param {Array<string>} userIDList 用户的账号列表
     * @returns {Promise}
     */
    TUIConversationServer.prototype.getUserProfile = function (userIDList) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handlePromiseCallback(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var imResponse, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, this.TUICore.tim.getUserProfile({ userIDList: userIDList })];
                                case 1:
                                    imResponse = _a.sent();
                                    resolve(imResponse);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_7 = _a.sent();
                                    reject(error_7);
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
     * //                                    UI 数据绑定server数据同步
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    /**
     * 赋值
     *
     * @param {Object} params 使用的数据
     * @returns {Object} 数据
     */
    TUIConversationServer.prototype.bind = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.currentStore = params;
                        return [4 /*yield*/, this.getConversationList()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.currentStore];
                }
            });
        });
    };
    // 切换当前会话
    TUIConversationServer.prototype.handleCurrentConversation = function (value) {
        // 通知 TUIChat 切换会话或关闭会话
        this.TUICore.getStore().TUIChat.conversation = value || {};
        if (!(value === null || value === void 0 ? void 0 : value.conversationID)) {
            this.currentStore.currentConversationID = '';
            return;
        }
        // Prevent group chat that is currently open from entering from the address book, resulting in no jump.
        if (this.currentStore.currentConversationID === (value === null || value === void 0 ? void 0 : value.conversationID)) {
            this.currentStore.currentConversationID = '';
        }
        if (this.currentStore.currentConversationID) {
            this.setMessageRead(this.currentStore.currentConversationID);
        }
        this.currentStore.currentConversationID = value === null || value === void 0 ? void 0 : value.conversationID;
        this.setMessageRead(value.conversationID);
    };
    return TUIConversationServer;
}(IComponentServer_1["default"]));
exports["default"] = TUIConversationServer;
