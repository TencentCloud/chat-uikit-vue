// const oneDay = 24 * 60 * 60 * 1000;
const oneDay = 24 * 60 * 60;
export const searchMessageTimeList: {
  [propsName: string]: {
    key: string;
    label: string;
    value: { timePosition: number; timePeriod: number };
  };
} = {
  all: {
    key: 'all',
    label: '全部',
    value: {
      timePosition: 0,
      timePeriod: 0,
    },
  },
  oneDay: {
    key: 'today',
    label: '今天',
    value: {
      timePosition: 0,
      timePeriod: oneDay,
    },
  },
  threeDay: {
    key: 'threeDays',
    label: '近三天',
    value: {
      timePosition: 0,
      timePeriod: 3 * oneDay,
    },
  },
  sevenDay: {
    key: 'sevenDays',
    label: '近七天',
    value: {
      timePosition: 0,
      timePeriod: 7 * oneDay,
    },
  },
};

export const searchMessageTimeKeys = Object.keys(searchMessageTimeList);
export const searchMessageTimeDefault = searchMessageTimeList['all'];
