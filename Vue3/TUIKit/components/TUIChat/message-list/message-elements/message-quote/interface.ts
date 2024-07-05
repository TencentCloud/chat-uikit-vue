export interface IQuoteContent {
  messageAbstract: string;
  messageID: string;
  messageSender: string;
  messageSequence: number;
  messageTime: number;
  messageType: number;
  version: number;
}

export interface ICloudCustomData {
  messageReply: IQuoteContent;
}

export enum MessageQuoteTypeEnum {
  /**
   * none message
   */
  TYPE_NONE = 0,
  /**
   * text message
   */
  TYPE_TEXT = 1,
  /**
   * custom message
   */
  TYPE_CUSTOM = 2,
  /**
   * image message
   */
  TYPE_IMAGE = 3,
  /**
   * voice message
   */
  TYPE_SOUND = 4,
  /**
   * video message
   */
  TYPE_VIDEO = 5,
  /**
   * file message
   */
  TYPE_FILE = 6,
  /**
   * location message
   */
  TYPE_LOCATION = 7,
  /**
   * animation face message
   */
  TYPE_FACE = 8,
  /**
   * group tips message (save in message list)
   */
  TYPE_GROUP_TIPS = 9,
  /**
   * merge forward message
   */
  TYPE_MERGER = 10,
}
