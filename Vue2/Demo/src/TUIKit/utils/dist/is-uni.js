"use strict";
var _a;
exports.__esModule = true;
exports.isUniFrameWork = void 0;
var chat_uikit_engine_1 = require("@tencentcloud/chat-uikit-engine");
var isUniFrameWork = ((_a = chat_uikit_engine_1.TUIGlobal === null || chat_uikit_engine_1.TUIGlobal === void 0 ? void 0 : chat_uikit_engine_1.TUIGlobal.global) === null || _a === void 0 ? void 0 : _a.window) ? false : true;
exports.isUniFrameWork = isUniFrameWork;
