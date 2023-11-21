import { isUniFrameWork } from '../env';

interface IDomRect {
  id: string;
  top: number;
  left: number;
  right: number;
  width: number;
  bottom: number;
  height: number;
  x?: number;
  y?: number;
}

interface IScrollInfo {
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  id: string;
}

interface IFields {
  [key: string] :any;
}

declare const uni: any;

type registeredPage = 'messageList';

export const instanceMapping = new Map<registeredPage, any>();

/**
 * 
 * @param selector string: e.g. #app | .class
 * @param instanceName string
 * @returns Promise<IDomRect>
 */
export function getBoundingClientRect(selector: string | HTMLElement, instanceName?: registeredPage): Promise<IDomRect> {
  if (!selector) return Promise.reject(new Error(`getBoundingClientRect() get error selector ${typeof selector}.`));

  if (window || document) {
    const dom: HTMLElement | null = typeof selector === 'object' ? selector : document.querySelector(selector);
    if (!dom) return Promise.reject(new Error(`getBoundingClientRect() can't find ${selector} dom.`));
    const domRect = dom.getBoundingClientRect();
    return Promise.resolve({
      id: dom.id,
      top: domRect.top,
      left: domRect.left,
      right: domRect.right,
      bottom: domRect.bottom,
      width: domRect.width,
      height: domRect.height,
      x: domRect.x,
      y: domRect.y,
    });
  }

  if (isUniFrameWork) {
    if (!instanceName) return Promise.reject(new Error('uni.getBoundingClientRect() need instanceName in params.'));
    const _query = uni.createSelectorQuery().in(instanceMapping.get(instanceName));
    return new Promise((resolve, reject) => {
      _query.select(selector).boundingClientRect((data: IDomRect) => {
        if (data) {
          resolve(data);
        }
      }).exec();
      setTimeout(() => reject(new Error(`uni.getBoundingClientRect(${selector}) timeout.`)), 500);
    });
  }

  return Promise.reject(new Error('getBoundingClientRect() occur error'));
}

export function getBoundingClientRectSync(selector: string | HTMLElement): IDomRect {
  if (isUniFrameWork) {
    throw new Error("getBoundingClientRectSync() can not use in uni-app.");
  }

  if (window || document) {
    const dom: HTMLElement | null =
      typeof selector === "object"
        ? selector
        : document.querySelector(selector);
    if (!dom)
      throw new Error(`getBoundingClientRectSync() can't find ${selector} dom.`);
    const domRect = dom.getBoundingClientRect();
    return {
      id: dom.id,
      top: domRect.top,
      left: domRect.left,
      right: domRect.right,
      bottom: domRect.bottom,
      width: domRect.width,
      height: domRect.height,
      x: domRect.x,
      y: domRect.y,
    };
  }

  throw new Error("getBoundingClientRectSync() occur error.");
}

/**
 * 
 * @param selector string: e.g. #app | .class
 * @param instanceName string
 * @returns Promise<IScrollInfo>
 */
export function getScrollInfo(selector: string | HTMLElement, instanceName?: registeredPage): Promise<IScrollInfo> {
  if (!selector) return Promise.reject(new Error(`getScrollInfo() get error selector ${typeof selector}.`));

  if (!isUniFrameWork && window) {
    const dom: HTMLElement | null = typeof selector === 'object' ? selector : document.querySelector(selector);
    if (!dom) return Promise.reject(new Error(`getScrollInfo() can't find ${selector} dom.`));
    return Promise.resolve({
      id: dom.id,
      scrollTop: dom.scrollTop,
      scrollLeft: dom.scrollLeft,
      scrollWidth: dom.scrollWidth,
      scrollHeight: dom.scrollHeight,
    });
  }

  if (isUniFrameWork) {
    if (!instanceName) return Promise.reject(new Error('uni.getScrollInfo() need instanceName in params.'));
    const _query = uni.createSelectorQuery().in(instanceMapping.get(instanceName));
    return new Promise((resolve, reject) => {
      _query.select(selector).scrollOffset((data: IScrollInfo) => {
        if (data) {
          resolve(data);
        }
      }).exec();
      setTimeout(() => reject(new Error(`uni.getScrollInfo(${selector}) timeout.`)), 500);
    });
  }

  return Promise.reject(new Error('getScrollInfo() occur error'));
}

export function getScrollInfoSync(selector: string | HTMLElement): IScrollInfo {
  if (isUniFrameWork) {
    throw new Error("getScrollInfoSync() can not use in uni-app.");
  }

  if (!isUniFrameWork && window) {
    const dom: HTMLElement | null =
      typeof selector === "object"
        ? selector
        : document.querySelector(selector);
    if (!dom)
      throw new Error(`getScrollInfoSync() can't find ${selector} dom.`);
    return {
      id: dom.id,
      scrollTop: dom.scrollTop,
      scrollLeft: dom.scrollLeft,
      scrollWidth: dom.scrollWidth,
      scrollHeight: dom.scrollHeight,
    };
  }

  throw new Error("getScrollInfoSync() occur error.");
}

export function getFields(selector: string | HTMLElement, instanceName?: registeredPage): Promise<IFields> {
  if (isUniFrameWork) {
    if (!instanceName) return Promise.reject(new Error('uni.getFields() need instanceName in params.'));
    const _query = uni.createSelectorQuery().in(instanceMapping.get(instanceName));
    return new Promise((resolve, reject) => {
      _query.select(selector).fields({
        rect: true,
        size: true,
        scrollOffset: true
      }, (data: IFields) => {
        if (data) {
          resolve(data);
        }
      }).exec();
      setTimeout(() => reject(new Error(`get ${selector} fields timeout.`)), 500);
    });
  }

  return Promise.reject(new Error('getFields() occur error'));
}