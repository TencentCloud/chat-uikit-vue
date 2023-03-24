/* eslint-disable @typescript-eslint/no-var-requires */
import TUIChat from "./TUIChat.json";
import TUIConversation from './TUIConversation.json';
import TUIGroup from './TUIGroup.json';
import TUIProfile from './TUIProfile.json';
import TUIContact from './TUIContact.json';
import TUISearch from './TUISearch.json';

import message from './message.json';
import component from './component.json';
import time from './time.json';
import Words from './words.json';
import Evaluate from './evaluate.json';

const messages = {
  zh_cn: {
    取消: '取消',
    发送: '发送',
    系统通知: '系统通知',
    关闭: '关闭',
    确定: '确定',
    TUIChat,
    TUIConversation,
    TUIGroup,
    TUIProfile,
    TUIContact,
    message,
    component,
    time,
    Evaluate,
    Words,
    TUISearch,
  },
};

export default messages;
