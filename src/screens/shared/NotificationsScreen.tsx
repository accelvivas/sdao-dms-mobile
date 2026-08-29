import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { colors, radius } from '../../constants/theme';
import { getNotifications } from '../../services/notificationService';
import type { AppNotification } from '../../services/notificationService';
import { formatDateTime } from '../../utils/date';

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getNotifications()
      .then((notifications) => {
        if (isMounted) {
          setItems(notifications);
        }
      })
      .catch(() => {
        if (isMounted) {
          setItems([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Screen scroll>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Updates for document activity.</Text>

      <View style={styles.list}>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading notifications...</Text>
        ) : items.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        ) : (
          items.map((item) => (
            <Card key={item.id} style={styles.item}>
              <View style={styles.row}>
                {!item.read ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
                <View style={styles.copy}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: colors.textMuted,
  },
  list: {
    gap: 10,
  },
  item: {
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  dotSpacer: {
    width: 8,
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 15,
  },
  body: {
    marginTop: 4,
    color: colors.textMuted,
    lineHeight: 20,
  },
  time: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyText: {
    color: colors.textMuted,
    paddingVertical: 8,
  },
});
