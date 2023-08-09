import { SuggestionProps, SuggestionKeyDownProps } from "@tiptap/suggestion";
import TUIChatEngine, {
  TUIGlobal,
  TUIStore,
  TUIGroupService,
  StoreName,
} from "@tencentcloud/chat-uikit-engine";

let currentConversationID = "";
let memberList = [];
let allMemberList: any[] = [];
let showMemberList: any[] = [];
let selectedIndex: number = 0;
let isGroup = false;
let command:
  | ((props: {
      id?: string | undefined;
      userID?: string | undefined;
      isAll?: boolean | undefined;
    }) => void)
  | ((arg0: { id: any; label: any }) => any);
const all = {
  userID: TUIChatEngine.TYPES.MSG_AT_ALL,
  nick: "所有人",
  isAll: true,
  avatar: "https://web.sdk.qcloud.com/im/assets/images/at.svg",
};

const isH5 = TUIGlobal.getPlatform() === "h5";

// todo: 此处后续优化为TUIStore cutomStore中进行存储，避免数据在两个文件中重复监听
TUIStore.watch(StoreName.CONV, {
  currentConversationID: (id: string) => {
    if (id !== currentConversationID) {
      currentConversationID = id;
      if (currentConversationID?.startsWith("GROUP")) {
        isGroup = true;
      } else {
        memberList = [];
        allMemberList = [];
        showMemberList = [];
        isGroup = false;
      }
    }
  },
});

TUIStore.watch(StoreName.CUSTOM, {
  memberList: (list: Array<any>) => {
    if (Array.isArray(list)) {
      memberList = list;
      allMemberList = [all, ...memberList];
      showMemberList = allMemberList;
    }
  },
});

const MessageInputAtSuggestion = () => {
  return {
    allowedPrefixes: null,
    items: (props: { query: string }) => {
      const queryResult = allMemberList?.filter(
        (item: { nick: string; userID: string }) =>
          item?.nick?.toLowerCase()?.startsWith(props?.query?.toLowerCase()) ||
          item?.userID?.toLowerCase()?.startsWith(props?.query?.toLowerCase())
      );
      showMemberList = queryResult?.length ? queryResult : allMemberList;
      TUIGlobal.setShowMemberList(showMemberList);
      return showMemberList;
    },
    render: () => {
      return {
        onStart: (
          props: SuggestionProps<{
            id?: string;
            userID?: string;
            isAll?: boolean;
          }>
        ) => {
          TUIGlobal.toggleAtList(true);
          if (!props?.clientRect) {
            return;
          }
          const rect = props?.clientRect();
          if (rect?.left && rect?.top && !isH5) {
            TUIGlobal.handleAtListPosition({
              left: rect?.left,
              top: rect?.top,
            });
          }
          command = props.command;
        },

        onUpdate(props: SuggestionProps<any>) {
          if (!props?.clientRect) {
            return;
          }
          const rect = props?.clientRect();
          if (rect?.left && rect?.top && !isH5) {
            TUIGlobal.handleAtListPosition({
              left: rect?.left,
              top: rect?.top,
            });
          }
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === "Enter") {
            props.event?.stopPropagation();
            props.event?.preventDefault();
          }
          if (props.event.key === "Escape") {
            TUIGlobal.toggleAtList(false);
            showMemberList = allMemberList;
            return true;
          }
          if (props?.event.key === "ArrowUp") {
            upHandler();
            return true;
          }
          if (props?.event.key === "ArrowDown") {
            downHandler();
            return true;
          }
          if (props?.event.key === "Enter") {
            enterHandler();
            return true;
          }
          return false;
        },

        onExit(props: SuggestionProps<any>) {
          TUIGlobal.toggleAtList(false);
          showMemberList = allMemberList;
          TUIGlobal.handleAtListPosition({
            left: 0,
            top: 0,
          });
        },
      };
    },
  };
};

const upHandler = () => {
  if (!showMemberList?.length) return;
  selectedIndex =
    (selectedIndex + showMemberList?.length - 1) % showMemberList?.length;
  TUIGlobal.setCurrentSelectIndex(selectedIndex);
};

const downHandler = () => {
  if (!showMemberList?.length) return;
  selectedIndex = (selectedIndex + 1) % showMemberList?.length;
  TUIGlobal.setCurrentSelectIndex(selectedIndex);
};

const enterHandler = () => {
  selectItem(selectedIndex);
};

const selectItem = (index: number) => {
  if (!showMemberList?.length) return;
  const item = showMemberList[index];
  if (item) {
    command &&
      command({
        id: (item as any)?.userID,
        label: (item as any)?.nick || (item as any)?.userID,
      });
  }
};
TUIGlobal.selectItem = selectItem;
export default MessageInputAtSuggestion;
