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
  en: {
    取消: 'Cancel',
    发送: 'Send',
    系统通知: 'System notification',
    关闭: 'Close',
    确定: 'Save',
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
