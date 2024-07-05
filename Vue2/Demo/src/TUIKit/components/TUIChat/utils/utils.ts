import TUIChatEngine, { TUITranslateService, TUIStore, StoreName, IMessageModel } from '@tencentcloud/chat-uikit-engine';

export function deepCopy(data: any, hash = new WeakMap()) {
  if (typeof data !== 'object' || data === null || data === undefined) {
    return data;
  }
  if (hash.has(data)) {
    return hash.get(data);
  }
  const newData: any = Object.create(Object.getPrototypeOf(data));
  const dataKeys = Object.keys(data);
  dataKeys.forEach((value) => {
    const currentDataValue = data[value];
    if (typeof currentDataValue !== 'object' || currentDataValue === null) {
      newData[value] = currentDataValue;
    } else if (Array.isArray(currentDataValue)) {
      newData[value] = [...currentDataValue];
    } else if (currentDataValue instanceof Set) {
      newData[value] = new Set([...currentDataValue]);
    } else if (currentDataValue instanceof Map) {
      newData[value] = new Map([...currentDataValue]);
    } else {
      hash.set(data, data);
      newData[value] = deepCopy(currentDataValue, hash);
    }
  });
  return newData;
}

export const handleSkeletonSize = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } => {
  const widthToHeight = width / height;
  const maxWidthToHeight = maxWidth / maxHeight;
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }
  if (
    (width <= maxWidth && height > maxHeight)
    || (width > maxWidth && height > maxHeight && widthToHeight <= maxWidthToHeight)
  ) {
    return { width: width * (maxHeight / height), height: maxHeight };
  }
  return { width: maxWidth, height: height * (maxWidth / width) };
};

// Image loading complete
export function getImgLoad(container: any, className: string, callback: any) {
  const images = container?.querySelectorAll(`.${className}`) || [];
  const promiseList = Array.prototype.slice.call(images).map((node: any) => {
    return new Promise((resolve: any) => {
      node.onload = () => {
        resolve(node);
      };
      node.onloadeddata = () => {
        resolve(node);
      };
      node.onprogress = () => {
        resolve(node);
      };
      if (node.complete) {
        resolve(node);
      }
    });
  });
  return Promise.all(promiseList)
    .then(() => {
      callback && callback();
    })
    .catch((e) => {
      console.error('网络异常', e);
    });
}

export const isCreateGroupCustomMessage = (message: IMessageModel) => {
  return (
    message.type === TUIChatEngine.TYPES.MSG_CUSTOM
    && message?.getMessageContent()?.businessID === 'group_create'
  );
};

/**
 * displayMessageReadReceipt: User-level control to display message read status
 * After turning off, the messages you send and receive will not have message read status
 * You will not be able to see whether the other party has read their messages, and they will also not be able to see whether you have read the messages they sent
 *
 * enabledMessageReadReceipt: App-level setting to enable read receipts
 * @return {boolean} - Returns a boolean value indicating if the message read receipt is enabled globally.
 */
export function isEnabledMessageReadReceiptGlobal(): boolean {
  return TUIStore.getData(StoreName.USER, 'displayMessageReadReceipt')
    && TUIStore.getData(StoreName.APP, 'enabledMessageReadReceipt');
}

export function shallowCopyMessage(message: IMessageModel) {
  return Object.assign({}, message);
}

// calculate timestamp
export function calculateTimestamp(timestamp: number): string {
  const todayZero = new Date().setHours(0, 0, 0, 0);
  const thisYear = new Date(
    new Date().getFullYear(),
    0,
    1,
    0,
    0,
    0,
    0,
  ).getTime();
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
    return `${TUITranslateService.t('time.昨天')} ${formatNum(
      target.getHours(),
    )}:${formatNum(target.getMinutes())}`;
  } else if (diff <= oneWeek - oneDay) {
    // Within a week, display weekday hour:minute
    const weekdays = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ];
    const weekday = weekdays[target.getDay()];
    return `${TUITranslateService.t('time.' + weekday)} ${formatNum(
      target.getHours(),
    )}:${formatNum(target.getMinutes())}`;
  } else if (target.getTime() >= thisYear) {
    // Over a week, within this year, display mouth/day hour:minute
    return `${target.getMonth() + 1}/${target.getDate()} ${formatNum(
      target.getHours(),
    )}:${formatNum(target.getMinutes())}`;
  } else {
    // Not within this year, display year/mouth/day hour:minute
    return `${target.getFullYear()}/${
      target.getMonth() + 1
    }/${target.getDate()} ${formatNum(target.getHours())}:${formatNum(
      target.getMinutes(),
    )}`;
  }
}
