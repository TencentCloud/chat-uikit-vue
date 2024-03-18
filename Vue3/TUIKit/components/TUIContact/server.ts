import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import { TUIStore, StoreName } from '@tencentcloud/chat-uikit-engine';
import { TUIGlobal } from '@tencentcloud/universal-api';
import { isUniFrameWork } from '../../utils/env';

export default class TUIContactServer {
  static instance: TUIContactServer;
  private onCallParamsMap: Map<string, any>;
  private onCallCallbackMap: Map<string, () => void>;
  public constants: typeof TUIConstants;
  constructor() {
    TUICore.registerService(TUIConstants.TUIContact.SERVICE.NAME, this);
    this.onCallParamsMap = new Map();
    this.onCallCallbackMap = new Map();
    this.constants = TUIConstants;
  }

  static getInstance(): TUIContactServer {
    if (!TUIContactServer.instance) {
      TUIContactServer.instance = new TUIContactServer();
    }
    return TUIContactServer.instance;
  }

  public getOnCallParams(method: string): any {
    return this.onCallParamsMap.get(method);
  }

  public getOnCallCallback(method: string) {
    return this.onCallCallbackMap.get(method);
  }

  public async onCall(method: string, params: Record<string, any>, callback: () => void): Promise<void> {
    this.onCallParamsMap.set(method, params);
    this.onCallCallbackMap.set(method, callback);
    if (method === TUIConstants.TUIContact.SERVICE.METHOD.SELECT_FRIEND) {
      TUIStore.update(StoreName.CUSTOM, 'isShowSelectFriendComponent', true);
      isUniFrameWork && TUIGlobal?.reLaunch({
        url: '/TUIKit/components/TUIContact/index',
      });
    }
  }
}
