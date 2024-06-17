import { getPlatform } from '@tencentcloud/universal-api';

declare const uni: any;

export const isPC = getPlatform() === 'pc';

export const isH5 = getPlatform() === 'h5';

export const isWeChat = getPlatform() === 'wechat';

export const isApp = getPlatform() === 'app';

export const isUniFrameWork = typeof uni !== 'undefined';

// H5, mini programs, and apps are all considered mobile.
// If you need to unify the mobile UI style, you can directly use isMobile to control
export const isMobile = isH5 || isWeChat || isApp;
