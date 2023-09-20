import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import {
  TUIStore,
  StoreName,
  TUIGlobal,
} from "@tencentcloud/chat-uikit-engine";
import { isUniFrameWork } from "../../utils/is-uni";

export default class TUIContactServer {
  static instance: TUIContactServer;
  private onCallParamsMap: Map<String, any>;
  private onCallCallbackMap: Map<String, Function>;
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

  public getOnCallParams(method: String): any {
    return this.onCallParamsMap.get(method);
  }

  public getOnCallCallback(method: String): Function | undefined {
    return this.onCallCallbackMap.get(method);
  }

  public async onCall(method: String, params: Object, callback: Function): Promise<void> {
    this.onCallParamsMap.set(method, params);
    this.onCallCallbackMap.set(method, callback);
    if (method === TUIConstants.TUIContact.SERVICE.METHOD.SELECT_FRIEND) {
      TUIStore.update(StoreName.CUSTOM, "isShowSelectFriendComponent", true);
      isUniFrameWork && TUIGlobal?.global?.reLaunch({
        url: "/TUIKit/components/TUIContact/index",
      });
    }
  }
}
