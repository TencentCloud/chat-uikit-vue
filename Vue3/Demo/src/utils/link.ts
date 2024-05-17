const Link = {
  adv: {
    label: '首购低至1折, 复购7.5折起! 立即选购',
    url: 'https://cloud.tencent.com/act/pro/imnew?from=16262',
  },
  demo: {
    label: '体验更多Demo',
    url: 'https://cloud.tencent.com/document/product/269/36852',
  },
  im: {
    label: '访问官网',
    url: 'https://cloud.tencent.com/product/im',
  },
  privacy: {
    label: '隐私条例',
    url: 'https://web.sdk.qcloud.com/document/Tencent-IM-Privacy-Protection-Guidelines.html',
  },
  agreement: {
    label: '用户协议',
    url: 'https://web.sdk.qcloud.com/document/Tencent-IM-User-Agreement.html',
  },
  product: {
    label: '产品文档',
    url: 'https://cloud.tencent.com/document/product/269/1499#.E7.BE.A4.E7.BB.84.E5.8A.9F.E8.83.BD',
  },
  customMessage: {
    label: '自定义消息',
    url: 'https://web.sdk.qcloud.com/im/doc/zh-cn/SDK.html#createCustomMessage',
  },
  contact: {
    label: '联系我们',
    url: 'https://cloud.tencent.com/document/product/269/59590',
  },
  intl: {
    label: '国际站',
    url: 'https://web.sdk.qcloud.com/im/demo/en/index.html#/home',
  },
  stepList: [
    {
      label: '创建项目',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A41.EF.BC.9A.E5.88.9B.E5.BB.BA.E9.A1.B9.E7.9B.AE',
    },
    {
      label: '下载TUIKit组件',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A42.EF.BC.9A.E4.B8.8B.E8.BD.BD-tuikit-.E7.BB.84.E4.BB.B6',
    },
    {
      label: '引入TUIKit组件',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A43.EF.BC.9A.E5.BC.95.E5.85.A5-tuikit-.E7.BB.84.E4.BB.B6',
    },
    {
      label: '获取SDKAppID',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A44.EF.BC.9A-.E8.8E.B7.E5.8F.96-sdkappid-.E3.80.81.E5.AF.86.E9.92.A5.E4.B8.8E-userid',
    },
    {
      label: '调用TUIKit组件',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A45.EF.BC.9A.E8.B0.83.E7.94.A8-tuikit-.E7.BB.84.E4.BB.B6',
    },
    {
      label: '启动项目',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A46.EF.BC.9A.E5.90.AF.E5.8A.A8.E9.A1.B9.E7.9B.AE',
    },
    {
      label: '发送您的第一条消息',
      url: 'https://cloud.tencent.com/document/product/269/68493#.E6.AD.A5.E9.AA.A47.EF.BC.9A.E5.8F.91.E9.80.81.E6.82.A8.E7.9A.84.E7.AC.AC.E4.B8.80.E6.9D.A1.E6.B6.88.E6.81.AF',
    },
  ],
  advList: [
    {
      label: 'IM首购低至1折',
      subLabel: '续费9折起',
      btnText: '立即选购',
      url: 'https://cloud.tencent.com/act/pro/imnew?from=16262',
    },
  ],
  TIMPush: {
    type: 'android',
    label: '扫码体验 TIMPush (by uni-app)',
    url: 'https://qcloudimg.tencent-cloud.cn/raw/c1fed062d91cd95fdfb57059edcd5890.png',
  },
};

const qrList = [
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Android.svg',
    name: 'Android',
    link: 'https://web.sdk.qcloud.com/im/assets/images/android.png',
    detail: '扫描二维码下载',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/iOS.svg',
    name: 'iOS',
    link: 'https://web.sdk.qcloud.com/im/assets/images/ios.png',
    detail: '扫描二维码下载',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Miniprogram.svg',
    name: '小程序',
    link: 'https://web.sdk.qcloud.com/im/assets/images/mini.png',
    detail: '微信扫码进入',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Windows.svg',
    name: 'Windows',
    link: 'https://web.sdk.qcloud.com/im/assets/images/download.svg',
    detail: '点击直接下载',
    download: 'https://comm.qq.com/im_demo_download/index.html#/pc-windows',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Mac%20OS.svg',
    name: 'Mac OS',
    link: 'https://web.sdk.qcloud.com/im/assets/images/download.svg',
    detail: '点击直接下载',
    download: 'https://comm.qq.com/im_demo_download/index.html#/pc',
  },
];

const mobileList = [
  {
    type: 'android',
    link: 'https://web.sdk.qcloud.com/im/assets/images/android-mobile.svg',
    url: 'https://comm.qq.com/im_demo_download/index.html#/mobile-demo',
  },
  {
    type: 'iphone',
    link: 'https://web.sdk.qcloud.com/im/assets/images/iphone-mobile.svg',
    url: 'https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AF%E4%BA%91im/id1112479040',
  },
  {
    type: 'miniprogram',
    link: 'https://web.sdk.qcloud.com/im/assets/images/mini-mobile.svg',
  },
];

export { Link, qrList, mobileList };
