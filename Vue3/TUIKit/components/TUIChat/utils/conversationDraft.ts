import {
  IMessageModel,
  SetConversationDraftParams,
  StoreName,
  TUIConversationService,
  TUIStore,
  TUITranslateService,
} from '@tencentcloud/chat-uikit-engine';
import { transformTextWithKeysToEmojiNames } from '../emoji-config';
import { JSONToObject } from '../../../utils/index';

class ConversationDraftManager {
  private static instance: ConversationDraftManager | null = null;
  private quoteMessageMap = new Map<string, IMessageModel>();

  private constructor() { }

  public static getInstance(): ConversationDraftManager {
    if (!ConversationDraftManager.instance) {
      ConversationDraftManager.instance = new ConversationDraftManager();
    }
    return ConversationDraftManager.instance;
  }

  public setStore(conversationID: string, draftContent: string, abstract: string, quoteMessage?: { type: 'quote' | 'reply'; message: IMessageModel }) {
    if (conversationID && (this.isEditorNotEmpty(draftContent) || quoteMessage?.message?.ID)) {
      let additionalDraftInfo = {};
      if (quoteMessage?.message?.ID) {
        this.quoteMessageMap.set(quoteMessage.message.ID, quoteMessage.message);
        additionalDraftInfo = { messageID: quoteMessage.message.ID, type: quoteMessage.type };
      }
      const draftParams: SetConversationDraftParams = {
        conversationID: conversationID,
        draftInfo: {
          html: draftContent,
          abstract: abstract,
          ...additionalDraftInfo,
        },
      };
      TUIConversationService.setConversationDraft(draftParams);
      TUIStore.update(StoreName.CHAT, 'quoteMessage', { message: undefined, type: 'quote' });
    }
  }

  public getStore(conversationID: string, setEditorContentCallback: (...args: any[]) => void) {
    const conversation = TUIStore.getConversationModel(conversationID);
    if (!conversation) {
      return;
    }
    if (conversation.conversationID && conversation.draftText) {
      const draftObject = JSONToObject(conversation.draftText);
      TUIStore.update(StoreName.CHAT, 'quoteMessage', { message: this.quoteMessageMap.get(draftObject.messageID) || undefined, type: draftObject.type });
      setEditorContentCallback(draftObject.html);
    }
    TUIConversationService.setConversationDraft({ conversationID: conversation.conversationID });
  }

  public generateAbstract(editorContent: Array<{ type: string; payload: { text?: string; file?: File } }>): string {
    let abstract = '';
    editorContent?.forEach((item: { type: string; payload: { text?: string; file?: File } }) => {
      switch (item.type) {
        case 'text':
          abstract += transformTextWithKeysToEmojiNames(item.payload.text || '');
          break;
        case 'image':
          abstract += TUITranslateService.t('TUIChat.图片');
          break;
        case 'video':
          abstract += TUITranslateService.t('TUIChat.视频');
          break;
        case 'file':
          abstract += TUITranslateService.t('TUIChat.文件');
          break;
        default:
          break;
      }
    });
    return abstract;
  }

  private isEditorNotEmpty(editorHTML: string) {
    return editorHTML && !editorHTML.includes('is-empty') && editorHTML !== '<p></p>';
  }
}

export default ConversationDraftManager.getInstance();
