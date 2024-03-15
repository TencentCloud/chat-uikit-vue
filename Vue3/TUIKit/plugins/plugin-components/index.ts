import TUIChatEngine, { IMessageModel } from '@tencentcloud/chat-uikit-engine';
import { isCustomerServicePluginMessage } from './message-customer/index';
import { JSONToObject } from '../../utils/type-check';

export function isCallMessage(message: IMessageModel): boolean {
  const payloadData = JSONToObject(message?.payload?.data);
  if (payloadData?.businessID === 1 && payloadData?.data) {
    const payloadDataData = JSONToObject(payloadData.data);
    if (payloadDataData.businessID === 'av_call') {
      return true;
    }
  }
  return false;
}

export function isRoomSignalingMessage(message: IMessageModel): boolean {
  const payloadData = JSONToObject(message?.payload?.data);
  return (
    payloadData?.businessID === 'ROOM_INVITE_ACTION'
    || payloadData?.businessID === 'tuikit_engine_room'
  );
}

export function isRoomCardMessage(message: IMessageModel): boolean {
  const payloadData = JSONToObject(message?.payload?.data);
  return payloadData?.businessID === 'group_room_message';
}

export function isPluginMessage(message: IMessageModel): boolean {
  return (
    message.type === TUIChatEngine.TYPES.MSG_CUSTOM
    && (isCallMessage(message)
    || isCustomerServicePluginMessage(message as any)
    || isRoomCardMessage(message)
    || isRoomSignalingMessage(message))
  );
}
