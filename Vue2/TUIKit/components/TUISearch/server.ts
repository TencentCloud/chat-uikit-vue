import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import {
  TUIUserService,
  TUIGroupService,
  TUIFriendService,
  TUIStore,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";
import { isUniFrameWork } from "../../utils/env";

export default class TUISearchServer {
  constructor() {
    TUICore.registerService(TUIConstants.TUISearch.SERVICE.NAME, this);
    TUICore.registerExtension(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID, this);
  }

  public onCall(method: string, params: { [propsName: string]: any }) {
    switch (method) {
      case TUIConstants.TUISearch.SERVICE.METHOD.SEARCH_GROUP:
        return this.searchGroup(params?.groupID);
      case TUIConstants.TUISearch.SERVICE.METHOD.SEARCH_USER:
        return this.searchUser(params?.userID);
      case TUIConstants.TUISearch.SERVICE.METHOD.SEARCH_FRIEND:
        return this.searchFriend(params?.userID);
      case TUIConstants.TUISearch.SERVICE.METHOD.SEARCH_GROUP_MEMBER:
        return this.searchGroupMember(params?.groupID, params?.userID);
    }
  }

  public onGetExtension(extensionID: string, params: Object) {
    if (extensionID === TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID) {
      if (isUniFrameWork) {
        // uniapp 暂不支持搜索功能
        return [];
      }
      const searchExtension = {
        weight: 3000,
        text: "搜索",
        icon: "https://web.sdk.qcloud.com/component/TUIKit/assets/message-search.svg",
        data: {
          name: "search",
        },
        listener: {
          onClicked: (options: any) => {
            TUIStore.update(StoreName.CUSTOM, "isShowInConversationSearch", true);
          },
        },
      };
      return [searchExtension];
    }
  }

  public async searchFriend(userID: string): Promise<any> {
    return TUIFriendService.getFriendProfile({ userIDList: [userID] });
  }

  public async searchUser(userID: string): Promise<any> {
    return TUIUserService.getUserProfile({ userIDList: [userID] });
  }

  public async searchGroup(groupID: string): Promise<any> {
    return TUIGroupService.searchGroupByID(groupID);
  }

  public async searchGroupMember(groupID: string, userID: string): Promise<any> {
    return TUIGroupService.getGroupMemberProfile({
      groupID,
      userIDList: [userID],
    });
  }
}
