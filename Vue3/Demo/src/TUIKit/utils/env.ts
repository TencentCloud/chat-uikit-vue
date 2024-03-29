import { getPlatform } from '@tencentcloud/universal-api';
declare const uni: any;

export const isPC = getPlatform() === 'pc';

export const isH5 = getPlatform() === 'h5';

export const isWeChat = getPlatform() === 'wechat';

export const isApp = getPlatform() === 'app';

export const isUniFrameWork = typeof uni !== 'undefined';

// H5、小程序、app 均认为是手机端产品，如果需要统一手机端 UI 样式，可以直接用 isMobile 控制
export const isMobile = isH5 || isWeChat || isApp;
