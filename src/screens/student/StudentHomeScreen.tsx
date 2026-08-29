import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import type {
  StudentStackParamList,
  StudentTabParamList,
} from '../../navigation/StudentNavigator';
import { getMyDocuments } from '../../services/documentService';
import type { Document } from '../../types/document';

const stats = [
  { label: 'Pending', value: '2', icon: 'time-outline' as const },
  { label: 'In review', value: '1', icon: 'search-outline' as const },
  { label: 'Approved', value: '8', icon: 'checkmark-circle-outline' as const },
];

export default function StudentHomeScreen() {
  const { user } = useAuth();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<StudentTabParamList, 'StudentHome'>,
        NativeStackNavigationProp<StudentStackParamList>
      >
    >();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    let isMounted = true;

    getMyDocuments()
      .then((items) => {
        if (isMounted) {
          setDocuments(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDocuments([]);
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
      <Text style={styles.kicker}>Student portal</Text>
      <Text style={styles.hello}>Hello, {firstName}</Text>
      <Text style={styles.subtitle}>Track your SDAO document requests here.</Text>

      <View style={styles.stats}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <Ionicons color={colors.primary} name={item.icon} size={18} />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Ionicons color={colors.accent} name="add-circle" size={22} />
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Need a new request?</Text>
          <Text style={styles.bannerText}>
            Submit requests from the web system. This app is for tracking and
            updates.
          </Text>
        </View>
      </Pressable>

      <SectionHeader
        actionLabel="See all"
        onAction={() => navigation.navigate('MyDocuments')}
        title="Recent documents"
      />
      <Card>
        {isLoading ? (
          <Text style={styles.emptyText}>Loading recent documents...</Text>
        ) : documents.length === 0 ? (
          <Text style={styles.emptyText}>No recent documents found.</Text>
        ) : (
          documents.slice(0, 3).map((document, index) => (
            <View key={document.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <DocumentRow
                document={document}
                onPress={() =>
                  navigation.navigate('DocumentStatus', { documentId: document.id })
                }
              />
            </View>
          ))
        )}
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
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  banner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 24,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCopy: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  bannerText: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 19,
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
