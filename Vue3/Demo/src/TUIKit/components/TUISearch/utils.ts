import TUIChatEngine, {
  TUIFriendService,
  TUIConversationService,
  TUIGroupService,
  TUIChatService,
  TUITranslateService,
  SearchCloudMessagesParams,
  IGroupModel,
  TUIStore,
  StoreName,
  IMessageModel,
} from '@tencentcloud/chat-uikit-engine';
import { ISearchCloudMessageResult, IFriendType, ISearchResultListItem, IUserProfile } from '../../interface';
import { searchMessageTypeList } from './search-type-list';
import { Toast, TOAST_TYPE } from '../common/Toast/index';
import { messageTypeAbstractMap } from './type';
import { isUniFrameWork } from '../../utils/env';
import { TUIGlobal } from '@tencentcloud/universal-api';

/**************************************
 * TUISearch search logic
 **************************************/

export const searchCloudMessages = (
  params: SearchCloudMessagesParams,
): Promise<{ data: ISearchCloudMessageResult }> => {
  return TUIChatService.searchCloudMessages(params)
    .then((imResponse) => {
      return imResponse;
    })
    .catch((error) => {
      Toast({
        message: TUITranslateService.t('TUISearch.消息云端搜索失败：') + error?.message,
        type: TOAST_TYPE.ERROR,
        duration: 3000,
      });
      return null;
    });
};

export const searchFriends = (userIDList: any[]): Promise<any[]> => {
  // Only show users who are already friends
  return TUIFriendService.getFriendProfile({ userIDList })
    .then((imResponse) => {
      return imResponse;
    })
    .catch((error) => {
      console.warn('search user failed:', error?.message);
      Toast({
        message: TUITranslateService.t('TUISearch.查找联系人失败：') + error?.message,
        type: TOAST_TYPE.ERROR,
        duration: 1000,
      });
      return null;
    });
};

// Search all joined group chats
export const searchGroups = (groupIDList: any[]): Promise<any[]> => {
  const promiseList: any[] = [];
  groupIDList.forEach((groupID: string) => {
    const promise = TUIGroupService.searchGroupByID(groupID)
      .then((imResponse) => {
        // Only show joined group chats
        if (imResponse?.data?.group?.isJoinedGroup) {
          return imResponse?.data?.group;
        }
      })
      .catch((error) => {
        console.warn('search group failed:', error?.message);
      });
    promiseList.push(promise);
  });
  return Promise.all(promiseList)
    .then((imResponse) => {
      return imResponse.filter(x => x !== undefined);
    })
    .catch((error) => {
      Toast({
        message: TUITranslateService.t('TUISearch.查找群聊失败：') + error?.message,
        type: TOAST_TYPE.ERROR,
        duration: 1000,
      });
      return [];
    });
};

/**************************************
 * TUISearch interaction logic
 **************************************/
// switch conversation
export const enterConversation = (item: { conversationID?: string; groupID?: string; userID?: string }) => {
  const conversationID
    = item?.conversationID || (item?.groupID ? `GROUP${item?.groupID}` : `C2C${item?.userID}`);
  TUIConversationService.switchConversation(conversationID)
    .then(() => {
      TUIStore.update(StoreName.SEARCH, 'currentSearchingStatus', {
        isSearching: false,
        searchType: 'global',
      });
      TUIStore.update(StoreName.SEARCH, 'currentSearchInputValue', {
        value: '',
        searchType: 'global',
      });
      isUniFrameWork && TUIGlobal?.navigateTo({
        url: '/TUIKit/components/TUIChat/index',
      });
    })
    .catch((error) => {
      console.warn('switch conversation failed:', error?.message);
      Toast({
        message: TUITranslateService.t('TUISearch.进入会话失败'),
        type: TOAST_TYPE.ERROR,
        duration: 1000,
      });
    });
};

/**************************************
 * TUISearch UI display logic
 **************************************/
export const generateSearchResultShowName = (result: IMessageModel | ISearchResultListItem | IGroupModel | IFriendType | IUserProfile, resultContent: Record<string, string>): string => {
  if (!result) {
    return '';
  }
  if ((result as IMessageModel).ID) {
    return resultContent?.showName;
  }
  if ((result as IGroupModel).groupID) {
    return (result as IGroupModel).name || (result as IGroupModel).groupID;
  }
  if ((result as IFriendType | IUserProfile).userID) {
    return (result as IFriendType).remark || (result as IUserProfile).nick || (result as IFriendType).userID || '';
  }
  if ((result as ISearchResultListItem).conversation?.conversationID) {
    if (typeof (result as ISearchResultListItem).conversation.getShowName === 'function') {
      return (result as ISearchResultListItem).conversation.getShowName();
    } else {
      return TUIStore.getConversationModel((result as ISearchResultListItem).conversation.conversationID)?.getShowName?.() || (result as ISearchResultListItem).conversation.conversationID;
    }
  }
  return '';
};

export const generateSearchResultAvatar = (result: IMessageModel | ISearchResultListItem | IGroupModel | IFriendType | IUserProfile): string => {
  if (!result) {
    return '';
  }
  if ((result as IMessageModel).ID) {
    return (result as IMessageModel).avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png';
  }
  if ((result as IGroupModel).groupID) {
    return (result as IGroupModel).avatar || `https://web.sdk.qcloud.com/im/assets/images/${(result as IGroupModel)?.type}.svg`;
  }
  if ((result as IUserProfile).userID) {
    return (result as IUserProfile).avatar || 'https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png';
  }
  if ((result as ISearchResultListItem)?.conversation?.conversationID) {
    if (typeof (result as ISearchResultListItem).conversation.getAvatar === 'function') {
      return (result as ISearchResultListItem).conversation?.getAvatar();
    } else {
      return TUIStore.getConversationModel((result as ISearchResultListItem).conversation.conversationID)?.getAvatar?.();
    }
  }
  return '';
};

// Generate the search results and display the content (including highlighting the keyword content matches)
export const generateSearchResultShowContent = (
  result: IMessageModel | ISearchResultListItem | IGroupModel | IUserProfile,
  resultType: string,
  keywordList: any[],
  isTypeShow = true,
): any[] => {
  if ((result as IGroupModel)?.groupID) {
    return [
      { text: 'groupID: ', isHighlight: false },
      { text: (result as IGroupModel).groupID, isHighlight: true },
    ];
  }
  if ((result as IUserProfile)?.userID) {
    return [
      { text: 'userID: ', isHighlight: false },
      { text: (result as IUserProfile).userID, isHighlight: true },
    ];
  }
  if ((result as ISearchResultListItem)?.conversation || (result as IMessageModel)?.flow) {
    if ((result as ISearchResultListItem)?.messageCount === 1 || (result as IMessageModel)?.flow) {
      // Single message summary display result:
      // Text message, display message content + keyword highlight
      // File type message, display [file] file name + keyword highlight
      // Custom type message, display [custom message] description + keyword highlight
      // Other types of messages, display [message type]
      const message: IMessageModel = (result as IMessageModel)?.flow
        ? (result as IMessageModel)
        : (result as ISearchResultListItem)?.messageList[0];
      const text
        = message?.payload?.text || message?.payload?.fileName || message?.payload?.description;
      const abstract: any[] = [];
      if (message?.type && isTypeShow && message.type !== TUIChatEngine.TYPES.MSG_TEXT) {
        abstract.push({
          text: TUITranslateService.t(`TUISearch.${messageTypeAbstractMap[message.type]}`),
          isHighlight: false,
        });
      }
      abstract.push(...generateMessageContentHighlight(text, keywordList));
      return abstract;
    } else {
      return [
        {
          text: `${(result as ISearchResultListItem)?.messageCount}${TUITranslateService.t(
            'TUISearch.条相关',
          )}${TUITranslateService.t(
            `TUISearch.${resultType === 'allMessage' ? '结果' : searchMessageTypeList[resultType]?.label
            }`,
          )}`,
          isHighlight: false,
        },
      ];
    }
  }
  return [];
};

// Parse the search message results [highlight keywords] position
export const generateMessageContentHighlight = (
  content: string,
  keywordList: any[],
): any[] => {
  if (!content || !keywordList || !keywordList.length) {
    return [{ text: content || '', isHighlight: false }];
  }
  // Get the start and end positions of all key matches
  const matches: any[] = [];
  for (let i = 0; i < keywordList.length; i++) {
    // Special character translation
    const substring = keywordList[i]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(substring, 'gi'); // Global search and ignore case
    let match;

    while ((match = regex.exec(content)) !== null) {
      const start: number = match.index;
      const end: number = match.index + match[0].length - 1;
      matches.push([start, end]);
    }
  }
  // Merge repeated range results and arrange them in order of smallest arrival, for example, [[1,3],[2,4]] is merged into [[1,4]]
  const mergedRanges = [matches[0]];
  if (matches.length > 1) {
    matches.sort((a: any[], b: any[]) => a[0] - b[0]);
    // const mergedRanges = [matches[0]];
    for (let i = 1; i < matches.length; i++) {
      const currentRange = matches[i];
      const lastMergedRange = mergedRanges[mergedRanges.length - 1];
      // currentRange[0] - 1 is to handle the special case where [[1,2],[3,4]] can be merged into [[1,4]]
      if (currentRange[0] - 1 <= lastMergedRange[1]) {
        lastMergedRange[1] = Math.max(lastMergedRange[1], currentRange[1]);
      } else {
        mergedRanges.push(currentRange);
      }
    }
  }
  if (!mergedRanges[0]) {
    return [{ text: content, isHighlight: false }];
  }
  // Split the original content string according to the highlight range and add highlight related identification fields
  const contentArray: any[] = [];
  let start = 0;
  for (let i = 0; i < mergedRanges.length; i++) {
    const str1 = content.substring(start, mergedRanges[i][0]);
    str1 && contentArray.push({ text: str1, isHighlight: false });
    const str2 = content.substring(mergedRanges[i][0], mergedRanges[i][1] + 1);
    str2 && contentArray.push({ text: str2, isHighlight: true });
    start = mergedRanges[i][1] + 1;
  }
  // Add the last string
  const lastStr = content.substring(start);
  lastStr && contentArray.push({ text: lastStr, isHighlight: false });
  return contentArray;
};

// calculate timestamp
export const generateSearchResultTime = (timestamp: number): string => {
  const todayZero = new Date().setHours(0, 0, 0, 0);
  const thisYear = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
  const target = new Date(timestamp);

  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const diff = todayZero - target.getTime();

  function formatNum(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  if (diff <= 0) {
    // today, only display hour:minute
    return `${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
  } else if (diff <= oneDay) {
    // yesterday, display yesterday:hour:minute
    return `${TUITranslateService.t('time.昨天')} ${formatNum(target.getHours())}:${formatNum(
      target.getMinutes(),
    )}`;
  } else if (diff <= oneWeek - oneDay) {
    // Within a week, display weekday hour:minute
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[target.getDay()];
    return `${TUITranslateService.t('time.' + weekday)} ${formatNum(target.getHours())}:${formatNum(
      target.getMinutes(),
    )}`;
  } else if (target.getTime() >= thisYear) {
    // Over a week, within this year, display mouth/day hour:minute
    return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(
      target.getHours(),
    )}:${formatNum(target.getMinutes())}`;
  } else {
    // Not within this year, display year/mouth/day hour:minute
    return `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()} ${formatNum(
      target.getHours(),
    )}:${formatNum(target.getMinutes())}`;
  }
};

// Calculated date functions
export const generateSearchResultYMD = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return `${year}-${month}-${day}`; // Returns a string in year-month-day format
};

export const debounce = <F extends (...args: any[]) => void>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
};
