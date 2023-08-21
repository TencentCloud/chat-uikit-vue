import { TUIGlobal } from "@tencentcloud/chat-uikit-engine";
const isUniFrameWork = TUIGlobal?.global?.window ? false : true;
export { isUniFrameWork };
