import TUIChatEngine, {
  TUIChatService,
  IConversationModel,
  SendMessageParams,
  SendMessageOptions,
} from '@tencentcloud/chat-uikit-engine-lite';
import { isEnabledMessageReadReceiptGlobal } from '../../utils/utils';
import OfflinePushInfoManager, { IOfflinePushInfoCreateParams } from '../../offlinePushInfoManager/index';

export function createSendMessageOptions(
  currentConversation: IConversationModel | undefined,
  file: any,
): SendMessageParams {
  return {
    to:
      currentConversation?.groupProfile?.groupID
      || currentConversation?.userProfile?.userID,
    conversationType: currentConversation?.type,
    payload: {
      file,
    },
    needReadReceipt: isEnabledMessageReadReceiptGlobal(),
  } as SendMessageParams;
}

export function genOfflinePushInfo(
  currentConversation: IConversationModel,
  payload: any,
  messageType: any,
): SendMessageOptions {
  const offlinePushInfoCreateParams: IOfflinePushInfoCreateParams = {
    conversation: currentConversation,
    payload,
    messageType,
  };

  return {
    offlinePushInfo: OfflinePushInfoManager.create(offlinePushInfoCreateParams),
  };
}

export function sendImageMessage(
  currentConversation: IConversationModel,
  files: any,
): void {
  if (!files) {
    return;
  }

  const options = createSendMessageOptions(currentConversation, files);
  const sendMessageOptions = genOfflinePushInfo(
    currentConversation,
    options.payload,
    TUIChatEngine.TYPES.MSG_IMAGE,
  );

  TUIChatService.sendImageMessage(options, sendMessageOptions);
}

export function sendVideoMessage(
  currentConversation: IConversationModel,
  file: any,
): void {
  if (!file) {
    return;
  }

  const options = createSendMessageOptions(currentConversation, file);
  const sendMessageOptions = genOfflinePushInfo(
    currentConversation,
    options.payload,
    TUIChatEngine.TYPES.MSG_VIDEO,
  );

  TUIChatService.sendVideoMessage(options, sendMessageOptions);
}

export function sendFileMessage(
  currentConversation: IConversationModel,
  file: any,
): void {
  if (!file) {
    return;
  }

  const options = createSendMessageOptions(currentConversation, file);
  const sendMessageOptions = genOfflinePushInfo(
    currentConversation,
    options.payload,
    TUIChatEngine.TYPES.MSG_FILE,
  );

  TUIChatService.sendFileMessage(options, sendMessageOptions);
}

export function handleWebFileSelect(
  event: any,
  sendCallback: (file: any) => void,
): void {
  if (event?.target?.files?.length <= 0) {
    return;
  }

  sendCallback(event.target);
  event.target.value = '';
}

export function isValidFile(file: any): boolean {
  return !!file;
}

export function clearFileInput(inputRef: any): void {
  if (inputRef.value) {
    inputRef.value.value = '';
  }
}
