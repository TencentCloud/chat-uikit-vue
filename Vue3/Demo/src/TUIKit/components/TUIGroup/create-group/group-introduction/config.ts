import TUIChatEngine from '@tencentcloud/chat-uikit-engine';

const groupIntroConfig = [
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Public.svg',
    label: '陌生人社交群（Public）',
    type: TUIChatEngine.TYPES.GRP_PUBLIC,
    detail: '类似 QQ 群，创建后群主可以指定群管理员，用户搜索群 ID 发起加群申请后，需要群主或管理员审批通过才能入群。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Meeting.svg',
    label: '临时会议群（Meeting）',
    type: TUIChatEngine.TYPES.GRP_MEETING,
    detail: '创建后可以随意进出，且支持查看入群前消息；适合用于音视频会议场景、在线教育场景等与实时音视频产品结合的场景。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Work.svg',
    label: '好友工作群（Work）',
    type: TUIChatEngine.TYPES.GRP_WORK,
    detail: '类似普通微信群，创建后仅支持已在群内的好友邀请加群，且无需被邀请方同意或群主审批。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/AVChatroom.svg',
    label: '直播群（AVChatroom）',
    type: TUIChatEngine.TYPES.GRP_AVCHATROOM,
    detail: '创建后可以随意进出，没有群成员数量上限，但不支持历史消息存储；适合与直播产品结合，用于弹幕聊天场景。详见',
    src: '产品文档',
  },
  {
    icon: 'https://web.sdk.qcloud.com/im/assets/images/Community.png',
    label: '社群（Community）',
    type: TUIChatEngine.TYPES.GRP_COMMUNITY,
    detail: '创建后可以随意进出，最多支持100000人，支持历史消息存储，用户搜索群 ID 发起加群申请后，无需管理员审批即可进群。详见',
    src: '产品文档',
  },
];

const findGroupIntroConfig = (type: string) => {
  return groupIntroConfig.filter((item: any) => {
    return item.type === type;
  })[0];
};

export {
  groupIntroConfig,
  findGroupIntroConfig,
};
