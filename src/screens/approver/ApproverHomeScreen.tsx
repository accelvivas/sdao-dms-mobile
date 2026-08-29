import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Card } from '../../components/Card';
import { DocumentRow } from '../../components/DocumentRow';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { mockQueue } from '../../constants/mockData';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type {
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';

export default function ApproverHomeScreen() {
  const { user } = useAuth();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<ApproverTabParamList, 'ApproverHome'>,
        NativeStackNavigationProp<ApproverStackParamList>
      >
    >();
  const firstName = user?.name?.split(' ')[0] ?? 'Officer';

  return (
    <Screen scroll>
      <Text style={styles.kicker}>Approver portal</Text>
      <Text style={styles.hello}>Welcome, {firstName}</Text>
      <Text style={styles.subtitle}>Review queued student document requests.</Text>

      <View style={styles.stats}>
        <View style={[styles.stat, styles.statPrimary]}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabelLight}>Waiting in queue</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons color={colors.primary} name="checkmark-done-outline" size={20} />
          <Text style={styles.statNumberDark}>12</Text>
          <Text style={styles.statLabel}>Reviewed today</Text>
        </View>
      </View>

      <SectionHeader title="Needs attention" />
      <Card>
        {mockQueue.map((document, index) => (
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
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  statNumberDark: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  statLabelLight: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.8)',
  },
  statLabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
