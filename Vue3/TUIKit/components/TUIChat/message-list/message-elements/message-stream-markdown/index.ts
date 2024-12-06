import { IMessageModel } from '@tencentcloud/chat-uikit-engine';

export function isBotMessage(message: IMessageModel): boolean {
  if (!message || !message.ID || !message.from) {
    return false;
  }

  if (message.from.startsWith('@RBT#') && !message.to.startsWith('@RBT#')) {
    return true;
  }

  return false;
}

export * from './index.vue';
