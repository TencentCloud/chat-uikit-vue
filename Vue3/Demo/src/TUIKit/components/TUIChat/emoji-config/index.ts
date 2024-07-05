import { TUITranslateService } from '@tencentcloud/chat-uikit-engine';
import { CUSTOM_BASIC_EMOJI_URL, CUSTOM_BIG_EMOJI_URL, CUSTOM_BASIC_EMOJI_URL_MAPPING, CUSTOM_BIG_EMOJI_GROUP_LIST } from './custom-emoji';
import { DEFAULT_BASIC_EMOJI_URL, BIG_EMOJI_GROUP_LIST, DEFAULT_BASIC_EMOJI_URL_MAPPING, BASIC_EMOJI_NAME_TO_KEY_MAPPING, DEFAULT_BIG_EMOJI_URL } from './default-emoji';
import { default as emojiCNLocales } from './locales/zh_cn';
import { IEmojiGroupList } from '../../../interface';
import { EMOJI_TYPE } from '../../../constant';
import { isWeChat } from '../../../utils/env';

const hasCustomBasicEmoji = CUSTOM_BASIC_EMOJI_URL && Object.keys(CUSTOM_BASIC_EMOJI_URL_MAPPING).length;

const BASIC_EMOJI_URL = hasCustomBasicEmoji ? CUSTOM_BASIC_EMOJI_URL : DEFAULT_BASIC_EMOJI_URL;

const BASIC_EMOJI_URL_MAPPING = hasCustomBasicEmoji ? CUSTOM_BASIC_EMOJI_URL_MAPPING : DEFAULT_BASIC_EMOJI_URL_MAPPING;

const EMOJI_GROUP_LIST: IEmojiGroupList = [
  {
    emojiGroupID: 0,
    type: EMOJI_TYPE.BASIC,
    url: BASIC_EMOJI_URL,
    list: Object.keys(BASIC_EMOJI_URL_MAPPING),
  },
  ...BIG_EMOJI_GROUP_LIST,
  ...CUSTOM_BIG_EMOJI_GROUP_LIST,
];

/**
 * Converts a basic emoji key into its corresponding name.
 * Example:
 * '[Smile]' => '[TUIEmoji_Smile]'
 * @param {string} key - The emoji key.
 * @return {string} The corresponding emoji name.
 */
const convertKeyToEmojiName = (key: string): string => {
  // WeChat does not support emoji translation
  return isWeChat ? emojiCNLocales[key] : TUITranslateService.t(`Emoji.${key}`);
};

/**
 * Transforms a text containing emoji keys into a text with Chinese or English basic emoji names
 * Example:
 * 'hello[TUIEmoji_Smile]!' => 'hello[Smile]!''
 * @param {string} text - The text containing emoji keys.
 * @return {string} The transformed text with emoji keys replaced by emoji names.
 */
const transformTextWithKeysToEmojiNames = (text: string): string => {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let txt: string = text;
  if (reg.test(text)) {
    txt = text.replace(reg, match => BASIC_EMOJI_URL_MAPPING[match] ? convertKeyToEmojiName(match) : match);
  }
  return txt;
};

/**
 * Transforms a text containing Chinese or English basic emoji names into a text with emoji keys.
 * Example:
 * 'hello[Smile]!' => 'hello[TUIEmoji_Smile]!'
 * @param {string} text - The text containing emoji names.
 * @return {string} The transformed text with emoji names replaced by emoji keys.
 */
const transformTextWithEmojiNamesToKeys = (text: string) => {
  if (!text) {
    return '';
  }
  const reg = /(\[.+?\])/g;
  let txt: string = text;
  if (reg.test(text)) {
    txt = text.replace(reg, match => BASIC_EMOJI_NAME_TO_KEY_MAPPING[match] || match);
  }
  return txt;
};

/**
* The configuration aims to provide compatibility with versions prior to 2.2.0
*/
const emojiConfig = {
  emojiBaseUrl: BASIC_EMOJI_URL,
  emojiUrlMapping: BASIC_EMOJI_URL_MAPPING,
  emojiNameMapping: {
    ...emojiCNLocales,
  },
};

/**
 * Transform text message to renderable array contains image and text.
 * Example: hello[TUIEmoji_Smile], I am happy.
 * -> [{type: 'text', content: 'hello'}, {type: 'image', content: 'https://.../smile.png'}, {type: 'text', content: ', I am happy.'}]
 * @param text
 * @returns Array<{ type: 'text' | 'image'; content: string; emojiKey?: string; }>
 */
const parseTextToRenderArray = (text: string): Array<{ type: 'text' | 'image'; content: string; emojiKey?: string }> => {
  const emojiRegex = /\[([^\]]+)\]/g;
  const result: any[] = [];

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = emojiRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const endIndex = emojiRegex.lastIndex;
    const emojiKey = match[0];

    if (startIndex > lastIndex) {
      result.push({ type: 'text', content: text.substring(lastIndex, startIndex) });
    }

    const emojiUrl = BASIC_EMOJI_URL + BASIC_EMOJI_URL_MAPPING[emojiKey];
    if (emojiUrl) {
      result.push({ type: 'image', content: emojiUrl, emojiKey });
    } else {
      result.push({ type: 'text', content: emojiKey });
    }

    lastIndex = endIndex;
    emojiRegex.lastIndex = lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return result;
};

export {
  EMOJI_GROUP_LIST,
  CUSTOM_BIG_EMOJI_URL,
  DEFAULT_BIG_EMOJI_URL,
  CUSTOM_BASIC_EMOJI_URL,
  BASIC_EMOJI_URL_MAPPING,
  CUSTOM_BASIC_EMOJI_URL_MAPPING,
  convertKeyToEmojiName,
  parseTextToRenderArray,
  transformTextWithKeysToEmojiNames,
  transformTextWithEmojiNamesToKeys,
  emojiConfig,
};
