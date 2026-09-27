import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppButton } from '../../components/AppButton';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type { ApproverStackParamList } from '../../navigation/ApproverNavigator';
import {
  getReviewNotifications,
  markAllReviewNotificationsRead,
  markReviewNotificationRead,
  type ReviewNotification,
} from '../../services/notificationService';
import { addNotificationReceivedListener } from '../../services/pushNotificationService';
import { getApiErrorMessage, getApiErrorStatus } from '../../utils/apiError';
import { formatDateTime } from '../../utils/date';

export default function ReviewNotificationsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<ApproverStackParamList>>();
  const [notifications, setNotifications] = useState<ReviewNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async (page = 1) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError('');

    try {
      const result = await getReviewNotifications(page);
      setNotifications((current) => {
        if (page === 1) return result.notifications;
        const existingIds = new Set(current.map((item) => item.id));
        return [...current, ...result.notifications.filter((item) => !existingIds.has(item.id))];
      });
      setUnreadCount(result.unreadCount);
      setCurrentPage(result.currentPage);
      setLastPage(result.lastPage);
    } catch (caught: unknown) {
      if (getApiErrorStatus(caught) === 401) {
        void logout();
        return;
      }
      setError(getApiErrorMessage(caught, 'Unable to load review notifications. Please try again.'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [logout]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications]),
  );

  useEffect(() => {
    const subscription = addNotificationReceivedListener(() => {
      void loadNotifications();
    });
    return () => subscription?.remove();
  }, [loadNotifications]);

  function openNotification(notification: ReviewNotification) {
    if (!notification.readAt) {
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, readAt } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
      void markReviewNotificationRead(notification.id).catch(() => {
        void loadNotifications();
      });
    }

    if (notification.proposalReference) {
      navigation.navigate('DocumentReview', { documentId: notification.proposalReference });
    }
  }

  async function markAllRead() {
    setIsMarkingAll(true);
    try {
      await markAllReviewNotificationsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => (
        item.readAt ? item : { ...item, readAt }
      )));
      setUnreadCount(0);
    } catch (caught: unknown) {
      if (getApiErrorStatus(caught) === 401) {
        void logout();
        return;
      }
      setError(getApiErrorMessage(caught, 'Unable to mark notifications as read.'));
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Review Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount === 0
              ? 'No unread proposal notifications'
              : `${unreadCount} unread proposal notification${unreadCount === 1 ? '' : 's'}`}
          </Text>
        </View>
        {unreadCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            disabled={isMarkingAll}
            onPress={() => void markAllRead()}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>{isMarkingAll ? 'Updating...' : 'Mark all read'}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <Card><Text style={styles.emptyText}>Loading notifications...</Text></Card>
      ) : notifications.length === 0 ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons color={colors.textMuted} name="notifications-off-outline" size={28} />
            <Text style={styles.emptyText}>No review notifications are currently available.</Text>
          </View>
        </Card>
      ) : (
        <>
          {notifications.map((notification) => (
            <Pressable
              accessibilityRole="button"
              key={notification.id}
              onPress={() => openNotification(notification)}
            >
              <Card
                style={notification.readAt
                  ? styles.notificationCard
                  : { ...styles.notificationCard, ...styles.unreadNotificationCard }}
              >
                <View style={styles.notificationHeader}>
                  {!notification.readAt ? <View style={styles.unreadDot} /> : null}
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  {notification.proposalReference ? (
                    <Ionicons color={colors.primary} name="chevron-forward" size={18} />
                  ) : null}
                </View>
                {notification.body ? <Text style={styles.body}>{notification.body}</Text> : null}
                {!notification.proposalReference ? (
                  <Text style={styles.unavailableText}>Proposal link unavailable for this older notification.</Text>
                ) : null}
                <Text style={styles.timestamp}>{formatDateTime(new Date(notification.createdAt))}</Text>
              </Card>
            </Pressable>
          ))}
          {currentPage < lastPage ? (
            <AppButton
              label="Load more"
              loading={isLoadingMore}
              onPress={() => void loadNotifications(currentPage + 1)}
              style={styles.loadMoreButton}
              variant="secondary"
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headingCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: spacing.md,
    color: colors.textMuted,
  },
  markAllButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  notificationCard: {
    marginBottom: spacing.sm,
  },
  unreadNotificationCard: {
    borderColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  notificationTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  unavailableText: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  timestamp: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: spacing.sm,
    color: colors.danger,
    fontSize: 13,
  },
  loadMoreButton: {
    marginTop: spacing.xs,
  },
});
