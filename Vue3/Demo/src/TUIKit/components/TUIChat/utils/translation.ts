import {
  IMessageModel,
  TUIChatService,
  TUIUserService,
} from '@tencentcloud/chat-uikit-engine';
import { IChatResponese, IUserProfile } from '../../../interface';

export class Translator {
  // map for messageID to translated text
  private static translationCache = new Map<string, string>();

  static get(message: IMessageModel): Promise<string> {
    const {
      ID: messageID,
      atUserList = [],
    } = message;
    const text = message.payload?.text || '';
    return new Promise((resolve, reject) => {
      // try to get from cache
      const translatedText = Translator.translationCache.get(messageID);
      if (translatedText !== undefined) {
        resolve(translatedText);
        return;
      }

      // get from api
      if (Array.isArray(atUserList) && atUserList.length > 0) {
        TUIUserService.getUserProfile({
          userIDList: atUserList,
        }).then((response: IChatResponese<IUserProfile[]>) => {
          const { data: userProfileList } = response;
          const splitString = userProfileList.map((user) => {
            return `@${user.nick || user.userID}`;
          });
          const { transSplitingList, atNickList } = Translator.getSplitedStringByAtList(text, splitString);
          transSplitingList.forEach((text, index) => {
            // trim white space
            transSplitingList[index] = text.trim();
          });
          TUIChatService.translateText({
            sourceTextList: transSplitingList,
            sourceLanguage: 'auto',
          })
            .then((response: IChatResponese<{ translatedTextList: string[] }>) => {
              const {
                data: { translatedTextList },
              } = response;
              const translation = translatedTextList.reduce((prev, curr, index) => {
                if (index < atNickList.length) {
                  return prev + curr + ` ${atNickList[index]} `;
                }
                return prev + curr;
              }, '').trim();
              Translator.translationCache.set(messageID, translation);
              resolve(translation);
            })
            .catch((error) => {
              reject(error);
            });
        }).catch((error) => {
          reject(error);
        });
      } else {
        // resolve no atUserList
        TUIChatService.translateText({
          sourceTextList: [text],
          sourceLanguage: 'auto',
        })
          .then((response: IChatResponese<{ translatedTextList: string[] }>) => {
            const {
              data: { translatedTextList },
            } = response;
            Translator.translationCache.set(messageID, translatedTextList[0]);
            resolve(translatedTextList[0]);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  }

  static clear() {
    Translator.translationCache.clear();
  }

  static getSplitedStringByAtList(text: string, splitString: string[]): { transSplitingList: string[]; atNickList: string[] } {
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
        if (pos !== -1) {
          // if found
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
