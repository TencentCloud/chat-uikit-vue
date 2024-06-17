import TUIChatEngine, {
  TUIStore,
  StoreName,
  IMessageModel,
  IConversationModel,
  TUITranslateService,
  TUIConversationService,
} from '@tencentcloud/chat-uikit-engine';
import {
  ITUINotification,
  NotificationType,
  INotificationConstructorParams,
} from './interface';
import { safeParse, isTypingMessage } from './utils';

const TYPES = TUIChatEngine.TYPES;

/**
   * The TUINotification class.
   * Just can use in web environment.
   * @extends {ITUINotification}
   * @param {INotificationConstructorParams | undefined} params - An optional parameter specifying the options for creating the TUINotification instance.
   * @return {TUINotification} - The instance of TUINotification.
   * @example
   * TUINotification.setNotificationConfiguration({
   *   showPreviews: true,
   *   allowNotifications: true
   * });
   * TUINotification.getInstance(config).notify(message);
   */
class TUINotification implements ITUINotification {
  public showPreviews = true;
  public allowNotifications = true;
  public notificationTitle = TUITranslateService.t('TUIChat.腾讯云 IM');
  public notificationIcon = 'https://web.sdk.qcloud.com/im/demo/latest/faviconnew.png';

  private static instance: TUINotification | null = null;

  // private constructor implementing the Singleton Pattern
  private constructor(params?: INotificationConstructorParams) {
    this.setConfiguration(params);
  }

  /**
     * Returns an instance of TUINotification.
     *
     * @param {INotificationConstructorParams | undefined} options - An optional parameter specifying the options for creating the TUINotification instance.
     * @return {TUINotification} - The instance of TUINotification.
     */
  static getInstance(options?: INotificationConstructorParams): TUINotification {
    if (!this.instance) {
      this.instance = new TUINotification(options);
    }
    return this.instance;
  }

  /**
     * Notifies the user with a given message.
     *
     * @param {IMessageModel} message - The message to be notified.
     * @return {Promise<void>} - A promise that resolves when the notification is handled.
     */
  public async notify(message: IMessageModel): Promise<void> {
    const browserPermission = await this.requestNotificationPermission();
    if (
      !this.allowNotifications
      || !browserPermission
      || !this.isMessageNeedNotification(message)
    ) {
      return;
    }
    await this.handleNotification(message);
  }

  /**
     * Handles the notification message.
     *
     * @param {IMessageModel} message - The notification message to handle.
     * @return {Promise<void>} - A Promise that resolves once the notification is handled.
     */
  public async handleNotification(message: IMessageModel): Promise<void> {
    let options = {
      badge: this.notificationIcon,
      icon: this.notificationIcon,
      body: '',
      requireInteraction: false,
    };
    const notificationType = this.getNotificationType(message);
    let content;
    let callEnd;
    switch (notificationType) {
      case 'call':
        ({ content, callEnd } = this.getCallNotificationInfo(message));
        options = {
          ...options,
          body: content,
          requireInteraction: !callEnd,
        };
        break;
      case 'chat':
        options = {
          ...options,
          body: await this.getChatNotificationContent(message),
          requireInteraction: false,
        };
        break;
    }
    const notification = new Notification(this.notificationTitle, options);
    notification.onclick = async () => {
      window.focus();
      if (!message || !message.conversationID) {
        return;
      }
      if (
        message?.conversationType === TYPES.CONV_C2C
        || message?.conversationType === TYPES.CONV_GROUP
      ) {
        const conversationProfile = await TUIConversationService.getConversationProfile(message.conversationID);
        const { conversationID: clickedMessageConvID } = conversationProfile?.data?.conversation || {};
        if (clickedMessageConvID) {
          TUIConversationService.switchConversation(clickedMessageConvID);
        }
      }
      notification.close();
    };
  }

  /**
     * Sets the notification configuration.
     *
     * @param {INotificationConstructorParams} params - The parameters for the notification configuration.
     * @return {void} This function does not return a value.
     */
  public setNotificationConfiguration(params?: INotificationConstructorParams): void {
    this.setConfiguration(params);
  }

  /**
     * Checks if the browser supports notifications.
     *
     * @return {boolean} true if the browser supports notifications, false otherwise.
     */
  public checkNotificationAbility(): boolean {
    if (window && 'Notification' in window) {
      return true;
    }
    return false;
  }

  /**
     * Checks if the browser has notification capability
     * If the browser already has notification permission, returns true
     * Otherwise, requests permission and returns the result
     * @return Promise<boolean>
     */
  public async requestNotificationPermission(): Promise<boolean> {
    if (!this.checkNotificationAbility()) {
      console.error('The browser does not support notifications.');
      return false;
    }
    if (window.Notification.permission === 'granted') {
      return true;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  /**
     * Checks if the current page has focus.
     * @return {boolean}
     */
  public checkPageFocus(): boolean {
    return document.hasFocus();
  }

  /**
     * use new configuration to overwrite old configuration
     * @param params
     * @return {void}
     */
  private setConfiguration(params?: INotificationConstructorParams): void {
    if (!params) return;
    if (params.allowNotifications !== undefined) {
      this.allowNotifications = params.allowNotifications;
    }
    if (params.showPreviews !== undefined) {
      this.showPreviews = params.showPreviews;
    }
    if (params.notificationTitle !== undefined) {
      this.notificationTitle = params.notificationTitle;
    }
    if (params.notificationIcon !== undefined) {
      this.notificationIcon = params.notificationIcon;
    }
  }

  /**
     * Checks if a message needs to be notified.
     *
     * A message does not need to be notified if it:
     *  - is null or undefined
     *  - does not have an ID or a type
     *  - is revoked or deleted
     *  - is a typing message
     *  - is of type MSG_GRP_TIP or MSG_GRP_SYS_NOTICE
     *  - the page is focused and the message belongs to the current conversation
     *
     * @param {IMessageModel} message - The message to check
     * @return {boolean} - True if the message needs to be notified, false otherwise
     */
  private isMessageNeedNotification(message: IMessageModel): boolean {
    if (!message || !message.ID || !message.type || message.isRevoked || message.isDeleted || isTypingMessage?.(message)) {
      return false;
    }

    if (message.type === TYPES.MSG_GRP_TIP || message.type === TYPES.MSG_GRP_SYS_NOTICE) {
      return false;
    }

    const currentConversationID = TUIStore.getData(StoreName.CONV, 'currentConversationID');

    if (this.checkPageFocus() && message?.conversationID === currentConversationID) {
      return false;
    }

    return true;
  }

  /**
     * Returns the notification type 'call' or 'chat'.
     * @param {IMessageModel} message
     * @return {'chat' | 'call'} call' or 'chat'
     */
  private getNotificationType(message: IMessageModel): NotificationType {
    if (message.type === TYPES.MSG_CUSTOM) {
      const { businessID } = safeParse(message.payload?.data);
      if (businessID === 1 || businessID === 'av_call') {
        return 'call';
      }
    }
    return 'chat';
  }

  /**
     * Retrieves the content for chat type message notifications.
     * @param {IMessageModel} message
     * @return {Promise<string>}
     */
  private async getChatNotificationContent(message: IMessageModel): Promise<string> {
    let content = '';
    if (!message || !message.ID || !message.type) {
      return content;
    }
    if (this.showPreviews) {
      content = await this.getChatNotificationContentTitle(message);
      content += this.getChatNotificationContentText(message);
    } else {
      const totalUnreadMessageCount = TUIStore.getData(StoreName.CONV, 'totalUnreadCount');
      content = `${TUITranslateService.t('TUIChat.您有')} ${totalUnreadMessageCount} ${TUITranslateService.t('TUIChat.条新消息')}`;
    }
    return content;
  }

  /**
     * Retrieves the content title for chat notifications.
     * @param {IMessageModel} message - The message object.
     * @returns {Promise<string>} - The content title for chat notifications.
     */
  private async getChatNotificationContentTitle(message: IMessageModel): Promise<string> {
    let title = '';
    let conversationProfile;
    let conversation: IConversationModel;
    switch (message.conversationType) {
      case TYPES.CONV_C2C:
        title = (message.nick || message.from) + ': ';
        break;
      case TYPES.CONV_GROUP:
        conversationProfile = await TUIConversationService.getConversationProfile(message.conversationID);
        conversation = conversationProfile?.data?.conversation;
        title = conversation?.groupProfile?.name || message.conversationID;
        title += ': ';
        break;
      case TYPES.CONV_SYSTEM:
        title = `${TUITranslateService.t('TUIChat.系统消息')}: `;
        break;
      default:
        break;
    }
    return title;
  }

  /**
     * Get the content of the chat notification
     * @param {IMessageModel} message
     * @return {string}
     */
  private getChatNotificationContentText(message: IMessageModel): string {
    let content = '';
    switch (message.type) {
      case TYPES.MSG_TEXT:
        content += message?.payload?.text;
        break;
      case TYPES.MSG_CUSTOM:
        content += TUITranslateService.t('TUIChat.自定义');
        break;
      case TYPES.MSG_IMAGE:
        content += TUITranslateService.t('TUIChat.图片');
        break;
      case TYPES.MSG_AUDIO:
        content += TUITranslateService.t('TUIChat.语音');
        break;
      case TYPES.MSG_VIDEO:
        content += TUITranslateService.t('TUIChat.视频');
        break;
      case TYPES.MSG_FILE:
        content += TUITranslateService.t('TUIChat.文件');
        break;
      case TYPES.MSG_FACE:
        content += TUITranslateService.t('TUIChat.表情');
        break;
      case TYPES.MSG_MERGER:
        content += TUITranslateService.t('TUIChat.聊天记录');
        break;
      case TYPES.MSG_LOCATION:
        content += TUITranslateService.t('TUIChat.位置');
        break;
      default:
        break;
    }
    return content;
  }

  /**
     * Get the content of the call notification.
     * @param message - The message object.
     * @returns An object containing the notification content and call end status.
     */
  private getCallNotificationInfo(message: IMessageModel): { content: string; callEnd: boolean } {
    let content = '';
    let callEnd = false;

    try {
      if (message.type !== TYPES.MSG_CUSTOM || !message.payload?.data) {
        throw new Error();
      }
      const callInfo = safeParse(message.payload.data);
      const callDataInfo = safeParse(callInfo.data);
      if (callInfo.businessID !== 1) {
        throw new Error();
      }
      switch (callInfo.actionType) {
        case 1:
          if (
            (callInfo.groupID && callInfo.timeout > 0)
            || (!callInfo.call_end && !callInfo.groupID
            && !(callDataInfo?.data && (callDataInfo?.data.cmd === 'switchToAudio' || callDataInfo?.data.cmd === 'switchToVideo')))
          ) {
            callEnd = false;
            content = this.showPreviews ? `${callInfo.inviter} ${TUITranslateService.t('TUIChat.发起通话')}` : `${TUITranslateService.t('TUIChat.发起通话')}`;
          }
          break;
        case 2:
          callEnd = true;
          content = this.showPreviews ? `${callInfo.inviter} ${TUITranslateService.t('TUIChat.取消通话')}` : `${TUITranslateService.t('TUIChat.取消通话')}`;
          break;
        default:
          throw new Error();
      }
    } catch (error: unknown) {
      console.warn(error);
    }

    return {
      content,
      callEnd,
    };
  }
}

export default TUINotification.getInstance();
