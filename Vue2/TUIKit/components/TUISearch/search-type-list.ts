import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
export interface ISearchMessageTypeList {
  [propsName: string]: {
    key: string;
    label: string;
    value: Array<string> | string;
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
  // 全维度搜索，包括联系人/群聊/聊天记录, 暂不支持
  // all: {
  //   key: "all",
  //   label: "全部",
  //   value: allMessageTypeList,
  // },
  // 暂不支持 nick remark name 搜索，仅支持 userID 搜索
  // contact: {
  //   key: "contact",
  //   label: "联系人",
  //   value: "contact",
  // },
  // 暂不支持 name remark 搜索，仅支持 groupID 搜索
  // group: {
  //   key: "group",
  //   label: "群聊",
  //   value: "group",
  // },
  allMessage: {
    key: "allMessage",
    label: "全部",
    value: allMessageTypeList,
  },
  textMessage: {
    key: "textMessage",
    label: "文本",
    value: [TUIChatEngine.TYPES.MSG_TEXT],
  },
  fileMessage: {
    key: "fileMessage",
    label: "文件",
    value: [TUIChatEngine.TYPES.MSG_FILE],
  },
  imageMessage: {
    key: "imageMessage",
    label: "图片/视频",
    value: [TUIChatEngine.TYPES.MSG_IMAGE, TUIChatEngine.TYPES.MSG_VIDEO],
  },
  otherMessage: {
    key: "otherMessage",
    label: "其他",
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
  (key: string) => key !== "all"
);
export const searchInGlobalDefaultType = searchMessageTypeList["allMessage"];
export const searchInConversationDefaultType = searchMessageTypeList["textMessage"];
export const searchMessageTypeDefault = {
  global: searchInGlobalDefaultType,
  conversation: searchInConversationDefaultType,
};

// 全局搜索类型 key 列表
export const globalSearchTypeKeys = ["allMessage", "textMessage", "fileMessage", "otherMessage"];
// 全局搜索类型列表
export const globalSearchTypeList = Object.keys(searchMessageTypeList)
  .filter((key: string) => globalSearchTypeKeys?.includes(key))
  .reduce((obj: ISearchMessageTypeList, key: string) => {
    obj[key] = searchMessageTypeList[key];
    return obj;
  }, {});

// 会话内搜索类型 key 列表
export const conversationSearchTypeKeys = [
  "textMessage",
  "fileMessage",
  "imageMessage",
  "otherMessage",
];
// 会话内搜索类型列表
export const conversationSearchTypeList = Object.keys(searchMessageTypeList)
  .filter((key: string) => conversationSearchTypeKeys?.includes(key))
  .reduce((obj: ISearchMessageTypeList, key: string) => {
    obj[key] = searchMessageTypeList[key];
    return obj;
  }, {});
