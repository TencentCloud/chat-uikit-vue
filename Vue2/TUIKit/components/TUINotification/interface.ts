export interface ITUINotification {
  showPreviews: boolean;
  allowNotifications: boolean;
  notificationTitle: string;
  notificationIcon: string;
}

export interface INotificationConstructorParams {
  showPreviews?: boolean;
  allowNotifications?: boolean;
  notificationTitle?: string;
  notificationIcon?: string;
}

export type NotificationType = 'chat' | 'call';
