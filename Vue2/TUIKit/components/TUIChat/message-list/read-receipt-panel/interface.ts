export interface IMemberData {
  nick: string;
  userID: string;
  avatar: string;
}

export interface IGroupMessageReadMemberData {
  code: number;
  data: {
    cursor: string;
    isCompleted: boolean;
    messageID: string;
    readUserInfoList: IMemberData[];
    unreadUserInfoList: IMemberData[];
  };
}

export type ITabInfo = Record<
  TabName,
  {
    tabName: string;
    count: number | undefined;
    memberList: IMemberData[];
  }
>;

export type TabName = 'read' | 'unread' | 'close';
