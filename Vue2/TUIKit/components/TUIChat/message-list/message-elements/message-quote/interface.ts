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
