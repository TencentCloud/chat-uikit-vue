import { IChatOfflinePushInfo, ICallOfflinePushInfo } from './interface';

export const chatOfflinePushInfo: IChatOfflinePushInfo = {
  androidInfo: {
    sound: 'private_ring.mp3',
    XiaoMiChannelID: 'high_custom_1',
    OPPOChannelID: 'tuikit',
  },
  apnsInfo: {
    sound: '01.caf',
    image: 'https://web.sdk.qcloud.com/im/demo/latest/faviconnew.png',
  },
};

export const callOfflinePushInfo: ICallOfflinePushInfo = {
  title: 'call',
  description: 'you have a call',
  androidSound: 'private_ring',
  androidOPPOChannelID: 'tuikit',
  iOSSound: '01.caf',
};
