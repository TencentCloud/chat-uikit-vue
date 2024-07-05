import TUICore, { TUIConstants, ExtensionInfo } from '@tencentcloud/tui-core';
import {
  TUIStore,
  StoreName,
  TUIGroupService,
} from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import settingSVG from '../../assets/icon/setting.svg';
import { isUniFrameWork } from '../../utils/env';

export default class TUIGroupServer {
  static instance: TUIGroupServer;
  private onCallParamsMap: Map<string, any>;
  private onCallCallbackMap: Map<string, () => void>;
  public constants: typeof TUIConstants;
  constructor() {
    TUICore.registerService(TUIConstants.TUIGroup.SERVICE.NAME, this);
    TUICore.registerExtension(TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID, this);
    this.onCallParamsMap = new Map();
    this.onCallCallbackMap = new Map();
    this.constants = TUIConstants;
  }

  static getInstance(): TUIGroupServer {
    if (!TUIGroupServer.instance) {
      TUIGroupServer.instance = new TUIGroupServer();
    }
    return TUIGroupServer.instance;
  }

  public getOnCallParams(method: string): any {
    return this.onCallParamsMap.get(method);
  }

  public getOnCallCallback(method: string): (() => void) | undefined {
    return this.onCallCallbackMap.get(method);
  }

  public async onCall(method: string, params: any, callback: () => void): Promise<void> {
    this.onCallParamsMap.set(method, params);
    this.onCallCallbackMap.set(method, callback);
    switch (method) {
      case TUIConstants.TUIGroup.SERVICE.METHOD.CREATE_GROUP:
        TUIStore.update(StoreName.GRP, 'isShowCreateComponent', true);
        isUniFrameWork && TUIGlobal?.reLaunch({
          url: '/TUIKit/components/TUIGroup/index',
        });
        break;
      case TUIConstants.TUIGroup.SERVICE.METHOD.OPEN_GROUP_MANAGEMENT:
        TUIGroupService.switchGroup(params.groupID);
        TUIStore.update(StoreName.GRP, 'isShowManageComponent', true);
        isUniFrameWork && TUIGlobal?.navigateTo({
          url: '/TUIKit/components/TUIGroup/index',
        });
        break;
      case TUIConstants.TUIGroup.SERVICE.METHOD.SELECT_GROUP_MEMBER:
        TUIGroupService.switchGroup(params.groupID);
        TUIStore.update(StoreName.GRP, 'isShowSelectComponent', true);
        isUniFrameWork && TUIGlobal?.navigateTo({
          url: '/TUIKit/components/TUIGroup/index',
        });
        break;
    }
  }

  public onGetExtension(extensionID: string): ExtensionInfo[] {
    const list: ExtensionInfo[] = [];
    switch (extensionID) {
      case TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID:
        list.push({
          weight: 100,
          icon: settingSVG,
          text: '更多',
          data: {},
          listener: {
            onClicked: this.groupManage.bind(this),
          },
        });
        break;
    }
    return list;
  }

  private groupManage(params: any) {
    TUICore.callService({
      serviceName: TUIConstants.TUIGroup.SERVICE.NAME,
      method: TUIConstants.TUIGroup.SERVICE.METHOD.OPEN_GROUP_MANAGEMENT,
      params,
      callback: () => {
        isUniFrameWork && TUIGlobal?.navigateBack();
      },
    });
  }
}
