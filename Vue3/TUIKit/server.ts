import TUICore, { TUILogin, TUIConstants } from "@tencentcloud/tui-core";
import TUIChatEngine, { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import { ITUIComponents, ITUIPlugins } from "./interface";
import TUILocales from "./locales";
import { isFunction, isObject } from "./utils";
import { isApp } from "./utils/env";
import { TUIGlobal } from "./utils/universal-api/index";
import CallkitPluginServer from "./plugins/extension-server/callkit";
export default class TUIChatKit {
  public chat: any;

  public SDKAppID: number;
  public TUICore: any;
  public TUIChatEngine: any;
  public TUIGlobal: any;
  public TUIComponents: ITUIComponents = {};
  public TUIPlugins: ITUIPlugins = {};

  constructor() {
    this.TUICore = TUICore;
    this.TUIChatEngine = TUIChatEngine;
    this.TUIGlobal = TUIGlobal;
    this.SDKAppID = 0;
    this.TUIGlobal._isTIMCallKit = true;
    TUICore.registerEvent(
      TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED,
      TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS,
      this
    );
  }

  /**
   * 监听 TUILogin.login 的成功通知
   * @param { TUIInitParam } params 初始化参数
   */
  private onNotifyEvent(eventName: string, subKey: string) {
    if (eventName === TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED) {
      switch (subKey) {
        case TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS:
          this.login();
          break;
      }
    }
  }

  /**
   * init 初始化
   */
  public init() {
    // 原生插件 TUICallKit 存在时执行 call server
    if(isApp) {
      new CallkitPluginServer();
    }
    // TUITranslateService init
    TUITranslateService.provideLanguages({ ...TUILocales });
    TUITranslateService.useI18n();
    // TUIComponents global install
    TUIGlobal.TUIComponents = this.TUIComponents;
    // TUIPlugins global install
    TUIGlobal.TUIPlugins = this.TUIPlugins;
    console.warn("[TUIChatKit]: init success.");
  }

  /**
   * login 登录
   */
  public login() {
    const { chat, SDKAppID, userID, userSig } = TUILogin.getContext();
    this.SDKAppID = SDKAppID;
    this.TUIChatEngine.login({
      chat,
      SDKAppID,
      userID,
      userSig,
    });
    this.chat = chat;
    return this.TUIChatEngine;
  }

  /**
   * 单个组件挂载
   *
   * @param {string} componentName  挂载的组件名
   * @param {any} component 挂载的组件
   * @param {any=} env Vue2/Vue3环境
   * @returns {TUICore} 挂载后的实例
   */
  public component(componentName: string, component: any, env?: any) {
    if (this?.TUIComponents?.componentName) {
      console.warn(
        `[TUIChatKit]: ${this?.TUIComponents?.componentName} component has already been applied to target TUIChatEngine.`
      );
    } else {
      this.TUIComponents[componentName] = component;
      env?.component(componentName, component);
    }
    if (env) {
      !TUIGlobal.Vue && (TUIGlobal.Vue = env);
    }
    return this.TUIChatEngine;
  }

  /**
   * 组件列表挂载
   *
   * @param {object} components 挂载的组件列表
   * @param {any=} env Vue2/Vue3环境
   * @returns {TUICore} 挂载后的实例
   */
  public components(components: object, env?: any) {
    if (!components || !isObject(components)) {
      console.warn("[TUIChatKit]: components is empty or not object.");
    } else {
      Object?.keys(components)?.forEach((key: string) => {
        this.component(key, components[key as keyof typeof components], env);
      });
    }
    return this.TUIChatEngine;
  }

  /**
   * 插件注入
   *
   * @param {any} TUIPlugin 需要挂载模块的服务
   * @param {any} options 其他参数
   * @returns {TUICore} 挂载后的实例
   */
  public use(TUIPluginName: string, TUIPlugin: any, options?: any) {
    if (!this.TUICore) {
      console.warn(
        `[TUIChatKit]: Plugin ${this.TUIPlugins[TUIPluginName]} can't be used before init.`
      );
      return;
    }
    if (this.TUIPlugins[TUIPluginName]) {
      console.warn(
        `[TUIChatKit]: Plugin ${this.TUIPlugins[TUIPluginName]} has already been applied to target TUIChatEngine.`
      );
    } else if (TUIPlugin && isFunction(TUIPlugin?.plugin)) {
      this.TUIPlugins[TUIPluginName] = TUIPlugin;
      TUIPlugin?.plugin(this, options);
    } else if (isFunction(TUIPlugin)) {
      this.TUIPlugins[TUIPluginName] = TUIPlugin;
      TUIPlugin(this, options);
    } else {
      console.warn(
        '[TUIChatKit]: A plugin must either be a function or an object with an "plugin" ' +
        "function." +
        this.TUIPlugins[TUIPluginName] +
        "does not comply with the above rules."
      );
    }
    return this.TUIChatEngine;
  }
}
