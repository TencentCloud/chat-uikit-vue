/* eslint-disable @typescript-eslint/no-explicit-any */
import { IConversationModel, IGroupModel, IMessageModel, Friend, FriendApplication } from '@tencentcloud/chat-uikit-engine';

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

export interface IEmojiGroup {
  type: string;
  emojiGroupID: number;
  url: string;
  list: string[];
}

export type IEmojiGroupList = IEmojiGroup[];

export interface ISendMessagePayload {
  text?: string;
  file?: any;
  atUserList?: string[];
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
  // Evaluation-related custom message fields
  score?: number;
  comment?: string;
  // Order & Hyperlink Class Custom Message Common Fields
  link?: string;
  // Order-related custom message fields
  imageUrl?: string;
  title?: string;
  description?: string;
  price?: string;
  // Hyperlink custom message related fields
  text?: string;
}

export interface IGroupApplication {
  applicant: string;
  applicantNick: string;
  groupID: string;
  groupName: string;
  applicationType: 0 | 2; // 0 - group application, 2 - group invite
  userID: string;
  note: string;
  [propName: string]: any;
}

export interface IGroupApplicationUserProfile {
  userID: string;
  avatar: string;
  nick: string;
  actionStatus?: string;
  [propName: string]: any;
}

export type IGroupApplicationListItem = IGroupApplication;

export interface IFriendType {
  userID?: string;
  remark?: string;
  groupList?: any[];
  source?: string;
  wording?: string;
  profile?: IFriendProfile;
  friendCustomFriend?: Array<Record<string, any>>;
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
  memberCustomField?: Array<Record<string, any>>;
}

export interface IGroupSelfInfo {
  role?: string;
  messageRemindType?: string;
  joinTime?: number;
  nameCard?: string;
  userID?: string;
  memberCustomField?: Array<Record<string, any>>;
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
  profileCustomField: Array<Record<string, any>>;
}

export interface IContactListItem {
  title: string;
  list: any[];
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
    list: any[];
  };
  group: {
    label: string;
    list: any[];
  };
}

export interface IBlackListUserItem {
  userID: string;
  nick?: string;
  avatar?: string;
}

export type IContactInfoType = Friend | FriendApplication | IGroupModel | IBlackListUserItem;

export interface IContactInfoMoreItem {
  key: string;
  label: string;
  data: any;
  labelPosition?: string; // label position："left"/"top"
  editable?: boolean; // indicates whether it can be edited
  editType?: string; // edit type: "input"/"switch"/"textarea"
  editing?: boolean; // Current editing status: true: "Editing" / false:"Not editing"
  editSubmitHandler?: () => void; // edit submit callback
}

export interface IContactInfoButton {
  key: string;
  label: string; // button label
  type: string; // button type: "cancel"/"submit"
  onClick: () => void; // button click callback
}

export interface ISearchCloudMessageResult {
  totalCount: number;
  searchResultList: ISearchResultListItem[];
  cursor: string;
}

export interface ISearchResultListItem {
  conversation: IConversationModel;
  messageCount: number;
  messageList: IMessageModel[];
  type?: string;
}

export interface IImageMessageContent {
  showName?: string;
  url?: string;
  width?: number;
  height?: number;
}

export interface IVideoMessageContent {
  showName: string; // video message sender name
  url: string; // video url
  snapshotUrl: string; // video snapshot url
  snapshotWidth: number; // video snapshot width
  snapshotHeight: number; // video snapshot height
}

export interface ITextMessageContent {
  text: string;
}

export interface IMergeMessageContent {
  abstractList: string[];
  compatibleText: string;
  downloadKey: string;
  layersOverLimit: boolean;
  messageList: Array<{
    avatar: string;
    ID: string;
    cloudCustomData: string;
    from: string;
    messageBody: Array<{
      type: string;
      payload: Record<string, any>;
    }>;
    messageReceiver: string;
    messageRandom: number;
    messageSender: string;
    messageSequence: number;
    messageTime: number;
    nick: string;
    receiverUserID: string;
    time: number;
  }>;
  pbDownloadKey: string;
  showName: string;
  title: string;
  version: number;
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
  onPlay: (callback: (...args: any[]) => void) => void;
  onPause: (callback: (...args: any[]) => void) => void;
  onStop: (callback: (...args: any[]) => void) => void;
  onEnded: (callback: (...args: any[]) => void) => void;
  onError: (callback: (...args: any[]) => void) => void;
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

export interface ITranslateInfo {
  conversationID: string;
  messageID: string;
  visible: boolean;
}

export interface IConvertInfo {
  conversationID: string;
  messageID: string;
  visible: boolean;
}

export interface IChatResponese<T> {
  code: string;
  data: T;
}

export type ToolbarDisplayType = 'emojiPicker' | 'tools' | 'none';

export type InputDisplayType = 'editor' | 'audio';
