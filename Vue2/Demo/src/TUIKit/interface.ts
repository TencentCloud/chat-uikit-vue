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

export interface IEmojiList extends Array<IEmojiListItem> {}

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
