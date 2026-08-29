import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { mockNotifications } from '../../constants/mockData';
import { colors, radius } from '../../constants/theme';
import { formatDateTime } from '../../utils/date';

export default function NotificationsScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Notifications</Text>
      <Text style={styles.subtitle}>Sample updates for document activity.</Text>

      <View style={styles.list}>
        {mockNotifications.map((item) => (
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
        ))}
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
});
