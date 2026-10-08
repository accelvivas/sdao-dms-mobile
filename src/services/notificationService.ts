import { apiClient } from '../api/client';
import {
  notificationPageSchema,
  readNotificationSchema,
  unreadCountSchema,
} from '../validation/apiSchemas';

type ApiReviewNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  proposal_reference: string | null;
  read_at: string | null;
  created_at: string;
};

export type ReviewNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  proposalReference: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ReviewNotificationPage = {
  notifications: ReviewNotification[];
  unreadCount: number;
  currentPage: number;
  lastPage: number;
  total: number;
};

function mapNotification(notification: ApiReviewNotification): ReviewNotification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    proposalReference: notification.proposal_reference,
    readAt: notification.read_at,
    createdAt: notification.created_at,
  };
}

export async function getReviewNotifications(page = 1): Promise<ReviewNotificationPage> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const { data } = await apiClient.get<unknown>('/mobile/notifications', {
    params: { page: safePage },
  });
  const payload = notificationPageSchema.parse(data);

  return {
    notifications: payload.data.map(mapNotification),
    unreadCount: payload.meta.unread_count,
    currentPage: payload.meta.current_page,
    lastPage: payload.meta.last_page,
    total: payload.meta.total,
  };
}

export async function getUnreadReviewNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<unknown>(
    '/mobile/notifications/unread-count',
  );
  return unreadCountSchema.parse(data).data.unread_count;
}

export async function markReviewNotificationRead(notificationId: string): Promise<string> {
  const { data } = await apiClient.patch<unknown>(
    `/mobile/notifications/${encodeURIComponent(notificationId)}/read`,
  );
  return readNotificationSchema.parse(data).data.read_at;
}

export async function markAllReviewNotificationsRead(): Promise<void> {
  await apiClient.patch('/mobile/notifications/read-all');
}

export async function markLatestNotificationForProposalRead(
  proposalReference: string,
): Promise<void> {
  const page = await getReviewNotifications();
  const notification = page.notifications.find(
    (item) => item.proposalReference === proposalReference && item.readAt === null,
  );

  if (notification) {
    await markReviewNotificationRead(notification.id);
  }
}
