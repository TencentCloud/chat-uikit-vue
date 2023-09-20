import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import {
  TUIUserService,
  TUIGroupService,
  TUIFriendService,
} from "@tencentcloud/chat-uikit-engine";

export default class TUISearchServer {
  constructor() {
    TUICore.registerService(TUIConstants.TUISearch.SERVICE.NAME, this);
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

  public async searchFriend(userID: string): Promise<any> {
    return TUIFriendService.getFriendProfile({ userIDList: [userID] });
  }

  public async searchUser(userID: string): Promise<any> {
    return TUIUserService.getUserProfile({ userIDList: [userID] });
  }

  public async searchGroup(groupID: string): Promise<any> {
    return TUIGroupService.searchGroupByID(groupID);
  }

  public async searchGroupMember(
    groupID: string,
    userID: string
  ): Promise<any> {
    return TUIGroupService.getGroupMemberProfile({
      groupID,
      userIDList: [userID],
    });
  }
}
