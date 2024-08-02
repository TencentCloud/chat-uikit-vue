import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import {
  TUIUserService,
  TUIGroupService,
  TUIFriendService,
  TUIStore,
  StoreName,
} from '@tencentcloud/chat-uikit-engine';
import { isUniFrameWork } from '../../utils/env';
import { TUIGlobal } from '@tencentcloud/universal-api';

export default class TUISearchServer {
  constructor() {
    TUICore.registerService(TUIConstants.TUISearch.SERVICE.NAME, this);
    TUICore.registerExtension(TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID, this);
  }

  public onCall(method: string, params: { [propsName: string]: string }) {
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

  public onGetExtension(extensionID: string) {
    if (extensionID === TUIConstants.TUIChat.EXTENSION.INPUT_MORE.EXT_ID) {
      const list: any[] = [];
      const searchExtension = {
        weight: 3000,
        text: '搜索',
        icon: 'https://web.sdk.qcloud.com/component/TUIKit/assets/message-search.svg',
        data: {
          name: 'search',
        },
        listener: {
          onClicked: () => {
            TUIStore.update(StoreName.SEARCH, 'isShowInConversationSearch', true);
            isUniFrameWork && TUIGlobal?.navigateTo({
              url: '/TUIKit/components/TUISearch/index',
            });
          },
        },
      };
      list.push(searchExtension);
      return list;
    }
  }

  public async searchFriend(userID: string) {
    return TUIFriendService.getFriendProfile({ userIDList: [userID] });
  }

  public async searchUser(userID: string) {
    return TUIUserService.getUserProfile({ userIDList: [userID] });
  }

  public async searchGroup(groupID: string) {
    return TUIGroupService.searchGroupByID(groupID);
  }

  public async searchGroupMember(groupID: string, userID: string) {
    return TUIGroupService.getGroupMemberProfile({
      groupID,
      userIDList: [userID],
    });
  }
}
