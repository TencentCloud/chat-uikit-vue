import TUIChatEngine from '@tencentcloud/chat-uikit-engine';
export interface ISearchMessageTypeList {
  [propsName: string]: {
    key: string;
    label: string;
    value: any[] | string;
  };
}
export const allMessageTypeList = [
  TUIChatEngine.TYPES.MSG_TEXT,
  TUIChatEngine.TYPES.MSG_FILE,
  TUIChatEngine.TYPES.MSG_IMAGE,
  TUIChatEngine.TYPES.MSG_VIDEO,
  TUIChatEngine.TYPES.MSG_AUDIO,
  TUIChatEngine.TYPES.MSG_LOCATION,
  TUIChatEngine.TYPES.MSG_CUSTOM,
  TUIChatEngine.TYPES.MSG_MERGER,
];
export const searchMessageTypeList: ISearchMessageTypeList = {
  allMessage: {
    key: 'allMessage',
    label: '全部',
    value: allMessageTypeList,
  },
  textMessage: {
    key: 'textMessage',
    label: '文本',
    value: [TUIChatEngine.TYPES.MSG_TEXT],
  },
  fileMessage: {
    key: 'fileMessage',
    label: '文件',
    value: [TUIChatEngine.TYPES.MSG_FILE],
  },
  imageMessage: {
    key: 'imageMessage',
    label: '图片/视频',
    value: [TUIChatEngine.TYPES.MSG_IMAGE, TUIChatEngine.TYPES.MSG_VIDEO],
  },
  otherMessage: {
    key: 'otherMessage',
    label: '其他',
    value: [
      TUIChatEngine.TYPES.MSG_AUDIO,
      TUIChatEngine.TYPES.MSG_LOCATION,
      TUIChatEngine.TYPES.MSG_CUSTOM,
      TUIChatEngine.TYPES.MSG_MERGER,
    ],
  },
};

export const searchMessageTypeKeys = Object.keys(searchMessageTypeList);
export const searchMessageSingleTypeKeys = Object.keys(searchMessageTypeList).filter(
  (key: string) => key !== 'all',
);
export const searchInGlobalDefaultType = searchMessageTypeList['allMessage'];
export const searchInConversationDefaultType = searchMessageTypeList['textMessage'];
export const searchMessageTypeDefault = {
  global: searchInGlobalDefaultType,
  conversation: searchInConversationDefaultType,
};

// Global search type key list
export const globalSearchTypeKeys = ['allMessage', 'textMessage', 'fileMessage', 'otherMessage'];
// Global search type list
export const globalSearchTypeList = Object.keys(searchMessageTypeList)
  .filter((key: string) => globalSearchTypeKeys?.includes(key))
  .reduce((obj: ISearchMessageTypeList, key: string) => {
    obj[key] = searchMessageTypeList[key];
    return obj;
  }, {});

// Search type key list in session
export const conversationSearchTypeKeys = [
  'textMessage',
  'fileMessage',
  'imageMessage',
  'otherMessage',
];
// Search type list in session
export const conversationSearchTypeList = Object.keys(searchMessageTypeList)
  .filter((key: string) => conversationSearchTypeKeys?.includes(key))
  .reduce((obj: ISearchMessageTypeList, key: string) => {
    obj[key] = searchMessageTypeList[key];
    return obj;
  }, {});
