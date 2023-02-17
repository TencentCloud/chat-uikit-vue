import { isTypingMessage } from "@tencentcloud/chat-uikit-vue/TUIComponents/container/TUIChat/utils/utils";
import TIM from "tim-js-sdk/tim-js-friendship";

class TUINotification {
  public allowNotifications = true;
  public showPreviews = true;
  public notificationTitle = '腾讯云 IM ';
  public notificationIcon = 'https://web.sdk.qcloud.com/im/demo/latest/faviconnew.png';

  static TUICore: any;
  static instance: TUINotification;

  constructor(params?: {
    allowNotifications?: boolean,
    showPreviews?: boolean
    notificationTitle?: string,
    notificationIcon?: string,
  }) {
    if (!params) return;
    (params?.allowNotifications !== undefined) && (this.allowNotifications = params.allowNotifications);
    (params?.showPreviews !== undefined) && (this.showPreviews = params.showPreviews);
    (params?.notificationTitle !== undefined) && (this.notificationTitle = params.notificationTitle);
    (params?.notificationIcon !== undefined) && (this.notificationIcon = params.notificationIcon);
  }

  /**
 * 获取 TUINotification 实例
 *
 * @returns {TUINotification}
 */
  static getInstance(options?: any): TUINotification {
    if (!TUINotification.instance) {
      TUINotification.instance = new TUINotification(options);
    }
    return TUINotification.instance;
  }

  /**
 * 挂载到 TUICore
 *
 * @param {TUICore} TUICore TUICore实例
 */
  static plugin(TUICore: any, options?: any): void {
    TUICore.config.notification = this.getInstance(options);
    this.TUICore = TUICore;
  }

  /**
 * 挂载到 vue 实例的上
 *
 * @param {app} app vue的实例
 */
  static install(app: any): void {
    app.use(this.getInstance());
  }

  public setNotificationConfiguration(params?: {
    allowNotifications?: boolean,
    showPreviews?: boolean
    notificationTitle?: string,
    notificationIcon?: string,
  }): void {
    if (!params) return;
    (params?.allowNotifications !== undefined) && (this.allowNotifications = params.allowNotifications);
    (params?.showPreviews !== undefined) && (this.showPreviews = params.showPreviews);
    (params?.notificationTitle !== undefined) && (this.notificationTitle = params.notificationTitle);
    (params?.notificationIcon !== undefined) && (this.notificationIcon = params.notificationIcon);
  }

  public async notify(message: any): Promise<void> {
    if (!this.allowNotifications) {
      return;
    }
    if (!this.checkNotificationAbility()) {
      return;
    }
    if (!await this.requestNotificationPermission()) {
      return;
    }
    await this.handleNotification(message);
  }

  public checkNotificationAbility(): boolean {
    if (!('Notification' in window) || window.Notification.permission === 'denied') {
      return false;
    }
    return true;
  }

  public requestNotificationPermission(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!window?.Notification) reject(false);
      if (window.Notification.permission === 'granted') {
        resolve(true);
      }
      window.Notification.requestPermission().then(permission => {
        // 如果用户同意，就可以向他们发送通知
        if (permission === 'granted') {
          resolve(true);
        }
      }).catch(() => {
        reject(false);
      })
    })
  }

  public async handleNotification(message: any): Promise<void> {
    if (!this._isMessageNeedNotification(message)) return;
    const notificationType = this._handleNotificationType(message);
    let content;
    let options = {
      badge: this.notificationIcon,
      icon: this.notificationIcon,
      body: '',
      requireInteraction: false,
    }

    switch (notificationType) {
      case 'call':
        content = this._handleCallNotificationContent(message);
        if (!content?.content) {
          return;
        }
        options.body = content.content;
        options.requireInteraction = !content.callEnd;
        break;
      case 'chat':
        options.body = await this._handleChatNotificationContent(message);
        options.requireInteraction = false;
        break;
    }

    const notification = new Notification(this.notificationTitle, options);

    notification.onclick = () => {
      window.focus();
      if (!message || !message?.conversationID) {
        return;
      }
      const TUIConversationServer = TUINotification?.TUICore?.TUIServer?.TUIConversation;
      if (message?.conversationType === TIM.TYPES.CONV_C2C || message?.conversationType === TIM.TYPES.CONV_GROUP) {
        TUIConversationServer?.getConversationProfile(message?.conversationID).then((imResponse: any) => {
          imResponse?.data?.conversation && TUIConversationServer.handleCurrentConversation(imResponse?.data?.conversation);
        })
      }
      notification.close()
    }
  }

  private _isMessageNeedNotification(message: any): boolean {
    if (!message || !message?.ID || !message?.type ||
      message?.isRevoked || message?.isDeleted ||
      (isTypingMessage && isTypingMessage(message))) {
      return false;
    }
    if (message?.type === TIM.TYPES.MSG_GRP_TIP || message?.type === TIM.TYPES.MSG_GRP_SYS_NOTICE) {
      return false;
    }
    const currentConversationID = TUINotification?.TUICore?.TUIServer?.TUIConversation?.currentStore?.currentConversationID;
    if (this.checkPageFocus() && message?.conversationID === currentConversationID) {
      return false;
    }
    return true;
  }

  private _handleNotificationType(message: any): string {
    if (message.type === TIM.TYPES.MSG_CUSTOM) {
      const payloadData = JSON.parse(message?.payload?.data);
      if (payloadData?.businessID === 1 || payloadData?.businessID === 'av_call') {
        return 'call';
      }
    }
    return 'chat';
  }

  private async _handleChatNotificationContent(message: any): Promise<string> {
    let content = '';
    if (!message || !message?.ID || !message?.type) {
      return content
    }
    switch (this.showPreviews) {
      case true:
        content = await this._handleChatNotificationContentTitle(message);
        content += this._handleChatNotificationContentText(message);
        break;
      case false:
        content = '您有' + await TUINotification?.TUICore?.tim?.getTotalUnreadMessageCount() + '条新消息';
        break;
      default:
        break;
    }
    return content;
  }

  private async _handleChatNotificationContentTitle(message: any): Promise<string> {
    let title = '';
    switch (message?.conversationType) {
      case TIM.TYPES.CONV_C2C:
        title = (message?.nick || message?.from) + ': ';
        break;
      case TIM.TYPES.CONV_GROUP:
        title = message?.conversationID + ': ';
        await TUINotification?.TUICore?.tim?.getConversationProfile(message?.conversationID)?.then((imResponse: any) => {
          title = (imResponse?.data?.conversation?.groupProfile?.name || message?.conversationID) + ': ';
        }).catch(() => {
          title = message?.conversationID + ': ';
        })
        break;
      case TIM.TYPES.CONV_SYSTEM:
        title = '系统消息: ';
        break;
      default:
        break;
    }
    return title;
  }

  private _handleChatNotificationContentText(message: any): string {
    let content = '';
    switch (message.type) {
      case TIM.TYPES.MSG_TEXT:
        content += message?.payload?.text;
        break;
      case TIM.TYPES.MSG_CUSTOM:
        content += '[自定义消息]';
        break;
      case TIM.TYPES.MSG_IMAGE:
        content += '[图片]';
        break;
      case TIM.TYPES.MSG_AUDIO:
        content += '[语音]';
        break;
      case TIM.TYPES.MSG_VIDEO:
        content += '[视频]';
        break;
      case TIM.TYPES.MSG_FILE:
        content += '[文件]';
        break;
      case TIM.TYPES.MSG_FACE:
        content += '[表情]';
        break;
      case TIM.TYPES.MSG_MERGER:
        content += '[合并消息]';
        break;
      case TIM.TYPES.MSG_LOCATION:
        content += '[位置]';
        break;
      default:
        break;
    }
    return content;
  }

  private _handleCallNotificationContent(message: any): { content: string, callEnd: boolean } {
    let content = '';
    let callEnd = false;
    try {
      if (message.type === TIM.TYPES.MSG_CUSTOM) {
        const callInfo = JSON.parse(message?.payload?.data);
        const callDataInfo = JSON.parse(callInfo.data);
        if (callInfo?.businessID === 1) {
          if (callInfo.actionType === 1 && (
            (callInfo.groupID && callInfo.timeout > 0) ||
            ((!callInfo.call_end && callInfo.call_end !== 0) &&
              !callInfo.groupID &&
              !(callDataInfo?.data && (callDataInfo?.data.cmd === 'switchToAudio' || callDataInfo?.data.cmd === 'switchToVideo')))
          )) {
            content = this.showPreviews ? `${callInfo.inviter} 发起通话` : `您有一个通话请求`;
            callEnd = false;
          } else if (callInfo.actionType === 2) {
            content = this.showPreviews ? `${callInfo.inviter} 取消通话` : `通话取消`;
            callEnd = true;
          }
        }
      }
    } catch (error: any) {
      console.warn(error);
    }
    return {
      content,
      callEnd
    }
  }

  public checkPageFocus(): boolean {
    return document.hasFocus();
  }
}

export default TUINotification;