import { apiClient } from '../api/client';

type ApiReviewNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  proposal_reference: string | null;
  read_at: string | null;
  created_at: string;
};

type NotificationPageResponse = {
  data: ApiReviewNotification[];
  meta: {
    unread_count: number;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    prev: string | null;
    next: string | null;
  };
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
  const { data } = await apiClient.get<NotificationPageResponse>('/mobile/notifications', {
    params: { page },
  });

  return {
    notifications: data.data.map(mapNotification),
    unreadCount: data.meta.unread_count,
    currentPage: data.meta.current_page,
    lastPage: data.meta.last_page,
    total: data.meta.total,
  };
}

export async function getUnreadReviewNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<{ data: { unread_count: number } }>(
    '/mobile/notifications/unread-count',
  );
  return data.data.unread_count;
}

export async function markReviewNotificationRead(notificationId: string): Promise<string> {
  const { data } = await apiClient.patch<{ data: { id: string; read_at: string } }>(
    `/mobile/notifications/${encodeURIComponent(notificationId)}/read`,
  );
  return data.data.read_at;
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
