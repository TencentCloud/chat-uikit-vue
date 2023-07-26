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
var ITUIStore_1 = require("../interfaces/ITUIStore");
var TUIStore = /** @class */ (function (_super) {
    __extends(TUIStore, _super);
    function TUIStore() {
        var _this = _super.call(this) || this;
        _this.storeListener = {
            keys: [],
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            callback: function () { }
        };
        _this.store = {};
        var commonStore = {};
        _this.store.common = new Proxy(commonStore, {
            get: function (target, name) { return target[name]; },
            set: function (target, name, value) {
                var oldValue = {};
                Object.assign(oldValue, target);
                // eslint-disable-next-line no-param-reassign
                target[name] = value;
                if (target[name] !== oldValue[name] &&
                    _this.storeListener.keys.indexOf(name) >= 0) {
                    _this.storeListener.callback(target[name], oldValue[name]);
                }
                return target[name];
            }
        });
        return _this;
    }
    /**
     * 设置全局数据
     *
     * @param {any} store 设置全局的数据
     * @returns {proxy} 设置完成的数据
     */
    TUIStore.prototype.setCommonStore = function (store) {
        var _this = this;
        Object.keys(store).forEach(function (key) {
            if (key in _this.store.common) {
                return new Error(key + " \u5728\u516C\u5171\u6570\u636E\u5DF2\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u8BBE\u7F6E");
            }
            _this.store.common[key] = store[key];
        });
        return this.store;
    };
    /**
     * 挂载组件数据
     *
     * @param {string} TUIName 模块名
     * @param {any} store 挂载的数据
     * @param {callback} updateCallback 更新数据 callback
     * @returns {proxy} 挂载完成的模块数据
     */
    TUIStore.prototype.setComponentStore = function (TUIName, store, updateCallback) {
        if (TUIName in this.store) {
            return new Error(TUIName + " \u8BE5\u6570\u636E\u6A21\u5757\u5DF2\u5B58\u5728\uFF0C\u8BF7\u91CD\u65B0\u8BBE\u7F6E");
        }
        return (this.store[TUIName] = new Proxy(store, {
            get: function (target, name) { return target[name]; },
            set: function (target, name, value) {
                var oldValue = {};
                Object.assign(oldValue, target);
                // eslint-disable-next-line no-param-reassign
                target[name] = value;
                if (target[name] !== oldValue[name]) {
                    updateCallback && updateCallback(target, oldValue);
                }
                return target;
            }
        }));
    };
    /**
     * 监听全局数据
     *
     * @param {Array} keys 需要监听的数据key
     * @param {callback} callback 数据变化回调
     */
    TUIStore.prototype.storeCommonListener = function (keys, callback) {
        this.storeListener = {
            keys: keys,
            callback: callback
        };
    };
    return TUIStore;
}(ITUIStore_1["default"]));
exports["default"] = TUIStore;
