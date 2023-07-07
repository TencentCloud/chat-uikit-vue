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
exports.sendTyping = exports.handleMessageWithTyping = exports.sendMessages = void 0;
var chat_uikit_engine_1 = require("@tencentcloud/chat-uikit-engine");
var index_1 = require("../../common/Toast/index");
exports.sendMessages = function (messageList, currentConversation, replyOrReference) { return __awaiter(void 0, void 0, void 0, function () {
    var replyOrReferenceObject;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                replyOrReferenceObject = replyOrReference;
                return [4 /*yield*/, (messageList === null || messageList === void 0 ? void 0 : messageList.forEach(function (content) { return __awaiter(void 0, void 0, void 0, function () {
                        var cloudCustomData, res, options, _a, error_1;
                        var _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        return __generator(this, function (_l) {
                            switch (_l.label) {
                                case 0:
                                    _l.trys.push([0, 14, , 15]);
                                    cloudCustomData = void 0, res = void 0;
                                    options = {
                                        to: ((_b = currentConversation === null || currentConversation === void 0 ? void 0 : currentConversation.groupProfile) === null || _b === void 0 ? void 0 : _b.groupID) || ((_c = currentConversation === null || currentConversation === void 0 ? void 0 : currentConversation.userProfile) === null || _c === void 0 ? void 0 : _c.userID),
                                        conversationType: currentConversation === null || currentConversation === void 0 ? void 0 : currentConversation.type,
                                        payload: {}
                                    };
                                    // handle message typing
                                    options.cloudCustomData = exports.handleMessageWithTyping(cloudCustomData);
                                    _a = content === null || content === void 0 ? void 0 : content.type;
                                    switch (_a) {
                                        case "text": return [3 /*break*/, 1];
                                        case "image": return [3 /*break*/, 6];
                                        case "video": return [3 /*break*/, 8];
                                        case "file": return [3 /*break*/, 10];
                                    }
                                    return [3 /*break*/, 12];
                                case 1:
                                    if (!((_d = content === null || content === void 0 ? void 0 : content.payload) === null || _d === void 0 ? void 0 : _d.atUserList)) return [3 /*break*/, 3];
                                    options.payload = {
                                        text: JSON.parse(JSON.stringify((_e = content === null || content === void 0 ? void 0 : content.payload) === null || _e === void 0 ? void 0 : _e.text)),
                                        atUserList: (_f = content === null || content === void 0 ? void 0 : content.payload) === null || _f === void 0 ? void 0 : _f.atUserList
                                    };
                                    return [4 /*yield*/, (chat_uikit_engine_1.TUIChatService === null || chat_uikit_engine_1.TUIChatService === void 0 ? void 0 : chat_uikit_engine_1.TUIChatService.sendTextAtMessage(options)["catch"](function (err) {
                                            index_1.Toast({
                                                message: err === null || err === void 0 ? void 0 : err.message,
                                                type: index_1.TOAST_TYPE.ERROR
                                            });
                                        }))];
                                case 2:
                                    _l.sent();
                                    return [3 /*break*/, 5];
                                case 3:
                                    options.payload = {
                                        text: JSON.parse(JSON.stringify((_g = content === null || content === void 0 ? void 0 : content.payload) === null || _g === void 0 ? void 0 : _g.text))
                                    };
                                    return [4 /*yield*/, (chat_uikit_engine_1.TUIChatService === null || chat_uikit_engine_1.TUIChatService === void 0 ? void 0 : chat_uikit_engine_1.TUIChatService.sendTextMessage(options)["catch"](function (err) {
                                            index_1.Toast({
                                                message: err === null || err === void 0 ? void 0 : err.message,
                                                type: index_1.TOAST_TYPE.ERROR
                                            });
                                        }))];
                                case 4:
                                    _l.sent();
                                    _l.label = 5;
                                case 5: 
                                // 消息回复（此功能暂不支持）
                                // if (replyOrReferenceObject?.show === "reply") {
                                //   await TUIServer.replyMessage(res?.data?.message);
                                // }
                                return [3 /*break*/, 13];
                                case 6:
                                    options.payload = {
                                        file: (_h = content === null || content === void 0 ? void 0 : content.payload) === null || _h === void 0 ? void 0 : _h.file
                                    };
                                    return [4 /*yield*/, (chat_uikit_engine_1.TUIChatService === null || chat_uikit_engine_1.TUIChatService === void 0 ? void 0 : chat_uikit_engine_1.TUIChatService.sendImageMessage(options)["catch"](function (err) {
                                            index_1.Toast({
                                                message: err === null || err === void 0 ? void 0 : err.message,
                                                type: index_1.TOAST_TYPE.ERROR
                                            });
                                        }))];
                                case 7:
                                    _l.sent();
                                    return [3 /*break*/, 13];
                                case 8:
                                    options.payload = {
                                        file: (_j = content === null || content === void 0 ? void 0 : content.payload) === null || _j === void 0 ? void 0 : _j.file
                                    };
                                    return [4 /*yield*/, (chat_uikit_engine_1.TUIChatService === null || chat_uikit_engine_1.TUIChatService === void 0 ? void 0 : chat_uikit_engine_1.TUIChatService.sendVideoMessage(options)["catch"](function (err) {
                                            index_1.Toast({
                                                message: err === null || err === void 0 ? void 0 : err.message,
                                                type: index_1.TOAST_TYPE.ERROR
                                            });
                                        }))];
                                case 9:
                                    _l.sent();
                                    return [3 /*break*/, 13];
                                case 10:
                                    options.payload = {
                                        file: (_k = content === null || content === void 0 ? void 0 : content.payload) === null || _k === void 0 ? void 0 : _k.file
                                    };
                                    return [4 /*yield*/, (chat_uikit_engine_1.TUIChatService === null || chat_uikit_engine_1.TUIChatService === void 0 ? void 0 : chat_uikit_engine_1.TUIChatService.sendFileMessage(options)["catch"](function (err) {
                                            index_1.Toast({
                                                message: err.message,
                                                type: index_1.TOAST_TYPE.ERROR
                                            });
                                        }))];
                                case 11:
                                    _l.sent();
                                    return [3 /*break*/, 13];
                                case 12: return [3 /*break*/, 13];
                                case 13: return [3 /*break*/, 15];
                                case 14:
                                    error_1 = _l.sent();
                                    console.warn("messageInput sendMessage", error_1);
                                    return [3 /*break*/, 15];
                                case 15: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.handleMessageWithTyping = function (cloudCustomData) {
    if (!cloudCustomData) {
        cloudCustomData = {};
    }
    cloudCustomData.messageFeature = {
        needTyping: 1,
        version: 1
    };
    return cloudCustomData;
};
exports.sendTyping = function (inputContentEmpty, inputBlur) {
    if (!inputContentEmpty && !inputBlur) {
        chat_uikit_engine_1.TUIChatService.enterTypingState();
    }
    else {
        chat_uikit_engine_1.TUIChatService.leaveTypingState();
    }
};
