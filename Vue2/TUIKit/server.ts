import TUICore, { TUILogin, TUIConstants } from '@tencentcloud/tui-core';
import TUIChatEngine, { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { ITUIComponents, ITUIPlugins } from './interface';
import { isFunction, isObject } from './utils';
import { isApp } from './utils/env';
import CallkitPluginServer from './plugins/extension-server/callkit';
// #ifndef MP-WEIXIN
import TUILocales from './locales';
// #endif
export default class TUIChatKit {
  static isInitialized: boolean;
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
    TUICore.registerEvent(TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED, TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS, this);
    TUICore.registerEvent(TUIConstants.TUITranslate.EVENT.LANGUAGE_CHANGED, TUIConstants.TUITranslate.EVENT_SUB_KEY.CHANGE_SUCCESS, this);
    // register translate and voiceToText service event tracking
    TUICore.registerService(TUIConstants.TUITranslatePlugin.SERVICE.NAME, 1);
    TUICore.registerService(TUIConstants.TUIVoiceToTextPlugin.SERVICE.NAME, 1);
  }

  /**
   * Listen for the success notification of TUILogin.login
   */
  public onNotifyEvent(eventName: string, subKey: string, params?: Record<string, any>) {
    if (eventName === TUIConstants.TUILogin.EVENT.LOGIN_STATE_CHANGED) {
      switch (subKey) {
        case TUIConstants.TUILogin.EVENT_SUB_KEY.USER_LOGIN_SUCCESS:
          this.login();
          break;
      }
    }
    if (eventName === TUIConstants.TUITranslate.EVENT.LANGUAGE_CHANGED) {
      switch (subKey) {
        case TUIConstants.TUITranslate.EVENT_SUB_KEY.CHANGE_SUCCESS:
          if (params?.language) {
            TUITranslateService.changeLanguage(params.language);
          }
          break;
      }
    }
  }

  /**
   * init
   */
  public init() {
    // Backward compatibility, the new version executes the init operation by default in index.ts
    if (TUIChatKit.isInitialized) {
      return;
    }
    TUIChatKit.isInitialized = true;
    // Execute call server when native plugin TUICallKit exists
    if (isApp) {
      new CallkitPluginServer();
    }
    // TUITranslateService init
    // #ifndef MP-WEIXIN
    TUITranslateService.provideLanguages({ ...TUILocales });
    TUITranslateService.useI18n();
    // #endif
    // TUIComponents global install
    TUIGlobal.TUIComponents = this.TUIComponents;
    // TUIPlugins global install
    TUIGlobal.TUIPlugins = this.TUIPlugins;
    console.warn('[TUIChatKit]: init success.');
  }

  /**
   * login
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
   * Single component mounting
   *
   * @param {string} componentName
   * @param {any} component
   * @param {any=} env
   * @returns {TUICore} mounted instance
   */
  public component(componentName: string, component: any, env?: any) {
    if (this?.TUIComponents?.componentName) {
      console.warn(
        `[TUIChatKit]: ${this?.TUIComponents?.componentName} component has already been applied to target TUIChatEngine.`,
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
   * Component list mount
   *
   * @param {object} components
   * @param {any=} env: Vue2/Vue3 environment
   * @returns {TUICore} mounted instance
   */
  public components(components: object, env?: any) {
    if (!components || !isObject(components)) {
      console.warn('[TUIChatKit]: components is empty or not object.');
    } else {
      Object?.keys(components)?.forEach((key: string) => {
        this.component(key, components[key as keyof typeof components], env);
      });
    }
    return this.TUIChatEngine;
  }

  /**
   * Plugin Injection
   *
   * @param {any} TUIPlugin
   * @param {any} options
   * @returns {TUICore} mounted instance
   */
  public use(TUIPluginName: string, TUIPlugin: any, options?: any) {
    if (!this.TUICore) {
      console.warn(
        `[TUIChatKit]: Plugin ${this.TUIPlugins[TUIPluginName]} can't be used before init.`,
      );
      return;
    }
    if (this.TUIPlugins[TUIPluginName]) {
      console.warn(
        `[TUIChatKit]: Plugin ${this.TUIPlugins[TUIPluginName]} has already been applied to target TUIChatEngine.`,
      );
    } else if (TUIPlugin && isFunction(TUIPlugin?.plugin)) {
      this.TUIPlugins[TUIPluginName] = TUIPlugin;
      TUIPlugin?.plugin(this, options);
    } else if (isFunction(TUIPlugin)) {
      this.TUIPlugins[TUIPluginName] = TUIPlugin;
      TUIPlugin(this, options);
    } else {
      console.warn(
        '[TUIChatKit]: A plugin must either be a function or an object with an "plugin" '
        + 'function.'
        + this.TUIPlugins[TUIPluginName]
        + 'does not comply with the above rules.',
      );
    }
    return this.TUIChatEngine;
  }
}
