import TUIChatEngine, {
  IMessageModel,
  TUIChatService,
  TUIStore,
  TUITranslateService,
  TUIUserService,
} from '@tencentcloud/chat-uikit-engine';
import { IChatResponese, IUserProfile } from '../../../interface';

/**
 * three type for origin text to be translated
 * 1. image: small face text
 * 2. text: plain text
 * 3. mention: mention '@'
 */
interface ITextFace {
  type: 'face';
  value: string;
}

interface ITextPlain {
  type: 'text';
  value: string;
}

interface ITextAt {
  type: 'mention';
  value: string;
}

export type TranslationTextType = ITextFace | ITextPlain | ITextAt;

class Translator {
  public isUseCache = true;
  private translationCache = new Map<string, TranslationTextType[]>();
  private static instance: Translator | undefined = undefined;

  private constructor() {}

  static getInstance() {
    if (!Translator.instance) {
      Translator.instance = new Translator();
    }
    return Translator.instance;
  }

  async get(message: IMessageModel): Promise<TranslationTextType[]> {
    // step1: check in cache if translation exist
    if (this.isUseCache) {
      const cache = this.translationCache.get(message.ID);
      if (cache !== undefined) {
        return cache;
      }
    }

    // step2: get message model with prototype methods
    const currentMessage: IMessageModel = TUIStore.getMessageModel(message.ID);
    if (!currentMessage) {
      return [];
    }

    const { text } = currentMessage.getMessageContent() || {};
    const textList: TranslationTextType[] = [];
    const splittingList = await this.getNickList(currentMessage);
    // step3: Categorize origin messages to 'plain text', 'face', 'mention'
    for (let i = 0; i < text.length; ++i) {
      const item = text[i];
      if (item.name === 'img') {
        textList.push({ type: 'face', value: item.src });
        continue;
      }
      const { transSplitingList, atNickList } = this.getSplitResult(item.text, splittingList);
      for (let j = 0; j < transSplitingList.length; ++j) {
        textList.push({ type: 'text', value: transSplitingList[j] });
        if (j < atNickList.length) {
          textList.push({ type: 'mention', value: atNickList[j] });
        }
      }
    }

    // step4: filter plain text to be translated
    const needTranslateTextIndex: number[] = [];
    const needTranslateText = textList.filter((item, index) => {
      if (item.type === 'text' && item.value.trim() !== '') {
        needTranslateTextIndex.push(index);
        return true;
      }
      return false;
    }).map(item => item.value);

    if (needTranslateText.length === 0) {
      this.translationCache.set(currentMessage.ID, textList);
      return textList;
    }
    // step5: get final translation result
    const translationResult = await this.getTranslationStandard(needTranslateText) as string[];
    translationResult.forEach((item, index) => {
      textList[needTranslateTextIndex[index]].value = item;
    });

    // step6: cache translation result
    this.translationCache.set(currentMessage.ID, textList);
    return textList;
  }

  /**
   * Clears the translation cache.
   */
  clear() {
    this.translationCache.clear();
  }

  disableCache() {
    this.isUseCache = false;
  }

  enableCache() {
    this.isUseCache = true;
  }

  private getTranslationStandard(originTextList: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      TUIChatService.translateText({
        sourceTextList: originTextList,
        sourceLanguage: 'auto',
      })
        .then((response: IChatResponese<{ translatedTextList: string[] }>) => {
          const {
            data: { translatedTextList },
          } = response;
          resolve(translatedTextList);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * the nick list is used to split the text by @ + {nick or userID}
   * @param message
   * @returns e.g. ['@james', '@john']
   */
  private async getNickList(message: IMessageModel): Promise<string[]> {
    const splittingList: string[] = [];
    const { atUserList = [] } = message;
    const atAllID: string = TUIChatEngine.TYPES.MSG_AT_ALL;
    if (atUserList.includes(atAllID)) {
      splittingList.push(`@${TUITranslateService.t('TUIChat.所有人')}`);
    }
    if (atUserList.length > 0) {
      const { data: userProfileList } = await TUIUserService.getUserProfile({ userIDList: atUserList }) as IChatResponese<IUserProfile[]>;
      userProfileList.forEach((user) => {
        const atNick = `@${user.nick || user.userID}`;
        splittingList.push(atNick);
      });
    }
    return [...new Set(splittingList)];
  }

  /**
   * Splits the given text into substrings based on the provided splitString array.
   *
   * @param {string} text - The text to be split.
   * @param {string[]} splitString - The array of strings to split the text by.
   * @return {{ transSplitingList: string[]; atNickList: string[] }} - An object containing two arrays:
   *   - transSplitingList: An array of substrings extracted from the text.
   *   - atNickList: An array of split strings that were found in the text.
   */
  private getSplitResult(text: string, splitString: string[]): { transSplitingList: string[]; atNickList: string[] } {
    let searchStartPos = 0;
    const transSplitingList: string[] = [];
    const atNickList: string[] = [];
    while (searchStartPos < text.length) {
      const nextAtCharPos = text.indexOf('@', searchStartPos);
      if (nextAtCharPos === -1) {
        transSplitingList.push(text.substring(searchStartPos));
        break;
      }
      let found = false;
      for (let i = 0; i < splitString.length; ++i) {
        const pos = text.indexOf(splitString[i], nextAtCharPos);
        if (pos !== -1 && pos === nextAtCharPos) {
          transSplitingList.push(text.substring(searchStartPos, pos));
          atNickList.push(splitString[i]);
          searchStartPos = pos + splitString[i].length;
          found = true;
          break;
        }
      }
      if (!found) {
        transSplitingList.push(text.substring(searchStartPos));
        break;
      }
    }
    return {
      transSplitingList,
      atNickList,
    };
  }
}

export const translator = Translator.getInstance();
