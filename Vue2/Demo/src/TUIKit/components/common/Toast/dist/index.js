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
exports.TOAST_TYPE = exports.Toast = exports.close = void 0;
var adapter_vue_1 = require("../../../adapter-vue");
var type_1 = require("./type");
exports.TOAST_TYPE = type_1["default"];
var chat_uikit_engine_1 = require("@tencentcloud/chat-uikit-engine");
var index_vue_1 = require("./index.vue");
var instances = [];
var seed = 1;
var appendTo = document.body;
var Toast = function (options) {
    var verticalOffset = options.offset || 20;
    instances.forEach(function (_a) {
        var _b, _c;
        var vm = _a.vm;
        verticalOffset += (((_b = vm === null || vm === void 0 ? void 0 : vm.el) === null || _b === void 0 ? void 0 : _b.offsetHeight) || ((_c = vm === null || vm === void 0 ? void 0 : vm.$el) === null || _c === void 0 ? void 0 : _c.offsetHeight) || 0) + 20;
    });
    verticalOffset += 20;
    var id = "message_" + (seed += 1);
    var userOnClose = options.onClose;
    var props = __assign(__assign({ zIndex: 20 + seed, offset: verticalOffset, id: id }, options), { onClose: function () {
            Toast.close(id, userOnClose);
        } });
    var vm;
    var container;
    switch (adapter_vue_1.vueVersion) {
        case 2:
            var Vue = chat_uikit_engine_1.TUIGlobal === null || chat_uikit_engine_1.TUIGlobal === void 0 ? void 0 : chat_uikit_engine_1.TUIGlobal.Vue;
            if (!Vue) {
                return;
            }
            var Constructor = Vue.extend(index_vue_1["default"]);
            var instance_1 = new Constructor({ propsData: props });
            instance_1.$mount();
            appendTo.appendChild(instance_1.$el);
            instance_1.$el.style.zIndex = props.zIndex;
            instance_1.verticalOffset = props.verticalOffset;
            instance_1.visible = true;
            instances.push({ vm: instance_1 });
            return {
                close: function () { return (instance_1.visible = false); }
            };
        case 3:
            vm = adapter_vue_1.createVNode(index_vue_1["default"], props);
            container = document.createElement("div");
            (vm === null || vm === void 0 ? void 0 : vm.props) &&
                (vm.props.onDestroy = function () {
                    adapter_vue_1.render(null, container);
                });
            (vm === null || vm === void 0 ? void 0 : vm.data) &&
                (vm.data.onDestroy = function () {
                    adapter_vue_1.render(null, container);
                });
            adapter_vue_1.render(vm, container);
            instances.push({ vm: vm });
            appendTo.appendChild(container.firstElementChild);
            return {
                close: function () {
                    var _a;
                    ((_a = vm === null || vm === void 0 ? void 0 : vm.component) === null || _a === void 0 ? void 0 : _a.proxy) && (vm.component.proxy.visible = false);
                }
            };
    }
};
exports.Toast = Toast;
function close(id, userOnClose) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var idx = instances === null || instances === void 0 ? void 0 : instances.findIndex(function (_a) {
        var _b, _c, _d;
        var vm = _a.vm;
        return id === ((_c = (_b = vm === null || vm === void 0 ? void 0 : vm.component) === null || _b === void 0 ? void 0 : _b.props) === null || _c === void 0 ? void 0 : _c.id) || id === ((_d = vm === null || vm === void 0 ? void 0 : vm._props) === null || _d === void 0 ? void 0 : _d.id);
    });
    if (idx === -1)
        return;
    var vm = instances[idx].vm;
    if (!vm)
        return;
    userOnClose === null || userOnClose === void 0 ? void 0 : userOnClose(vm);
    var removedHeight = ((_a = vm === null || vm === void 0 ? void 0 : vm.el) === null || _a === void 0 ? void 0 : _a.offsetHeight) || ((_b = vm === null || vm === void 0 ? void 0 : vm.$el) === null || _b === void 0 ? void 0 : _b.offsetHeight);
    instances.splice(idx, 1);
    // adjust other instances vertical offset
    var len = instances.length;
    if (len < 1)
        return;
    for (var i = idx; i < len; i++) {
        var pos = Number.parseInt((((_f = (_e = (_d = (_c = instances[i]) === null || _c === void 0 ? void 0 : _c.vm) === null || _d === void 0 ? void 0 : _d.el) === null || _e === void 0 ? void 0 : _e.style) === null || _f === void 0 ? void 0 : _f.top) || ((_k = (_j = (_h = (_g = instances[i]) === null || _g === void 0 ? void 0 : _g.vm) === null || _h === void 0 ? void 0 : _h.$el) === null || _j === void 0 ? void 0 : _j.style) === null || _k === void 0 ? void 0 : _k.top)), 10) - removedHeight - 16;
        ((_p = (_o = (_m = (_l = instances[i]) === null || _l === void 0 ? void 0 : _l.vm) === null || _m === void 0 ? void 0 : _m.component) === null || _o === void 0 ? void 0 : _o.props) === null || _p === void 0 ? void 0 : _p.offset) && (instances[i].vm.component.props.offset = pos);
        ((_s = (_r = (_q = instances[i]) === null || _q === void 0 ? void 0 : _q.vm) === null || _r === void 0 ? void 0 : _r._props) === null || _s === void 0 ? void 0 : _s.offset) && (instances[i].vm._props.offset = pos);
    }
}
exports.close = close;
Toast.close = close;
