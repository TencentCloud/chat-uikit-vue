import IComponentServer from '../IComponentServer';

const store: any = {};

/**
 * class TUIContactServer
 *
 * TUIGroup 逻辑主体
 */
export default class TUIContactServer extends IComponentServer {
  public TUICore: any;
  public store: any;
  public currentStore: any = {};
  public storeCallback: any;
  constructor(TUICore: any) {
    super();
    this.TUICore = TUICore;
    this.bindTIMEvent();
    this.store = TUICore.setComponentStore('TUIContact', store, this.updateStore.bind(this));
  }

  /**
   * 组件销毁
   * destroy
   */
  public destroyed() {
    this.unbindTIMEvent();
  }

  /**
   * 数据监听回调
   * data listener callback
   *
   * @param {any} newValue 新数据/new value
   * @param {any} oldValue 旧数据/old value
   */
  updateStore(newValue: any, oldValue: any) {
    this.currentStore.groupList = newValue.groupList;
    this.currentStore.searchGroup = newValue.searchGroup;
    this.currentStore.systemConversation = newValue.systemConversation;
    this.currentStore.systemMessageList = newValue.systemMessageList;
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                    TIM 事件监听注册接口
   * //                        TIM Event listener registration interface
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  private bindTIMEvent() {
    this.TUICore.tim.on(this.TUICore.TIM.EVENT.GROUP_LIST_UPDATED, this.handleGroupListUpdated, this);
    this.TUICore.tim.on(this.TUICore.TIM.EVENT.GROUP_ATTRIBUTES_UPDATED, this.handleGroupAttributesUpdated, this);
    this.TUICore.tim.on(this.TUICore.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.handleConversationListUpdate, this);
    this.TUICore.tim.on(this.TUICore.TIM.EVENT.FRIEND_LIST_UPDATED, this.handleFriendListUpdated, this);
    this.TUICore.tim.on(this.TUICore.TIM.EVENT.USER_STATUS_UPDATED, this.handleUserStatusUpdated, this);
  }

  private unbindTIMEvent() {
    this.TUICore.tim.off(this.TUICore.TIM.EVENT.GROUP_LIST_UPDATED, this.handleGroupListUpdated);
    this.TUICore.tim.off(this.TUICore.TIM.EVENT.GROUP_ATTRIBUTES_UPDATED, this.handleGroupAttributesUpdated);
    this.TUICore.tim.off(this.TUICore.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.handleConversationListUpdate);
    this.TUICore.tim.off(this.TUICore.TIM.EVENT.FRIEND_LIST_UPDATED, this.handleFriendListUpdated);
    this.TUICore.tim.off(this.TUICore.TIM.EVENT.USER_STATUS_UPDATED, this.handleUserStatusUpdated);
  }

  private handleGroupListUpdated(event: any) {
    this.store.groupList = event.data;
  }

  private handleGroupAttributesUpdated(event: any) {
    const { groupID, groupAttributes } = event.data;
    console.log(groupID, groupAttributes);
  }

  private handleConversationListUpdate(res: any) {
    this.handleFilterSystem(res.data);
  }

  private handleFriendListUpdated(event: any) {
    this.currentStore.friendList = event.data;
    this.currentStore.userIDList = this.currentStore.friendList.map((item: any) => item.userID);
  }

  private handleUserStatusUpdated(event: any) {
    const userStatusList = event.data;
    userStatusList.forEach((item: { userID?: string; statusType?: number; customStatus?: any }) => {
      const { userID, statusType, customStatus } = item;
      this.currentStore?.userStatusList?.set(userID, { statusType, customStatus });
    });
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                 处理 TIM 接口参数及回调
   * //                     Handling TIM interface parameters and callbacks
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  /**
   * 处理异步函数
   * Handling asynchronous functions
   *
   * @param {callback} callback 回调函数/callback
   * @returns {Promise} 返回异步函数/return callback
   */
  public handlePromiseCallback(callback: any) {
    return new Promise<void>((resolve, reject) => {
      const config = {
        TUIName: 'TUIContact',
        callback: () => {
          callback && callback(resolve, reject);
        },
      };
      this.TUICore.setAwaitFunc(config.TUIName, config.callback);
    });
  }

  /**
   * 处理conversationList
   * Handle conversation list
   *
   * @param {Array} list conversationList
   * @returns {Object}
   */
  private handleFilterSystem(list: any) {
    const options = {
      allConversationList: list,
      systemConversationList: [],
    };
    options.systemConversationList = list.filter((item: any) => item.type === this.TUICore.TIM.TYPES.CONV_SYSTEM);
    this.store.allConversationList = options.allConversationList;
    this.store.systemConversationList = options.systemConversationList;
    const [systemConversation] = options.systemConversationList;
    this.store.systemConversation = systemConversation;
    return options;
  }

  /**
   * /////////////////////////////////////////////////////////////////////////////////
   * //
   * //                                 对外方法
   * //                               TIM methods
   * //
   * /////////////////////////////////////////////////////////////////////////////////
   */

  /*
   * 获取 conversationList
   * Get conversation list
   *
   * @returns {Promise}
   */
  public async getConversationList() {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.getConversationList();
        this.handleFilterSystem(imResponse.data.conversationList);
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取系统通知 messageList
   * Get system messages
   *
   * @returns {Promise}
   */
  public async getSystemMessageList() {
    const options = {
      conversationID: this.store.systemConversation.conversationID,
      count: 15,
    };
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.getMessageList(options);
        this.store.systemMessageList = imResponse.data.messageList;
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 设置已读
   * Set message read
   *
   * @param {string} conversationID 会话ID/ conversation's ID
   * @returns {Promise}
   */
  public async setMessageRead() {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse: any = await this.TUICore.tim.setMessageRead({
          conversationID: this.store.systemConversation.conversationID,
        });
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取群组列表
   * Get group list
   *
   * @param {any} options 参数/options
   * @param {Array.<String>} options.groupProfileFilter 群资料过滤器/group profile filter
   * @returns {Promise}
   */
  public async getGroupList(options?: any) {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        let imResponse: any = {};
        if (!options) {
          imResponse = await this.TUICore.tim.getGroupList();
        } else {
          imResponse = await this.TUICore.tim.getGroupList(options);
        }
        this.store.groupList = imResponse.data.groupList;
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取群组属性
   * Get group profile
   *
   * @param {any} options 参数/options
   * @param {String} options.groupID 群组ID/group's ID
   * @param {Array.<String>} options.groupProfileFilter 群资料过滤器/group profile filter
   * @returns {Promise}
   */
  public getGroupProfile(options: any): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.getGroupProfile(options);
        this.store.groupList = imResponse.data.groupList;
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 删除群组
   * Dismiss group
   *
   * @param {String} groupID 群组ID/group's ID
   * @returns {Promise}
   */
  public dismissGroup(groupID: string): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.dismissGroup(groupID);
        this.store.groupProfile = imResponse.data.group;
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 修改群组资料
   * Update group profile
   *
   * @param {any} options 参数/params options
   * @param {String} options.groupID 群组ID/group's ID
   * @param {String} options.name 群组名称/group's name
   * @param {String} options.introduction 群简介/group's introduction
   * @param {String} options.notification 群公告/group's notification
   * @param {String} options.avatar 群头像 URL/group's avatar url
   * @param {Number} options.maxMemberNum 最大群成员数量/the max number of group's member
   * @param {Number} options.joinOption 申请加群处理方式/group's join options
   * @param {Array.<Object>} options.groupCustomField 群组维度的自定义字段/custom fields for group dimensions
   * @returns {Promise}
   */
  public updateGroupProfile(options: any): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.updateGroupProfile(options);
        this.store.groupProfile = imResponse.data.group;
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 申请加群
   * Join group
   *
   * @param {any} options 参数/options
   * @param {String} options.groupID 群组ID/group's ID
   * @param {String} options.applyMessage 附言/apply message
   * @param {String} options.type 群组类型/group's type
   * @returns {Promise}
   */
  public joinGroup(options: any): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.joinGroup(options);
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 退出群组
   * Quit group
   *
   * @param {String} groupID 群组ID/group's ID
   * @returns {Promise}
   */
  public quitGroup(groupID: string): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.quitGroup(groupID);
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 通过 groupID 搜索群组
   * Search group by group's ID
   *
   * @param {String} groupID 群组ID/group's ID
   * @returns {Promise}
   */
  public searchGroupByID(groupID: string): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.searchGroupByID(groupID);
        this.store.searchGroup = imResponse.data.group;
        resolve(imResponse);
      } catch (error) {
        this.store.searchGroup = {};
        reject(error);
      }
    });
  }

  /**
   * 处理申请加群
   * Handle group application
   * - 管理员/administrator
   *
   * @param {any} options 参数/options
   * @param {String} options.handleAction 处理结果 Agree(同意) / Reject(拒绝)
   * @param {String} options.handleMessage 附言/apply message
   * @param {Message} options.message 对应【群系统通知】的消息实例/the message corresponding to 【group system notification】
   * @returns {Promise}
   */
  public handleGroupApplication(options: any): Promise<any> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.handleGroupApplication(options);
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取 SDK 缓存的好友列表
   * Get friend list from SDK
   *
   * @param {Array<string>} userIDList 用户的账号列表/userID list
   * @returns {Promise}
   */
  public async getFriendList(): Promise<void> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        const imResponse = await this.TUICore.tim.getFriendList();
        this.currentStore.friendList = imResponse.data;
        this.currentStore.userIDList = this.currentStore.friendList.map((item: any) => item.userID) || [];
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取 用户状态
   * Get users’ status
   *
   * @param {Array<string>} userIDList 用户 userID 列表 / userID list
   * @returns {Promise}
   */
  public async getUserStatus(userIDList: Array<string>): Promise<void> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        if (!userIDList.length) return;
        const imResponse = await this.TUICore.tim.getUserStatus({ userIDList });
        imResponse?.data?.successUserList?.forEach((item: any) => {
          if (item && item?.userID) {
            this.currentStore?.userStatusList?.set(item?.userID, {
              statusType: item?.statusType,
              customStatus: item?.customStatus,
            });
          }
        });
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 订阅 用户状态
   * Subscribe users' status
   *
   * @param {Array<string>} userIDList 用户 userID 列表 / userID list
   * @returns {Promise}
   */
  public async subscribeUserStatus(userIDList: Array<string>): Promise<void> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        if (!userIDList.length) return;
        const imResponse = await this.TUICore.tim.subscribeUserStatus({ userIDList });
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 取消订阅 用户状态
   * Unscribe users' status
   *
   * @param {Array<string>} userIDList 用户 userID 列表 / userID list
   * @returns {Promise}
   */
  public async unsubscribeUserStatus(userIDList?: Array<string>): Promise<void> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        if (userIDList && !userIDList.length) return;
        const imResponse = await this.TUICore.tim.unsubscribeUserStatus({ userIDList });
        this.currentStore?.userStatusList?.clear();
        resolve(imResponse);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 处理 用户状态（订阅并获取用户状态 / 取消订阅用户状态）
   * Handle users' status （ subscribe and get user status / unsubscribe user status ）
   *
   * @param {boolean} displayOnlineStatus 是否展示用户在线状态 / whether to display the user's online status
   * @param {Array<string>} userIDList 用户 userID 列表 / userID list
   * @returns {Promise}
   */
  public async handleUserStatus(displayOnlineStatus: boolean, userIDList: Array<string>): Promise<void> {
    return this.handlePromiseCallback(async (resolve: any, reject: any) => {
      try {
        setTimeout(async () => {
          if (displayOnlineStatus) {
            await this.subscribeUserStatus(userIDList);
            await this.getUserStatus(userIDList);
          } else {
            await this.unsubscribeUserStatus(userIDList);
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 赋值
   * Bind
   *
   * @param {Object} params 使用的数据/params data
   * @returns {Object} 数据/data
   */
  public async bind(params: any) {
    this.currentStore = params;
    await this.getGroupList();
    await this.getConversationList();
    await this.getFriendList();
    return this.currentStore;
  }
}
