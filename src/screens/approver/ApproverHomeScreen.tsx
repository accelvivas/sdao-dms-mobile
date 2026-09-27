import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../components/Card';
import { DocumentRow } from '../../components/DocumentRow';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { config } from '../../constants/config';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import { getReviewQueue } from '../../services/documentService';
import { getUnreadReviewNotificationCount } from '../../services/notificationService';
import { addNotificationReceivedListener } from '../../services/pushNotificationService';
import type { Document } from '../../types/document';
import { getApiErrorMessage, getApiErrorStatus } from '../../utils/apiError';

export default function ApproverHomeScreen() {
  const { user, logout } = useAuth();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<ApproverTabParamList, 'ApproverHome'>,
        NativeStackNavigationProp<ApproverStackParamList>
      >
    >();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const firstName = user?.name?.split(' ')[0] ?? 'Officer';

  const refreshNotificationCount = useCallback(async () => {
    if (!config.notificationsEnabled) {
      setNotificationCount(0);
      return;
    }

    try {
      setNotificationCount(await getUnreadReviewNotificationCount());
    } catch (caught: unknown) {
      if (getApiErrorStatus(caught) === 401) {
        void logout();
      }
    }
  }, [logout]);

  const loadQueue = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError('');
      const items = await getReviewQueue();
      setDocuments(items.filter((document) => document.permissions.can_act));
    } catch (caught: unknown) {
      if (getApiErrorStatus(caught) === 401) {
        await logout();
        return;
      }
      setError(getApiErrorMessage(
        caught,
        'Unable to load Activity Proposals. Please try again.',
      ));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [logout]);

  useEffect(() => {
    const subscription = addNotificationReceivedListener(() => {
      void refreshNotificationCount();
    });
    return () => subscription?.remove();
  }, [refreshNotificationCount]);

  useFocusEffect(
    useCallback(() => {
      void loadQueue();
      void refreshNotificationCount();
    }, [loadQueue, refreshNotificationCount]),
  );

  function refreshHome() {
    void loadQueue(true);
    void refreshNotificationCount();
  }

  return (
    <Screen onRefresh={refreshHome} refreshing={isRefreshing} scroll>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.kicker}>Approver portal</Text>
          <Text style={styles.hello}>Welcome, {firstName}</Text>
        </View>
        {config.notificationsEnabled ? (
          <Pressable
            accessibilityLabel={`Review notifications${notificationCount ? `, ${notificationCount} available` : ''}`}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ReviewNotifications')}
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primary} name="notifications-outline" size={22} />
            {notificationCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.subtitle}>Review Activity Proposals from your phone.</Text>

      <Card style={styles.reviewSummary}>
        <View>
          <Text style={styles.summaryLabel}>Awaiting Review</Text>
          <Text style={styles.summaryDescription}>Activity Proposals</Text>
        </View>
        <Text style={styles.summaryValue}>{isLoading ? '—' : documents.length}</Text>
      </Card>

      <SectionHeader title="Pending Your Review" />

      {isLoading ? (
        <Card>
          <EmptyState
            icon="hourglass-outline"
            loading
            message="Fetching proposals assigned to you."
            title="Loading proposals"
          />
        </Card>
      ) : error ? (
        <Card>
          <EmptyState
            actionLabel="Try Again"
            icon="alert-circle-outline"
            message={error}
            onAction={() => void loadQueue()}
            title="Unable to load proposals"
          />
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <EmptyState
            icon="checkmark-circle-outline"
            message="No Activity Proposals are waiting for your review."
            title="You're all caught up"
          />
        </Card>
      ) : (
        <Card>
          {documents.map((document, index) => (
            <View key={document.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <DocumentRow
                document={document}
                onPress={() => navigation.navigate('DocumentReview', { documentId: document.id })}
                showSubmitter
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingCopy: {
    flex: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  kicker: {
    color: colors.accent,
    ...typography.label,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  hello: {
    marginTop: spacing.xxs,
    color: colors.text,
    ...typography.pageTitle,
  },
  subtitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
    color: colors.textMuted,
    ...typography.supporting,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  summaryLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDescription: {
    marginTop: spacing.xxs,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
  },
  summaryValue: {
    marginLeft: spacing.md,
    color: colors.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
