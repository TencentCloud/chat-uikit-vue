import TUIChatEngine from "@tencentcloud/chat-uikit-engine";

export type SEARCH_TYPE = "global" | "conversation";

// 消息搜索结果类型展示摘要
// 不支持类型：
// TYPES.MSG_FACE / TYPES.MSG_GRP_TIP / TYPES.MSG_GRP_SYS_NOTICE
export const messageTypeAbstractMap = {
  [TUIChatEngine.TYPES.MSG_TEXT]: "[文本]",
  [TUIChatEngine.TYPES.MSG_IMAGE]: "[图片]",
  [TUIChatEngine.TYPES.MSG_AUDIO]: "[语音]",
  [TUIChatEngine.TYPES.MSG_VIDEO]: "[视频]",
  [TUIChatEngine.TYPES.MSG_FILE]: "[文件]",
  [TUIChatEngine.TYPES.MSG_CUSTOM]: "[自定义消息]",
  [TUIChatEngine.TYPES.MSG_SYSTEM]: "[系统消息]",
  [TUIChatEngine.TYPES.MSG_MERGER]: "[合并消息]",
  [TUIChatEngine.TYPES.MSG_LOCATION]: "[位置消息]",
};

export const searchResultItemDisplayType = {
  INFO: "info", // 正常信息流展示
  BUBBLE: "bubble", // 消息气泡展示
  FILE: "file", // 文件列表类型展示
  IMAGE: "image", // 图片合集形式展示
};

export const searchMessageType = {
  // CONTACT: "contact", // 联系人搜索，暂不支持
  // GROUP: "group", // 群组搜索，暂不支持
  ALL_MESSAGE: "allMessage", // 聊天记录-全部
  TEXT_MESSAGE: "textMessage", // 聊天记录-文本
  IMAGE_MESSAGE: "imageMessage", // 聊天记录-图片
  FILE_MESSAGE: "fileMessage", // 聊天记录-文件
  OTHER_MESSAGE: "otherMessage", // 聊天记录-其他
};
