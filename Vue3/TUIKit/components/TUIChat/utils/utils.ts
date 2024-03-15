import TUIChatEngine, { TUITranslateService, TUIStore, StoreName, IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { Toast, TOAST_TYPE } from '../../common/Toast/index';

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
 * displayMessageReadReceipt 用户级别控制展示消息阅读状态
 * 关闭后 你收发的消息均不带消息阅读状态
 * 你将无法看到对方是否已读 同时对方也无法看到他发送的消息你是否已读
 *
 * enabledMessageReadReceipt app级别是否开启已读回执
 *
 * @return {boolean} - Returns a boolean value indicating if the message read receipt is enabled globally.
 */
export function isEnabledMessageReadReceiptGlobal(): boolean {
  return TUIStore.getData(StoreName.USER, 'displayMessageReadReceipt')
    && TUIStore.getData(StoreName.APP, 'enabledMessageReadReceipt');
}

export function shallowCopyMessage(message: IMessageModel) {
  return Object.assign({}, message);
}

export async function copyText(text: string) {
  const textString = text.toString();
  try {
    // 优先采用异步 copy navigator.clipboard 方案
    await navigator.clipboard.writeText(textString);
  } catch (err: any) {
    // 不支持 navigator.clipboard 时，走兼容替代方案
    copyTextByDocumentExecCommand(textString);
  }
}

function copyTextByDocumentExecCommand(textString: string) {
  const input = document.createElement('input');
  input.id = 'copy-input';
  input.readOnly = true; // Prevent IOS focus from triggering keyboard events
  input.style.position = 'absolute';
  input.style.left = '-1000px';
  input.style.zIndex = '-1000';
  document.body.appendChild(input);
  input.value = textString;
  selectText(input, 0, textString.length);
  if (document.execCommand('copy')) {
    document.execCommand('copy');
  } else {
    Toast({
      message: TUITranslateService.t('TUIChat.此机型暂不支持复制'),
      type: TOAST_TYPE.ERROR,
    });
  }
  input.blur();
}

function selectText(
  textbox: HTMLInputElement,
  startIndex: number,
  stopIndex: number,
) {
  if ((textbox as any).createTextRange) {
    // ie
    const range = (textbox as any).createTextRange();
    range.collapse(true);
    range.moveStart('character', startIndex); // start character
    range.moveEnd('character', stopIndex - startIndex); // end character
    range.select();
  } else {
    // firefox / chrome
    (textbox as any).setSelectionRange(startIndex, stopIndex);
    (textbox as any).focus();
  }
}
