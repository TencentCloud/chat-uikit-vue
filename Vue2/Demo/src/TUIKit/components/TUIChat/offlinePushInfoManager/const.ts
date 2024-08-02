import TUIChatEngine from '@tencentcloud/chat-uikit-engine';
export const DEFAULT_DESC: any = {
  [TUIChatEngine.TYPES.MSG_TEXT]: '[文本]',
  [TUIChatEngine.TYPES.MSG_FACE]: '[动画表情]',
  [TUIChatEngine.TYPES.MSG_IMAGE]: '[图片]',
  [TUIChatEngine.TYPES.MSG_FILE]: '[文件]',
  [TUIChatEngine.TYPES.MSG_AUDIO]: '[语音]',
  [TUIChatEngine.TYPES.MSG_VIDEO]: '[视频]',
  [TUIChatEngine.TYPES.MSG_LOCATION]: '[地理位置]',
  [TUIChatEngine.TYPES.MSG_MERGER]: '[聊天记录]',
  [TUIChatEngine.TYPES.MSG_CUSTOM]: '[自定义消息]',
};

export enum PUSH_SCENE {
  CHAT = 'chat',
  CALL = 'call',
}
