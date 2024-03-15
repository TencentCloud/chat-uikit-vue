import type { IMessageModel } from '@tencentcloud/chat-uikit-engine';

/**
 * Parses a JSON string and returns the resulting object.
 *
 * @param {string} jsonString - The JSON string to parse. Default value is "{}".
 * @return {Record<string, any>} - The resulting object after parsing the JSON string.
 */
export function safeParse(jsonString: string = '{}'): Record<string, any> {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}

export function isTypingMessage(message: IMessageModel): boolean {
  const { businessID } = safeParse(message.payload?.data);
  return businessID === 'user_typing_status';
}
