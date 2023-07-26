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
exports.__esModule = true;
var TUIPlugin_1 = require("../../TUIPlugin");
var tim_1 = require("../tim");
var tim_upload_plugin_1 = require("tim-upload-plugin");
var tim_profanity_filter_plugin_1 = require("tim-profanity-filter-plugin");
var ITUIServer_1 = require("../interfaces/ITUIServer");
var store_1 = require("../store");
var utils_1 = require("../utils");
var TUICore = /** @class */ (function (_super) {
    __extends(TUICore, _super);
    function TUICore(params) {
        var _this = _super.call(this) || this;
        _this.isOfficial = false;
        _this.isIntl = false;
        _this.isSDKReady = false;
        _this.installedPlugins = new Set();
        _this.config = {};
        _this.TUIComponents = new Set();
        _this.loginResolveRejectCache = [];
        _this.SDKAppID = params.SDKAppID;
        _this.TUIServer = {};
        _this.store = new store_1["default"]();
        _this.TIM = tim_1["default"];
        window.TIM = tim_1["default"];
        if (!params.tim) {
            window.TUIKit = tim_1["default"].create({ SDKAppID: _this.SDKAppID });
        }
        else {
            window.TUIKit = params.tim;
        }
        _this.tim = window.TUIKit;
        // 注册 COS SDK 插件
        _this.tim.registerPlugin({ 'tim-upload-plugin': tim_upload_plugin_1["default"] });
        _this.tim.registerPlugin({ 'tim-profanity-filter-plugin': tim_profanity_filter_plugin_1["default"] });
        _this.bindTIMEvent();
        _this.TUIEnv = TUIPlugin_1.TUIEnv();
        _this.isOfficial = _this.SDKAppID === 1400187352 || _this.SDKAppID === 1400188366;
        return _this;
    }
    /**
     * 初始化TUICore
     *
     * @param {TUICoreParams} options 初始化参数
     * @returns {TUICore} TUICore的实例
     */
    TUICore.init = function (options) {
        if (!TUICore.instance) {
            TUICore.instance = new TUICore(options);
        }
        var isH5 = TUIPlugin_1.TUIEnv().isH5;
        window.TUIKitTUICore = TUICore.instance;
        TUICore.instance.use(TUIPlugin_1.TUITheme);
        TUICore.instance.use(TUIPlugin_1.TUIi18n);
        return TUICore.instance;
    };
    /**
     * TUICore 挂载vue方法
     *
     * @param {Vue} app vue createApp实例
     */
    TUICore.prototype.install = function (app) {
        app.config.globalProperties.$TUIKit = this.getInstance();
        var flag = true;
        this.installedPlugins.forEach(function (element) {
            app.use(element);
            if (element.name === 'TUIComponents') {
                flag = false;
            }
        });
        flag &&
            this.TUIComponents.forEach(function (element) {
                app.component(element.name, element.component);
            });
        TUIPlugin_1.TUIDirective(app);
    };
    /**
     * 获取TUICore实例
     *
     * @returns {TUICore} TUICore的实例
     */
    TUICore.prototype.getInstance = function () {
        return TUICore.instance;
    };
    /**
     * TUICore 登录
     *
     * @param {TUICoreLoginParams} options 登录参数
     * @param {string} options.userID 当前用户名
     * @param {string} options.userSig 当前用户名签名
     * @returns {Promise}
     */
    TUICore.prototype.login = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.tim
                .login(options)
                .then(function () {
                var _a, _b, _c;
                _this.loginResolveRejectCache.push({
                    resolve: resolve,
                    reject: reject
                });
                TUICore.isLogin = true;
                window._isTIMCallKit = true;
                (_c = (_b = (_a = TUICore === null || TUICore === void 0 ? void 0 : TUICore.instance) === null || _a === void 0 ? void 0 : _a.TUIServer) === null || _b === void 0 ? void 0 : _b.TUICallKit) === null || _c === void 0 ? void 0 : _c.init({
                    SDKAppID: _this.SDKAppID,
                    userID: options.userID,
                    userSig: options.userSig,
                    tim: _this.tim
                });
                return null;
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    /**
     * TUICore 退出登录
     *
     * @returns {Promise}
     */
    TUICore.prototype.logout = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.tim
                .logout()
                .then(function (imResponse) {
                _this.isSDKReady = false;
                TUICore.isLogin = false;
                resolve(imResponse);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    /**
     * /////////////////////////////////////////////////////////////////////////////////
     * //
     * //                                    TIM 事件监听注册接口
     * //
     * /////////////////////////////////////////////////////////////////////////////////
     */
    TUICore.prototype.bindTIMEvent = function () {
        this.tim.on(tim_1["default"].EVENT.SDK_READY, this.handleSDKReady, this);
        // this.tim.on(TIM.EVENT.SDK_NOT_READY,)
        // this.tim.on(TIM.EVENT.KICKED_OUT,)
        // this.tim.on(TIM.EVENT.ERROR, )
        // this.tim.on(TIM.EVENT.NET_STATE_CHANGE, )
        // this.tim.on(TIM.EVENT.SDK_RELOAD, )
    };
    TUICore.prototype.unbindTIMEvent = function () {
        this.tim.off(tim_1["default"].EVENT.SDK_READY, this.handleSDKReady);
        // this.tim.off(TIM.EVENT.SDK_NOT_READY, )
        // this.tim.off(TIM.EVENT.KICKED_OUT,)
        // this.tim.off(TIM.EVENT.ERROR, )
        // this.tim.off(TIM.EVENT.NET_STATE_CHANGE, )
        // this.tim.off(TIM.EVENT.SDK_RELOAD, )
    };
    /**
     * SDK ready 回调函数
     */
    TUICore.prototype.handleSDKReady = function () {
        this.isSDKReady = true;
        this.handelAwaitFunc(TUICore.TUIServerFunMap);
        this.loginResolveRejectCache.forEach(function (_a) {
            var resolve = _a.resolve;
            resolve({
                msg: '登录成功，且SDK Ready'
            });
        });
    };
    /**
     * 处理等待函数
     *
     * @param {Map} awaitFunList 等待调用的函数
     * @returns {Map} 执行完的数据
     */
    TUICore.prototype.handelAwaitFunc = function (awaitFunList) {
        var keys = Object.keys(this.TUIServer);
        for (var i = 0; i < keys.length; i++) {
            var TUIServerFunList = (awaitFunList === null || awaitFunList === void 0 ? void 0 : awaitFunList.get(keys[i])) || [];
            TUIServerFunList.length > 0 && TUIServerFunList.map(function (callback) { return callback(); });
            awaitFunList === null || awaitFunList === void 0 ? void 0 : awaitFunList["delete"](keys[i]);
        }
        return awaitFunList;
    };
    /**
     * TUICore 销毁
     */
    TUICore.prototype.destroyed = function () {
        this.unbindTIMEvent();
        this.isSDKReady = false;
    };
    /**
     * 组件挂载
     *
     * @param {string} TUIName  挂载的组件名
     * @param {any} TUIComponent 挂载的组件
     * @returns {TUICore} 挂载后的实例
     */
    TUICore.prototype.component = function (TUIName, TUIComponent) {
        var TUICore = this.getInstance();
        if (!this.TUIServer) {
            this.TUIServer = {};
        }
        // const Server = TUIComponent.server;
        this.TUIServer[TUIName] = TUIComponent.server;
        if (this.TUIComponents.has(TUIComponent)) {
            console.warn(TUIName + " component has already been applied to target TUICore.");
        }
        else {
            this.TUIComponents.add(TUIComponent);
        }
        return TUICore;
    };
    /**
     * 插件注入
     *
     * @param {any} TUIPlugin 需要挂载模块的服务
     * @param {any} options 其他参数
     * @returns {TUICore} 挂载后的实例
     */
    TUICore.prototype.use = function (TUIPlugin, options) {
        var TUICore = this.getInstance();
        if (this.installedPlugins.has(TUIPlugin)) {
            console.warn('Plugin has already been applied to target TUICore.');
        }
        else if (TUIPlugin && utils_1.isFunction(TUIPlugin === null || TUIPlugin === void 0 ? void 0 : TUIPlugin.plugin)) {
            this.installedPlugins.add(TUIPlugin);
            TUIPlugin === null || TUIPlugin === void 0 ? void 0 : TUIPlugin.plugin(TUICore, options);
        }
        else if (utils_1.isFunction(TUIPlugin)) {
            this.installedPlugins.add(TUIPlugin);
            TUIPlugin(TUICore, options);
        }
        else {
            console.warn('A plugin must either be a function or an object with an "plugin" ' + 'function.');
        }
        return TUICore;
    };
    TUICore.prototype.usePlugin = function (TUIPluginName) {
        var plugin = {};
        this.installedPlugins.forEach(function (element) {
            if (element.name === TUIPluginName) {
                plugin = element;
            }
        });
        return plugin;
    };
    /**
     * 方法调用
     *
     * @param {string} TUIName 组件名
     * @param {callback} callback 调用的方法
     */
    TUICore.prototype.setAwaitFunc = function (TUIName, callback) {
        if (this.isSDKReady) {
            callback();
        }
        else {
            if (!TUICore.TUIServerFunMap) {
                TUICore.TUIServerFunMap = new Map();
            }
            var TUIServerFunList = TUICore.TUIServerFunMap.get(TUIName) || [];
            TUIServerFunList.push(callback);
            TUICore.TUIServerFunMap.set(TUIName, TUIServerFunList);
        }
    };
    /**
     * 设置公共数据
     *
     * @param {object} store 设置全局的数据
     * @returns {proxy} 设置完成的数据
     */
    TUICore.prototype.setCommonStore = function (store) {
        return this.store.setCommonStore(store);
    };
    /**
     * 挂载组件数据
     *
     * @param {string} TUIName 模块名
     * @param {any} store  挂载的数据
     * @param {callback} updateCallback 更新数据 callback
     * @returns {proxy} 挂载完成的模块数据
     */
    TUICore.prototype.setComponentStore = function (TUIName, store, updateCallback) {
        return this.store.setComponentStore(TUIName, store, updateCallback);
    };
    /**
     * 获取 store 数据库
     *
     * @returns {any} store 数据库
     */
    TUICore.prototype.getStore = function () {
        return this.store.store;
    };
    /**
     * 监听全局数据
     *
     * @param {Array} keys 需要监听的数据key
     * @param {callback} callback 数据变化回调
     * @returns {addStoreUpdate}
     */
    TUICore.prototype.storeCommonListener = function (keys, callback) {
        return this.store.storeCommonListener(keys, callback);
    };
    TUICore.isLogin = false;
    return TUICore;
}(ITUIServer_1["default"]));
exports["default"] = TUICore;
