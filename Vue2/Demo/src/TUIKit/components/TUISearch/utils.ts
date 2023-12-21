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
} from "@tencentcloud/chat-uikit-engine";
import { ISearchResultListItem, IFriendType } from "../../interface";
import { searchMessageTypeList } from "./search-type-list";
import { Toast, TOAST_TYPE } from "../common/Toast/index";
import { messageTypeAbstractMap } from "./type";

/**************************************
 * TUISearch 搜索逻辑
 **************************************/

// 消息云端搜索
export const searchCloudMessages = (
  params: SearchCloudMessagesParams
): Promise<Array<ISearchResultListItem>> => {
  return TUIChatService.searchCloudMessages(params)
    .then((imResponse: any) => {
      return imResponse;
    })
    .catch((error: any) => {
      Toast({
        message: TUITranslateService.t("TUISearch.消息云端搜索失败：") + error?.message,
        type: TOAST_TYPE.ERROR,
        duration: 3000,
      });
      return null;
    });
};

// 联系人搜索
export const searchFriends = (userIDList: Array<string>): Promise<Array<IFriendType>> => {
  // 仅展示已存在好友关系的用户
  return TUIFriendService.getFriendProfile({ userIDList })
    .then((imResponse: any) => {
      return imResponse;
    })
    .catch((error: any) => {
      console.warn("search user failed:", error?.message);
      Toast({
        message: TUITranslateService.t("TUISearch.查找联系人失败：") + error?.message,
        type: TOAST_TYPE.ERROR,
        duration: 1000,
      });
      return null;
    });
};

// 搜索所有已加入群聊
export const searchGroups = (groupIDList: Array<string>): Promise<Array<IGroupModel>> => {
  // searchGroupList.value = [];
  const promiseList: Array<Promise<any>> = [];
  groupIDList.forEach((groupID: string) => {
    // todo: 此处需等待engine searchGroupByID 包裹好结果后，替换为 searchGroupByID 接口
    let promise = TUIGroupService.searchGroupByID(groupID)
      .then((imResponse: any) => {
        // 仅展示已加入的群聊
        if (imResponse?.data?.group?.isJoinedGroup) {
          return imResponse?.data?.group;
        }
      })
      .catch((error: any) => {
        console.warn("search group failed:", error?.message);
      });
    promiseList.push(promise);
  });
  return Promise.all(promiseList)
    .then((imResponse: any) => {
      return imResponse.filter((x: any) => x !== undefined);
    })
    .catch((error: any) => {
      Toast({
        message: TUITranslateService.t("TUISearch.查找群聊失败：") + error?.message,
        type: TOAST_TYPE.ERROR,
        duration: 1000,
      });
      return [];
    });
};

/**************************************
 * TUISearch 交互逻辑
 **************************************/
// 切换会话
export const enterConversation = (item: any) => {
  const conversationID =
    item?.conversationID || (item?.groupID ? `GROUP${item?.groupID}` : `C2C${item?.userID}`);
  TUIConversationService.switchConversation(conversationID)
    .then(() => {
      TUIStore.update(StoreName.CUSTOM, "currentSearchingStatus", {
        isSearching: false,
        searchType: "global",
      });
      TUIStore.update(StoreName.CUSTOM, "currentSearchInputValue", {
        value: "",
        searchType: "global",
      });
    })
    .catch((error: any) => {
      console.warn("switch conversation failed:", error?.message);
      Toast({
        message: TUITranslateService.t("TUISearch.进入会话失败"),
        type: TOAST_TYPE.ERROR,
        duration: 1000,
      });
    });
};

/**************************************
 * TUISearch UI展示逻辑
 **************************************/
// 解析搜索结果展示名称
export const generateSearchResultShowName = (result: any, resultContent: any): string => {
  if (result?.ID) {
    return resultContent?.showName;
  }
  if (result?.groupID) {
    return result?.groupName || result?.groupID;
  }
  if (result?.userID) {
    return result?.remark || result?.nick || result?.name || result?.userID;
  }
  if (result?.conversation) {
    // todo: 此处后续需要验证 uniapp 中 conversationModel 是否会失去原型导致解析失败
    return result?.conversation?.getShowName();
  }
  return "";
};

// 解析搜索结果展示头像
export const generateSearchResultAvatar = (result: any, resultContent: any): string => {
  if (result?.ID) {
    return result?.avatar || "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png";
  }
  if (result?.groupID) {
    return result?.avatar || `https://web.sdk.qcloud.com/im/assets/images/${result?.type}.svg`;
  }
  if (result?.userID) {
    return result?.avatar || "https://web.sdk.qcloud.com/component/TUIKit/assets/avatar_21.png";
  }
  if (result?.conversation) {
    // todo: 此处后续需要验证 uniapp 中 conversationModel 是否会失去原型导致解析失败
    return result.conversation?.getAvatar();
  }
  return "";
};

// 解析搜索结果展示内容（包含对于关键词内容匹配高亮）
export const generateSearchResultShowContent = (
  result: any,
  resultType: string,
  keywordList: Array<string>,
  isTypeShow = true // 除文本消息以外类型消息是否需要类型前缀
): Array<{ text: string; isHighlight: boolean }> => {
  if (result?.groupID) {
    return [
      { text: "groupID: ", isHighlight: false },
      { text: result?.groupID, isHighlight: true },
    ];
  }
  if (result?.userID) {
    return [
      { text: "userID: ", isHighlight: false },
      { text: result?.userID, isHighlight: true },
    ];
  }
  if (result?.conversation || result?.flow) {
    if (result?.messageCount === 1 || result?.flow) {
      // 单条消息摘要显示结果：
      // 文本消息，显示消息内容+关键词高亮
      // 文件类型消息，显示[文件]文件名+关键词高亮
      // 自定义类型消息，显示[自定义消息]description+关键词高亮
      // 其他类型消息，显示[消息类型]
      const message = result?.flow ? result : result?.messageList[0];
      const text =
        message?.payload?.text || message?.payload?.fileName || message?.payload?.description;
      const abstract: Array<{ text: string; isHighlight: boolean }> = [];
      if (message?.type !== TUIChatEngine.TYPES.MSG_TEXT && isTypeShow) {
        abstract.push({
          text: TUITranslateService.t(`TUISearch.${messageTypeAbstractMap[message?.type]}`),
          isHighlight: false,
        });
      }
      abstract.push(...generateMessageContentHighlight(text, keywordList));
      return abstract;
    } else {
      return [
        {
          text: `${result?.messageCount}${TUITranslateService.t(
            "TUISearch.条相关"
          )}${TUITranslateService.t(
            `TUISearch.${
              resultType === "allMessage" ? "结果" : searchMessageTypeList[resultType]?.label
            }`
          )}`,
          isHighlight: false,
        },
      ];
    }
  }
  return [];
};

// 解析搜索消息结果【高亮关键词】位置
export const generateMessageContentHighlight = (
  content: string,
  keywordList: Array<string>
): Array<{ text: string; isHighlight: boolean }> => {
  if (!content || !keywordList || !keywordList.length) {
    return [{ text: content || "", isHighlight: false }];
  }
  //  获取所有 key 匹配的开始与结束位置
  const matches = [];
  for (let i = 0; i < keywordList.length; i++) {
    // 特殊字符转译
    const substring = keywordList[i]?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(substring, "gi"); // 全局搜索并且忽略大小写
    let match;

    while ((match = regex.exec(content)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length - 1;
      matches.push([start, end]);
    }
  }
  // 合并重复范围结果, 并按照从小到达排列，比如 [[1,3],[2,4]]合并为[[1,4]]
  const mergedRanges = [matches[0]];
  if (matches.length > 1) {
    matches.sort((a: Array<number>, b: Array<number>) => a[0] - b[0]);
    // const mergedRanges = [matches[0]];
    for (let i = 1; i < matches.length; i++) {
      const currentRange = matches[i];
      const lastMergedRange = mergedRanges[mergedRanges.length - 1];
      // currentRange[0] - 1 是为了处理[[1,2],[3,4]]能合并为[[1,4]]的特殊情况
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
  // 根据高亮范围分割原内容字符串，增加highlight相关标识字段
  const contentArray = [];
  let start = 0;
  for (let i = 0; i < mergedRanges.length; i++) {
    let str1 = content.substring(start, mergedRanges[i][0]);
    str1 && contentArray.push({ text: str1, isHighlight: false });
    let str2 = content.substring(mergedRanges[i][0], mergedRanges[i][1] + 1);
    str2 && contentArray.push({ text: str2, isHighlight: true });
    start = mergedRanges[i][1] + 1;
  }
  // 添加结尾最后一段
  let lastStr = content.substring(start);
  lastStr && contentArray.push({ text: lastStr, isHighlight: false });
  return contentArray;
};

// 计算时间戳函数
// calculate timestamp
export const generateSearchResultTime = (timestamp: number): string => {
  const todayZero = new Date().setHours(0, 0, 0, 0);
  const thisYear = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0).getTime();
  const target = new Date(timestamp);

  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const diff = todayZero - target.getTime();

  function formatNum(num: number): string {
    return num < 10 ? "0" + num : num.toString();
  }

  if (diff <= 0) {
    // today, only display hour:minute
    return `${formatNum(target.getHours())}:${formatNum(target.getMinutes())}`;
  } else if (diff <= oneDay) {
    // yesterday, display yesterday:hour:minute
    return `${TUITranslateService.t("time.昨天")} ${formatNum(target.getHours())}:${formatNum(
      target.getMinutes()
    )}`;
  } else if (diff <= oneWeek - oneDay) {
    // Within a week, display weekday hour:minute
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const weekday = weekdays[target.getDay()];
    return `${TUITranslateService.t("time." + weekday)} ${formatNum(target.getHours())}:${formatNum(
      target.getMinutes()
    )}`;
  } else if (target.getTime() >= thisYear) {
    // Over a week, within this year, display mouth/day hour:minute
    return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(
      target.getHours()
    )}:${formatNum(target.getMinutes())}`;
  } else {
    // Not within this year, display year/mouth/day hour:minute
    return `${target.getFullYear()}/${target.getMonth() + 1}/${target.getDate()} ${formatNum(
      target.getHours()
    )}:${formatNum(target.getMinutes())}`;
  }
};

// 计算日期函数
export const generateSearchResultYMD = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // 将时间戳转换为毫秒
  const year = date.getFullYear(); // 获取年份
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // 获取月份，并补零
  const day = ("0" + date.getDate()).slice(-2); // 获取日期，并补零

  return `${year}-${month}-${day}`; // 返回年月日格式的字符串
};

export const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
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
