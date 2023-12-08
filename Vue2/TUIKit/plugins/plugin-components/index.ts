import TUIChatEngine, { IMessageModel } from "@tencentcloud/chat-uikit-engine";
import { isCustomerServicePluginMessage } from "@tencentcloud/tui-customer-service-plugin";

const isSignalingMessage = (message: IMessageModel):boolean => {
    return !!(message?.type === TUIChatEngine.TYPES.MSG_CUSTOM && message?.getSignalingInfo());
  };

const isPluginMessage = (message: IMessageModel):boolean => {
  return isSignalingMessage(message) || isCustomerServicePluginMessage(message as any);
};

export {
  isSignalingMessage,
  isPluginMessage,
};