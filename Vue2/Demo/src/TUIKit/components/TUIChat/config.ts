class TUIChatConfig {
  static instance: TUIChatConfig;
  private chatType: string;
  constructor() {
    this.chatType = "";
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
}

export default TUIChatConfig.getInstance();
