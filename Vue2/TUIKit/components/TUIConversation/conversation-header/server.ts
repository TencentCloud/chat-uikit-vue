import TUICore, { TUIConstants } from "@tencentcloud/tui-core";
import { TUITranslateService } from "@tencentcloud/chat-uikit-engine";
import { isPC } from "../../../utils/env";
import createGroup from "../../../assets/icon/start-group.svg";
import C2C from "../../../assets/icon/icon-c2c.svg";
import { CONV_CREATE_TYPE } from "../../../constant";

export interface IMenuItem {
  icon?: string,
  text: string;
  data: {
    name: string,
    children?: Array<IMenuItem>,
  },
  listener?: {
    onClicked: Function,
  }
}

export default class ConversationHeaderServer {
  static instance: ConversationHeaderServer;

  static getInstance(): ConversationHeaderServer {
    if (!ConversationHeaderServer.instance) {
      ConversationHeaderServer.instance = new ConversationHeaderServer();
    }
    return ConversationHeaderServer.instance;
  }

  public getMenu(): Array<IMenuItem> {
    const list = this.generateMenuList();
    if (!isPC && list.length > 0) {
      return [{
        text: TUITranslateService.t('TUIConversation.发起会话'),
        data: {
          name: 'all',
          children: list,
        },
      }]
    }
    return list;
  }

  private generateMenuList(): Array<IMenuItem> {
    const list = [
      {
        icon: C2C,
        text: TUITranslateService.t('TUIConversation.发起单聊'),
        data: {
          name: CONV_CREATE_TYPE.TYPEC2C,
        },
        listener: {
          onClicked: this.createConversation.bind(this),
        }
      },
      {
        icon: createGroup,
        text: TUITranslateService.t('TUIConversation.发起群聊'),
        data: {
          name: CONV_CREATE_TYPE.TYPEGROUP,
        },
        listener: {
          onClicked: this.createConversation.bind(this),
        }
      }
    ];
    return list;
  }

  private createConversation(item: IMenuItem) {
    // 创建会话，通过 TUICore.callService 通知 conversationServer
    TUICore.callService({
      serviceName: TUIConstants.TUIConversation.SERVICE.NAME,
      method: TUIConstants.TUIConversation.SERVICE.METHOD.CREATE_CONVERSATION,
      params: item,
    })
  }
}
