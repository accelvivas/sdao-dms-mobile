import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  ApproverStackParamList,
  ApproverTabParamList,
} from '../../navigation/ApproverNavigator';
import { getReviewQueue } from '../../services/documentService';
import type { Document } from '../../types/document';

export default function ApproverHomeScreen() {
  const { user } = useAuth();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<ApproverTabParamList, 'ApproverHome'>,
        NativeStackNavigationProp<ApproverStackParamList>
      >
    >();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstName = user?.name?.split(' ')[0] ?? 'Officer';

  useEffect(() => {
    let isMounted = true;

    getReviewQueue()
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
      <Text style={styles.kicker}>Approver portal</Text>
      <Text style={styles.hello}>Welcome, {firstName}</Text>
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
