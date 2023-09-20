import TUICore, { TUIConstants, ExtensionInfo } from "@tencentcloud/tui-core";
import {
  TUIStore,
  StoreName,
  TUIGlobal,
  TUIGroupService,
} from "@tencentcloud/chat-uikit-engine";
import settingSVG from "../../assets/icon/setting.svg";
import { isUniFrameWork } from "../../utils/is-uni";

export default class TUIGroupServer {
  static instance: TUIGroupServer;
  private onCallParamsMap: Map<String, any>;
  private onCallCallbackMap: Map<String, Function>;
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

  public getOnCallParams(method: String): any {
    return this.onCallParamsMap.get(method);
  }

  public getOnCallCallback(method: String): Function | undefined {
    return this.onCallCallbackMap.get(method);
  }

  public async onCall(method: String, params: any, callback: Function): Promise<void> {
    this.onCallParamsMap.set(method, params);
    this.onCallCallbackMap.set(method, callback);
    switch (method) {
      case TUIConstants.TUIGroup.SERVICE.METHOD.CREATE_GROUP:
        TUIStore.update(StoreName.GRP, "isShowCreateComponent", true);
        isUniFrameWork && TUIGlobal?.global?.reLaunch({
          url: "/TUIKit/components/TUIGroup/index",
        });
        break;
      case TUIConstants.TUIGroup.SERVICE.METHOD.OPEN_GROUP_MANAGEMENT:
        TUIGroupService.switchGroup(params.groupID);
        TUIStore.update(StoreName.GRP, "isShowManageComponent", true);
        isUniFrameWork && TUIGlobal?.global?.navigateTo({
          url: "/TUIKit/components/TUIGroup/index",
        });
        break;
      case TUIConstants.TUIGroup.SERVICE.METHOD.SELECT_GROUP_MEMBER:
        TUIGroupService.switchGroup(params.groupID);
        TUIStore.update(StoreName.GRP, "isShowSelectComponent", true);
        isUniFrameWork && TUIGlobal?.global?.navigateTo({
          url: "/TUIKit/components/TUIGroup/index",
        });
        break;      
    }
  }

  public onGetExtension(extensionID: string, params: any): Array<typeof ExtensionInfo> {
    let list: Array<typeof ExtensionInfo> = [];
    switch (extensionID) {
      case TUIConstants.TUIChat.EXTENSION.CHAT_HEADER.EXT_ID:
        if (params?.filterManageGroup) {
          list.push({
            icon: settingSVG,
            text: '更多',
            listener: {
              onClicked: this.groupManage.bind(this),
            }
          })
        }
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
        isUniFrameWork && TUIGlobal?.global?.navigateBack();
      }
    })
  }
}
