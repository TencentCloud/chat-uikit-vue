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
exports.__esModule = true;
exports.useI18nLocale = void 0;
var vue_i18n_1 = require("vue-i18n");
var locales_1 = require("../../locales");
var TUIi18n = /** @class */ (function () {
    function TUIi18n(messages) {
        this.messages = {
            en: {},
            zh_cn: {}
        };
        this.messages = messages;
    }
    /**
     * 获取 TUIi18n 实例
     *
     * @returns {TUIi18n}
     */
    TUIi18n.getInstance = function () {
        if (!TUIi18n.instance) {
            TUIi18n.instance = new TUIi18n(locales_1["default"]);
        }
        return TUIi18n.instance;
    };
    /**
     * 注入需要国际化的词条
     *
     * @param {Object} messages 数据对象
     * @returns {messages} 全部国际化词条
     */
    TUIi18n.prototype.provideMessage = function (messages) {
        this.messages.en = __assign(__assign({}, this.messages.en), messages.en);
        this.messages.zh_cn = __assign(__assign({}, this.messages.zh_cn), messages.zh_cn);
        return this.messages;
    };
    /**
     * 使用国际化
     *
     * @returns {useI18n} 国际化使用函数
     */
    TUIi18n.prototype.useI18n = function () {
        return vue_i18n_1.useI18n();
    };
    /**
     * 挂载到 vue 实例的上
     *
     * @param {app} app vue的实例
     */
    TUIi18n.install = function (app) {
        var that = TUIi18n.getInstance();
        // const lang = navigator.language.substr(0, 2);
        var lang = 'zh';
        that.i18n = vue_i18n_1.createI18n({
            legacy: false,
            globalInjection: true,
            global: true,
            locale: lang === 'zh' ? 'zh_cn' : lang,
            fallbackLocale: 'zh_cn',
            messages: that.messages
        });
        console.warn(that.messages);
        app.use(that.i18n);
    };
    /**
     * 挂载到 TUICore
     *
     * @param {TUICore} TUICore TUICore实例
     */
    TUIi18n.plugin = function (TUICore) {
        TUICore.config.i18n = TUIi18n.getInstance();
    };
    return TUIi18n;
}());
/**
 * 国际化标识
 *
 * @returns {locale} 国际化标识
 */
function useI18nLocale() {
    return TUIi18n.getInstance().i18n.global.locale;
}
exports.useI18nLocale = useI18nLocale;
exports["default"] = TUIi18n;
