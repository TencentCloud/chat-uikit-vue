"use strict";
exports.__esModule = true;
exports.secretKey = exports.SDKAppID = void 0;
var vue_1 = require("vue");
var App_vue_1 = require("./App.vue");
var router_1 = require("./router");
var store_1 = require("./store");
var chat_uikit_vue_1 = require("@tencentcloud/chat-uikit-vue");
var chat_uikit_engine_1 = require("@tencentcloud/chat-uikit-engine");
var element_ui_1 = require("element-ui");
require("element-ui/lib/theme-chalk/index.css");
var locales_1 = require("./locales");
var SDKAppID = 0; // Your SDKAppID
exports.SDKAppID = SDKAppID;
var secretKey = ""; // Your secretKey
exports.secretKey = secretKey;
chat_uikit_vue_1.TUIChatKit.components(chat_uikit_vue_1.TUIComponents, vue_1["default"]);
chat_uikit_vue_1.TUIChatKit.init();
chat_uikit_engine_1.TUITranslateService.provideLanguages(locales_1.locales);
chat_uikit_engine_1.TUITranslateService.useI18n();
vue_1["default"].config.productionTip = false;
vue_1["default"].use(element_ui_1.Button);
vue_1["default"].use(element_ui_1.Form);
vue_1["default"].use(element_ui_1.FormItem);
vue_1["default"].use(element_ui_1.Dropdown);
vue_1["default"].use(element_ui_1.DropdownMenu);
vue_1["default"].use(element_ui_1.DropdownItem);
vue_1["default"].use(element_ui_1.Input);
vue_1["default"].use(element_ui_1.Checkbox);
new vue_1["default"]({
    router: router_1["default"],
    store: store_1["default"],
    render: function (h) { return h(App_vue_1["default"]); }
}).$mount("#app");
