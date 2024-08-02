import { IConversationModel } from '@tencentcloud/chat-uikit-engine';

export interface IOfflinePushInfoCreateParams {
  conversation: IConversationModel;
  payload?: any;
  messageType: string;
}

export interface IOfflinePushApnsInfo {
  sound?: string;
  ignoreIOSBadge?: boolean;
  disableVoipPush?: boolean;
  image?: string;
}

export interface IOfflinePushAndroidInfo {
  sound?: string;
  XiaoMiChannelID?: string;
  OPPOChannelID?: string;
  FCMChannelID?: string;
  VIVOClassification?: number;
  VIVOCategory?: string;
  HuaWeiCategory?: string;
  HuaWeiImage?: string;
  HonorImage?: string;
  GoogleImage?: string;
}

// https://web.sdk.qcloud.com/im/doc/v3/zh-cn/SDK.html#sendMessage
export interface IChatOfflinePushInfo {
  title?: string;
  description?: string;
  extension?: string;
  androidInfo?: IOfflinePushAndroidInfo;
  apnsInfo?: IOfflinePushApnsInfo;
}

// doc: https://cloud.tencent.com/document/product/269/105713
export interface ICallOfflinePushInfo {
  title?: string;
  description?: string;
  iOSSound?: string;
  androidSound?: string;
  androidOPPOChannelID?: string;
  androidXiaoMiChannelID?: string;
  androidFCMChannelID?: string;
  ignoreIOSBadge?: string;
  isDisablePush?: string;
}
