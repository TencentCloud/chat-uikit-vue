class TUIChatConfig {
  static instance: TUIChatConfig;
  private chatType: string;
  private features: Record<string, any>;
  private theme: string;
  constructor() {
    this.chatType = '';
    this.features = {
      DownloadFile: true,
      CopyMessage: true,
      DeleteMessage: true,
      RevokeMessage: true,
      QuoteMessage: true,
      ForwardMessage: true,
      TranslateMessage: true,
      VoiceToText: true,
      MultiSelection: true,
      EmojiReaction: true,
      InputEmoji: true,
      InputStickers: true,
      InputImage: true,
      InputVoice: true,
      InputVideo: true,
      InputFile: true,
      InputEvaluation: true,
      InputQuickReplies: true,
      InputMention: true,
      MessageSearch: true,
      ReadStatus: true,
    };
    this.theme = 'light';
  }

  static getInstance(): TUIChatConfig {
    if (!TUIChatConfig.instance) {
      TUIChatConfig.instance = new TUIChatConfig();
    }
    return TUIChatConfig.instance;
  }

  setChatType(chatType: string) {
    this.chatType = chatType;
  }

  getChatType() {
    return this.chatType;
  }

  hideTUIChatFeatures(features: string[]) {
    if (!features) {
      return;
    }
    features.forEach((feature: string) => {
      if (this.features[feature]) {
        this.features[feature] = false;
      }
    });
  }

  getFeatureConfig(key?: string) {
    if (key) {
      return this.features[key];
    }
    return this.features;
  }

  setTheme(theme: string) {
    this.theme = theme;
  }

  getTheme() {
    return this.theme;
  }
}

const ChatConfig = TUIChatConfig.getInstance();
const hideTUIChatFeatures = ChatConfig.hideTUIChatFeatures.bind(ChatConfig);

export {
  hideTUIChatFeatures,
};

export default ChatConfig;
