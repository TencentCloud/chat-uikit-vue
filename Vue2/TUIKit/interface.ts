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

export type IGroupApplicationListItem = IGroupApplicationType &
  IGroupApplicationUserProfile;

export interface IImageMessageContent {
  url?: string;
  width?: number;
  height?: number;
  progress?: number;
}

export interface IFriendType {
  userID?: string;
  remark?: string;
  groupList?: Array<any>;
  source?: string;
  wording?: string;
  profile?: IFriendProfile;
  friendCustomFriend?: Array<Object>;
}

export interface IFriendProfile {
  userID?: string;
  avatar?: string;
  nick?: string;
  [propName: string]: any;
}

export interface IGroupMember {
  userID?: string;
  avatar?: string;
  nick?: string;
  role?: string;
  joinTime?: number;
  nameCard?: string;
  muteUntil?: string;
  memberCustomField?: Array<Object>;
}

export interface IGroupSelfInfo {
  role?: string;
  messageRemindType?: string;
  joinTime?: number;
  nameCard?: string;
  userID?: string;
  memberCustomField?: Array<Object>;
}

export interface IUserProfile {
  userID?: string;
  nick?: string;
  gender?: string;
  birthday?: number;
  location?: string;
  selfSignature?: string;
  allowType?: string;
  language?: number;
  avatar?: string;
  messageSettings?: number;
  adminForbidType?: string;
  level?: number;
  role?: number;
  lastUpdatedTime?: number;
  profileCustomField?: Array<Object>;
}
