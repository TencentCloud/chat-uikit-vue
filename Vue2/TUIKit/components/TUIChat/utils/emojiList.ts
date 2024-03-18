import { IEmojiList } from '../../../interface';
import { EMOJI_TYPE } from '../../../constant';
import { emojiConfig } from './emoji-config';
export const basicEmojiUrl = emojiConfig.emojiBaseUrl;
export const basicEmojiMap = emojiConfig.emojiUrlMapping;
export const basicEmojiList = emojiConfig.emojiNameMapping;
export const basicEmojiKey = emojiConfig.emojiKeyMapping;
export const bigEmojiUrl = 'https://web.sdk.qcloud.com/im/assets/face-elem/';

export const bigEmojiList: Array<any> = [
  {
    type: EMOJI_TYPE.BIG,
    index: 1,
    url: bigEmojiUrl,
    list: ['yz00', 'yz01', 'yz02', 'yz03', 'yz04', 'yz05', 'yz06', 'yz07', 'yz08',
      'yz09', 'yz10', 'yz11', 'yz12', 'yz13', 'yz14', 'yz15', 'yz16', 'yz17'],
  },
  {
    type: EMOJI_TYPE.BIG,
    index: 2,
    url: bigEmojiUrl,
    list: ['ys00', 'ys01', 'ys02', 'ys03', 'ys04', 'ys05', 'ys06', 'ys07', 'ys08',
      'ys09', 'ys10', 'ys11', 'ys12', 'ys13', 'ys14', 'ys15'],
  },
  {
    type: EMOJI_TYPE.BIG,
    index: 3,
    url: bigEmojiUrl,
    list: ['gcs00', 'gcs01', 'gcs02', 'gcs03', 'gcs04', 'gcs05', 'gcs06', 'gcs07',
      'gcs08', 'gcs09', 'gcs10', 'gcs11', 'gcs12', 'gcs13', 'gcs14', 'gcs15', 'gcs16'],
  },
];

export const emojiList: IEmojiList = [
  {
    type: EMOJI_TYPE.BASIC,
    url: basicEmojiUrl,
    list: Object.keys(basicEmojiList),
  },
  ...bigEmojiList,
];

export const decodeTextMessage = (text: string) => {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let txt: string = text;
  if (reg.test(text)) {
    txt = text.replace(reg, match => basicEmojiList[match] || match);
  }
  return txt;
};

// 把中文的 value [微笑] 转化为英文的 key [TUIEmoji_Smile]
export const transformEmojiValueToKey = (text: string) => {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let txt: string = text;
  if (reg.test(text)) {
    txt = text.replace(reg, match => basicEmojiKey[match] || match);
  }
  return txt;
};
