import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
import { genTestUserSig } from "./debug";
import Server from "./server";
import TUIComponents, {
  TUIChat,
  TUIConversation,
  TUIContact,
  TUISearch,
} from "./components";

const TUIChatKit = new Server();

export {
  TUIChatKit,
  TUIChatEngine,
  TUIComponents,
  TUIChat,
  TUIConversation,
  TUIContact,
  TUISearch,
  genTestUserSig,
};
