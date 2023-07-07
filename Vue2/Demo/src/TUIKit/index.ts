import TUIChatEngine from "@tencentcloud/chat-uikit-engine";
import { genTestUserSig } from "./debug";
import Server from "./server";
import TUIComponents, {
  TUIChat,
  TUIConversation,
  TUIProfile,
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
  TUIProfile,
  TUIContact,
  TUISearch,
  genTestUserSig,
};
