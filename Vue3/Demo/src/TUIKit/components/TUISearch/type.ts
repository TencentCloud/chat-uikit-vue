import TUIChatEngine from '@tencentcloud/chat-uikit-engine';

export type SEARCH_TYPE = 'global' | 'conversation';

// Message search result type display summary
// Unsupported type:
// TYPES.MSG_FACE / TYPES.MSG_GRP_TIP / TYPES.MSG_GRP_SYS_NOTICE
export const messageTypeAbstractMap: Record<string, string> = {
  [TUIChatEngine.TYPES.MSG_TEXT]: '[文本]',
  [TUIChatEngine.TYPES.MSG_IMAGE]: '[图片]',
  [TUIChatEngine.TYPES.MSG_AUDIO]: '[语音]',
  [TUIChatEngine.TYPES.MSG_VIDEO]: '[视频]',
  [TUIChatEngine.TYPES.MSG_FILE]: '[文件]',
  [TUIChatEngine.TYPES.MSG_CUSTOM]: '[自定义消息]',
  [TUIChatEngine.TYPES.MSG_SYSTEM]: '[系统消息]',
  [TUIChatEngine.TYPES.MSG_MERGER]: '[合并消息]',
  [TUIChatEngine.TYPES.MSG_LOCATION]: '[位置消息]',
};

export const searchResultItemDisplayType = {
  INFO: 'info', // Normal information flow display
  BUBBLE: 'bubble', // Message bubble display
  FILE: 'file', // File list type display
  IMAGE: 'image', // Picture collection display
};

export type searchResultItemDisplayTypeKeys = keyof typeof searchResultItemDisplayType;
export type searchResultItemDisplayTypeValues = typeof searchResultItemDisplayType[searchResultItemDisplayTypeKeys];

export const searchMessageType = {
  // CONTACT: "contact", // Contact search, not supported yet
  // GROUP: "group", // Group search, not supported yet
  ALL_MESSAGE: 'allMessage',
  TEXT_MESSAGE: 'textMessage',
  IMAGE_MESSAGE: 'imageMessage',
  FILE_MESSAGE: 'fileMessage',
  OTHER_MESSAGE: 'otherMessage',
};

export type searchMessageTypeKeys = keyof typeof searchMessageType;
export type searchMessageTypeValues = typeof searchMessageType[searchMessageTypeKeys];

export interface ISearchInputValue {
  value: string;
  searchType: SEARCH_TYPE;
}
export interface ISearchTypeTab {
  key: string;
  label: string;
  value: string | string[];
}
export interface ISearchMessageType {
  value: ISearchTypeTab;
  searchType: SEARCH_TYPE;
}
export interface ISearchTimeTab {
  key: string;
  label: string;
  value: {
    timePosition: number;
    timePeriod: number;
  };
}
export interface ISearchMessageTime {
  value: ISearchTimeTab;
  searchType: SEARCH_TYPE;
}
export interface ISearchingStatus {
  isSearching: boolean;
  searchType: string;
}

export interface IHighlightContent {
  text: string;
  isHighlight: boolean;
}
