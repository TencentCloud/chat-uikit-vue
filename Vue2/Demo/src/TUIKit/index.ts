import { genTestUserSig } from './debug';
import Server from './server';
import TUIComponents, {
  TUIChat,
  TUIConversation,
  TUIContact,
  TUISearch,
  TUIGroup,
} from './components';
import TUIKit from './index.vue';

const TUIChatKit = new Server();
TUIChatKit.init();

export {
  TUIKit,
  TUIChatKit,
  TUIComponents,
  TUIChat,
  TUIConversation,
  TUIContact,
  TUISearch,
  TUIGroup,
  genTestUserSig,
};
