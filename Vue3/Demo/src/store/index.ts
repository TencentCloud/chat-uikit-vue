import { createStore } from 'vuex';

const taskList = [
  {
    id: 1,
    label: '发送一条消息',
    status: false,
  },
  {
    id: 2,
    label: '撤回一条消息',
    status: false,
  },
  {
    id: 3,
    label: '修改一次我的昵称',
    status: false,
  },
  {
    id: 4,
    label: '发起一个群聊',
    status: false,
  },
  {
    id: 5,
    label: '开启一次群禁言',
    status: false,
  },
  {
    id: 6,
    label: '解散一个群聊',
    status: false,
  },
  {
    id: 7,
    label: '发起一次通话',
    status: false,
  },
];

const state: any = {
  taskList,
  userInfo: {},
  isMsgNeedReadReceipt: true,
  displayOnlineStatus: true,
  allowNotification: true,
  _isTIMCallKit: true,
};

if (localStorage.getItem('TUIKit-userInfo')) {
  const localUserInfoStorage: any = localStorage.getItem('TUIKit-userInfo') || {};
  try {
    state.userInfo = JSON.parse(localUserInfoStorage);
  } catch (error) {
    state.userInfo = {};
  }
}

if (sessionStorage.getItem('isMsgNeedReadReceipt')) {
  const localNeedReadReceipt: string = sessionStorage.getItem('isMsgNeedReadReceipt') || '';
  try {
    state.isMsgNeedReadReceipt = JSON.parse(localNeedReadReceipt);
  } catch (error) {
    state.isMsgNeedReadReceipt = false;
  }
}

if (sessionStorage.getItem('displayOnlineStatus')) {
  const localDisplayOnlineStatus: string = sessionStorage.getItem('displayOnlineStatus') || '';
  try {
    state.displayOnlineStatus = JSON.parse(localDisplayOnlineStatus);
  } catch (error) {
    state.displayOnlineStatus = false;
  }
}

if (sessionStorage.getItem('allowNotification')) {
  const localAllowNotification: string = sessionStorage.getItem('allowNotification') || '';
  try {
    state.allowNotification = JSON.parse(localAllowNotification);
  } catch (error) {
    state.allowNotification = false;
  }
}

export default createStore({
  state,
  mutations: {
    handleTask(state, index: number) {
      state.taskList[index].status = true;
    },
    setUserInfo(state, userInfo: any) {
      state.userInfo = userInfo;
      localStorage.setItem('TUIKit-userInfo', JSON.stringify(userInfo));
    },
    setNeedReadReceipt(state, isMsgNeedReadReceipt: boolean) {
      state.isMsgNeedReadReceipt = isMsgNeedReadReceipt;
      sessionStorage.setItem('isMsgNeedReadReceipt', JSON.stringify(isMsgNeedReadReceipt));
    },
    setDisplayOnlineStatus(state, displayOnlineStatus: boolean) {
      state.displayOnlineStatus = displayOnlineStatus;
      sessionStorage.setItem('displayOnlineStatus', JSON.stringify(displayOnlineStatus));
    },
    setNotification(state, allowNotification: boolean) {
      state.allowNotification = allowNotification;
      sessionStorage.setItem('allowNotification', JSON.stringify(allowNotification));
    },
  },
  actions: {},
  modules: {},
});
