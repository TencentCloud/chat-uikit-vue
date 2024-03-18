/* eslint-disable @typescript-eslint/no-explicit-any */
import { IConversationModel, IMessageModel } from '@tencentcloud/chat-uikit-engine';

export interface ITUIComponents {
  TUIChat?: any;
  TUIConversation?: any;
  TUIContact?: any;
  TUISearch?: any;
  TUIGroup?: any;
  TUIProfile?: any;
  TUICallKit?: any;
  TUICallKitMini?: any;
  [propName: string]: any;
}

export interface ITUIPlugins {
  TUICallKit?: any;
  TUINotification?: any;
  [propName: string]: any;
}

export interface IEmojiListItem {
  type: string;
  index?: number;
  url: string;
  list: Array<string>;
}

export type IEmojiList = Array<IEmojiListItem>;

export interface ISendMessagePayload {
  text?: string;
  file?: any;
  atUserList?: Array<string>;
}

export interface ISendMessageParams {
  to?: string;
  conversationType?: string;
  payload?: ISendMessagePayload;
  cloudCustomData?: any;
}

export interface ITransferListItem {
  isDisabled?: boolean;
  avatar?: string;
  nick?: string;
  userID?: string;
  [propName: string]: any;
}

export interface ICustomMessagePayload {
  businessID?: string;
  // 评价类自定义消息相关字段
  score?: number;
  comment?: string;
  // 订单类 & 超链接类 自定义消息共用字段
  link?: string;
  // 订单类自定义消息相关字段
  imageUrl?: string;
  title?: string;
  description?: string;
  price?: string;
  // 超链接类自定义消息相关字段
  text?: string;
}

export interface IGroupApplicationType {
  applicant?: string;
  applicantNick?: string;
  groupID?: string;
  groupName?: string;
  applicationType: number;
  userID?: string;
  note?: string;
  [propName: string]: any;
}

export interface IGroupApplicationUserProfile {
  userID: string;
  avatar: string;
  nick: string;
  actionStatus?: string;
  [propName: string]: any;
}

export type IGroupApplicationListItem = IGroupApplicationType & IGroupApplicationUserProfile;

export interface IFriendType {
  userID?: string;
  remark?: string;
  groupList?: Array<unknown>;
  source?: string;
  wording?: string;
  profile?: IFriendProfile;
  friendCustomFriend?: Array<object>;
}

export interface IFriendProfile {
  userID?: string;
  avatar?: string;
  nick?: string;
  [propName: string]: unknown;
}

export interface IGroupMember {
  userID?: string;
  avatar?: string;
  nick?: string;
  role?: string;
  joinTime?: number;
  nameCard?: string;
  muteUntil?: string;
  memberCustomField?: Array<object>;
}

export interface IGroupSelfInfo {
  role?: string;
  messageRemindType?: string;
  joinTime?: number;
  nameCard?: string;
  userID?: string;
  memberCustomField?: Array<object>;
}

export interface IUserProfile {
  userID: string;
  nick: string;
  gender: string;
  birthday: number;
  location: string;
  selfSignature: string;
  allowType: string;
  language: number;
  avatar: string;
  messageSettings: number;
  adminForbidType: string;
  level: number;
  role: number;
  lastUpdatedTime: number;
  profileCustomField: Array<object>;
}

export interface IContactListItem {
  title: string;
  list: Array<unknown>;
  key: string;
  unreadCount?: number;
}

export interface IContactList {
  friendApplicationList: IContactListItem;
  blackList: IContactListItem;
  groupList: IContactListItem;
  friendList: IContactListItem;
  [key: string]: IContactListItem;
}

export interface IContactSearchResult {
  user: {
    label: string;
    list: Array<any>;
  };
  group: {
    label: string;
    list: Array<any>;
  };
}

export interface IBlackListUserItem {
  userID: string;
  nick?: string;
  avatar?: string;
}

export interface IContactInfoMoreItem {
  key: string;
  label: string;
  data: any;
  labelPosition?: string; // label 位置："left"/"top"
  editable?: boolean; // 是否可以编辑
  editType?: string; // 编辑类型: "input"/"switch"/"textarea"
  editing?: boolean; // 当前编辑状态: true 为"正在编辑中"，false 为"非编辑状态"
  editSubmitHandler?: () => void; // 编辑提交回调Z
}

export interface IContactInfoButton {
  key: string;
  label: string; // button 内容
  type: string; // button 类型: "cancel"/"submit"
  onClick: () => void; // 点击 button 回调
}

export interface ISearchCloudMessageResult {
  totalCount: number;
  searchResultList: Array<ISearchResultListItem>;
  cursor: string;
}

export interface ISearchResultListItem {
  conversation: IConversationModel;
  messageCount: number;
  messageList: Array<IMessageModel>;
  type?: string;
}

export interface IImageMessageContent {
  showName?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface IVideoMessageContent {
  showName: string; // - 消息发送方名称
  url: string; // - 视频播放链接
  snapshotUrl: string; // - 视频封面图链接
  snapshotWidth: number; // - 视频封面图宽度
  snapshotHeight: number; // - 视频封面图高度
}

export interface IFileMessageContent {
  name: string;
  url: string;
  size: number;
}

export interface IAudioMessageContent {
  showName: string;
  url: string;
  second: number;
}

export interface ICustomMessageContent {
  showName: string;
  custom: string;
  businessID: string;
}

export interface IAudioContext {
  src: string | undefined;
  startTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  destroy: () => void;
  onPlay: (callback: (...args: unknown[]) => void) => void;
  onPause: (callback: (...args: unknown[]) => void) => void;
  onStop: (callback: (...args: unknown[]) => void) => void;
  onEnded: (callback: (...args: unknown[]) => void) => void;
  onError: (callback: (...args: unknown[]) => void) => void;
}

export interface ITipTapEditorContent {
  type: 'text' | 'image' | 'video' | 'file';
  payload: {
    text?: string;
    file?: File;
    atUserList?: string[];
  };
}

export interface IUserStatus {
  statusType: number;
  customStatus: string;
}
export interface IUserStatusMap {
  [userID: string]: IUserStatus;
}
