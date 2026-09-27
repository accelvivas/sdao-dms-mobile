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
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { config } from '../../constants/config';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import { getReviewQueue } from '../../services/documentService';
import { getUnreadReviewNotificationCount } from '../../services/notificationService';
import { addNotificationReceivedListener } from '../../services/pushNotificationService';
import type { Document } from '../../types/document';
import { getApiErrorStatus } from '../../utils/apiError';

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
  const firstName = user?.name?.split(' ')[0] ?? 'Officer';

  const refreshNotificationCount = useCallback(async () => {
    if (!config.notificationsEnabled) {
      setNotificationCount(0);
      return;
    }

    try {
      setNotificationCount(await getUnreadReviewNotificationCount());
    } catch (error: unknown) {
      if (getApiErrorStatus(error) === 401) {
        void logout();
      }
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
      let isFocused = true;
      setIsLoading(true);

      getReviewQueue()
        .then((items) => {
          if (isFocused) {
            setDocuments(items.filter((document) => document.permissions.can_act));
          }
        })
        .catch((error: unknown) => {
          if (!isFocused) return;
          if (getApiErrorStatus(error) === 401) {
            void logout();
            return;
          }
          setDocuments([]);
        })
        .finally(() => {
          if (isFocused) {
            setIsLoading(false);
          }
        });

      if (config.notificationsEnabled) {
        getUnreadReviewNotificationCount()
          .then((count) => {
            if (isFocused) setNotificationCount(count);
          })
          .catch((error: unknown) => {
            if (!isFocused) return;
            if (getApiErrorStatus(error) === 401) {
              void logout();
            }
          });
      }

      return () => {
        isFocused = false;
      };
    }, [logout]),
  );

  return (
    <Screen scroll>
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
            style={styles.notificationButton}
          >
            <Ionicons color={colors.primary} name="notifications-outline" size={23} />
            {notificationCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.subtitle}>Review Activity Proposals from your phone.</Text>

      <View style={styles.stats}>
        <View style={[styles.stat, styles.statPrimary]}>
          <Text style={styles.statNumber}>{documents.length}</Text>
          <Text style={styles.statLabelLight}>Proposals awaiting review</Text>
        </View>
      </View>

      <SectionHeader title="Activity Proposals needing attention" />
      <Card>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading queue...</Text>
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>No Activity Proposals are waiting.</Text>
        ) : (
          documents.map((document, index) => (
            <View key={document.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <DocumentRow
                document={document}
                onPress={() =>
                  navigation.navigate('DocumentReview', { documentId: document.id })
                }
                showSubmitter
              />
            </View>
          ))
        )}
      </Card>
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
    marginLeft: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  kicker: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  hello: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  statLabelLight: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.8)',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    paddingVertical: 8,
  },
});
